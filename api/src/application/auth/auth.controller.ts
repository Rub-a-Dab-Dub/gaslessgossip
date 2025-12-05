import {
  Body,
  Controller,
  Post,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  SignupDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dtos/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user account',
    description:
      'Creates a new user account and sends a verification email with a 6-digit code. The code expires in 5 minutes.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created. Verification email sent.',
    schema: {
      example: {
        message:
          'User created successfully. Please check your email to verify your account.',
        userId: 1,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Username already exists.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Username already taken',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'email already taken.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Email already taken',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data.',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be an email',
          'password must be at least 8 characters',
        ],
        error: 'Bad Request',
      },
    },
  })
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login to user account',
    description:
      'Authenticate user with username/email and password. Returns JWT token if account is verified. If unverified, sends a new verification code.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns user data and JWT token.',
    schema: {
      example: {
        user: {
          sub: 1,
          email: 'john.doe@example.com',
          username: 'johndoe',
          address: '0x1234567890abcdef',
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 412,
    description: 'Account not verified. Verification email sent.',
    schema: {
      example: {
        code: 412,
        message: 'verify your account',
        details:
          'Your account is not verified. A verification email has been sent to your email. Please check your email and verify your account.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Invalid credentials or maximum verification attempts exceeded.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  async login(@Body() body: LoginDto) {
    const result = await this.authService.login(body);

    // If the service returns a 412 code, the interceptor will handle wrapping it
    // and preserving the userId. We just return the result and let NestJS handle it.
    // The interceptor will detect code: 412 and preserve all fields including userId.
    return result;
  }

  @Post('verify-email/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify user email address',
    description:
      'Verify email using the 6-digit code sent to the user. The code must be used within 5 minutes.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to verify',
    example: 1,
    type: Number,
  })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description:
      'Email verified successfully. Returns user data and JWT token for automatic login.',
    schema: {
      example: {
        message: 'Email verified successfully',
        user: {
          id: 1,
          username: 'johndoe',
          email: 'john.doe@example.com',
          address: '0x1234567890abcdef',
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid or expired verification token.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Invalid or expired verification token',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Verification token has expired.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Verification token has expired. Please request a new one.',
        error: 'Bad Request',
      },
    },
  })
  verifyEmail(@Param('userId') userId: string, @Body('token') token: string) {
    return this.authService.verifyEmail(+userId, token);
  }

  @Post('resend-verification/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend verification email',
    description:
      'Resend verification code to user email. Limited to 3 attempts per hour.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to resend verification for',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully.',
    schema: {
      example: {
        message: 'Verification email sent successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User already verified or maximum retry limit reached.',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Maximum retry limit reached. Please try again after 1 hour or contact support.',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  resendVerification(@Param('userId') userId: string) {
    return this.authService.resendVerification(+userId);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Send a 6-digit password reset code to user email. The code expires in 5 minutes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if account exists.',
    schema: {
      example: {
        message:
          'If an account with that email exists, a password reset code has been sent.',
        userId: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format or maximum retry limit reached.',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Maximum retry limit reached. Please try again after 1 hour or contact support.',
        error: 'Bad Request',
      },
    },
  })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset user password',
    description:
      'Reset password using the 6-digit code sent to email. Requires userId to ensure security.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID for password reset',
    example: 1,
    type: Number,
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
    schema: {
      example: {
        message:
          'Password reset successfully. You can now login with your new password.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid or expired reset token.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Invalid or expired verification token',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token expired or invalid password format.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Verification token has expired. Please request a new one.',
        error: 'Bad Request',
      },
    },
  })
  resetPassword(
    @Param('userId') userId: string,
    @Body() body: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(
      +userId,
      body.token,
      body.newPassword,
    );
  }
}
