import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto, SignupDto } from './dtos/auth.dto';
import { shortString } from 'starknet';
import { ContractsService } from '../../contracts/contracts.service';
import { WalletService } from '../wallets/wallet.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventListeners } from '@/common/constants';
import { UserVerificationService } from '../users/user-verification.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private contractsService: ContractsService,
    private walletService: WalletService,
    private userVerificationService: UserVerificationService,
    @InjectQueue('wallet-queue') private walletQueue: Queue,
  ) {}

  async signup(body: SignupDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { username: body.username },
    });
    if (existingUser) {
      throw new UnauthorizedException('Username already taken');
    }

    const existingEmail = await this.usersRepository.findOne({
      where: { email: body.email },
    });
    if (existingEmail) {
      throw new UnauthorizedException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = this.usersRepository.create({
      username: body.username,
      password: hashedPassword,
      ...(body.address && { address: body.address }),
      ...(body.email && { email: body.email }),
      is_verified: false,
    });
    const res = await this.usersRepository.save(user);

    // Create verification token
    const verification =
      await this.userVerificationService.createVerificationToken(
        res.id,
        'verify-email',
      );

    // Send verification email (non-blocking)
    this.eventEmitter.emit(eventListeners.USER_VERIFICATION_SENT, {
      user: res,
      token: verification.token,
    });

    return {
      message:
        'User created successfully. Please check your email to verify your account.',
      userId: res.id,
    };
  }

  async login(body: LoginDto) {
    // Try to find user by username or email
    const user = await this.usersRepository.findOne({
      where: [{ username: body.identifier }, { email: body.identifier }],
    });

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_verified) {
      try {
        // Try to create or resend verification token
        const verification =
          await this.userVerificationService.createVerificationToken(
            user.id,
            'verify-email',
          );

        this.eventEmitter.emit(eventListeners.USER_VERIFICATION_SENT, {
          user,
          token: verification.token,
        });

        // throw new UnauthorizedException(
        //   `Your account is not verified. A verification email has been sent to ${user.email}. Please check your email and verify your account.`,
        // );

        // return specific stuff frontend can catch instead
        const response = {
          code: 412,
          message: 'verify your account',
          details: `Your account is not verified. A verification email has been sent to ${user.email}. Please check your email and verify your account.`,
          userId: user.id,
        };

        // Debug logging to verify userId is included
        console.log(
          '[AuthService] Returning 412 response with userId:',
          response.userId,
          'Full response:',
          response,
        );

        return response;
      } catch (error) {
        if (error instanceof BadRequestException) {
          // Max retries exceeded
          throw new UnauthorizedException(
            'Your account is not verified and maximum verification attempts exceeded. Please contact support.',
          );
        }
        throw error;
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      address: user.address,
    };
    const token = await this.jwtService.signAsync(payload);

    return { user: payload, token };
  }

  async verifyEmail(userId: number, token: string) {
    const user = await this.userVerificationService.verifyToken(
      userId,
      token,
      'verify-email',
    );

    // Trigger wallet creation after successful email verification
    await this.walletQueue.add(
      'create-wallet',
      { user },
      {
        attempts: 3,
        backoff: 5000,
      },
    );

    // Emit event for any other post-verification actions
    this.eventEmitter.emit(eventListeners.USER_EMAIL_VERIFIED, {
      user,
    });

    // Generate JWT token for automatic login after verification
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      address: user.address,
    };
    const jwtToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Email verified successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        address: user.address,
      },
      token: jwtToken,
    };
  }

  async resendVerification(userId: number) {
    const verification =
      await this.userVerificationService.resendVerification(userId);

    this.eventEmitter.emit(eventListeners.USER_VERIFICATION_SENT, {
      user: await this.usersRepository.findOne({ where: { id: userId } }),
      token: verification.token,
    });

    return {
      message: 'Verification email sent successfully',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message:
          'If an account with that email exists, a password reset code has been sent.',
      };
    }

    const verification =
      await this.userVerificationService.createVerificationToken(
        user.id,
        'forgot-password',
      );

    this.eventEmitter.emit(eventListeners.USER_PASSWORD_RESET_SENT, {
      user,
      token: verification.token,
    });

    return {
      message:
        'If an account with that email exists, a password reset code has been sent.',
      userId: user.id, // Return userId so frontend can use it for reset
    };
  }

  async resetPassword(userId: number, token: string, newPassword: string) {
    const user = await this.userVerificationService.verifyToken(
      userId,
      token,
      'forgot-password',
    );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.usersRepository.save(user);

    return {
      message:
        'Password reset successfully. You can now login with your new password.',
    };
  }
}
