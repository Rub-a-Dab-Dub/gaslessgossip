import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/files.entity';
import { Repository } from 'typeorm';
import { R2Service } from '@/infrastructure/bucket/core/r2';
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/application/users/entities/user.entity';
@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly r2;
  constructor(
    private readonly r2Service: R2Service,
    @InjectRepository(File) private fileRepository: Repository<File>,
  ) {
    this.r2 = this.r2Service.exposeR2Credentials();
  }

  async uploadFile(file: any, uploader: User | { userId: number }) {
    const bucket = this.r2Service.getBucketName();
    const key = `${Date.now()}_${uuidv4()}_${file.originalname}`;

    await this.r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      }),
    );

    // generate a signed url valid for 7 days
    const signedUrl = await getSignedUrl(
      this.r2,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: 60 * 60 * 24 * 7 },
    );

    // Get the userId from either a User entity or a JWT payload
    const uploaderId = 'userId' in uploader ? uploader.userId : uploader.id;

    const fileEntity = this.fileRepository.create({
      filename: file.originalname,
      url: signedUrl,
      storageKey: key,
      mimetype: file.mimetype,
      size: file.size,
      uploader: { id: uploaderId } as User,
    });

    const saved = await this.fileRepository.save(fileEntity);

    return saved;
  }

  async getFileSignedUrl(id: number) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    const bucket = this.r2Service.getBucketName();
    return await getSignedUrl(
      this.r2,
      new GetObjectCommand({ Bucket: bucket, Key: file.storageKey }),
      { expiresIn: 60 * 60 * 24 * 7 },
    );
  }

  async listFilesByUser(userId: number) {
    return this.fileRepository.find({ where: { uploader: { id: userId } } });
  }

  async deleteFile(id: number) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    const bucket = this.r2Service.getBucketName();
    await this.r2.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: file.storageKey }),
    );
    await this.fileRepository.remove(file);
    return { deleted: true };
  }
}
