import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({ description: 'File id' })
  id: number;

  @ApiProperty({ description: 'Original filename' })
  filename: string;

  @ApiProperty({ description: 'Signed URL' })
  url: string;

  @ApiProperty({ description: 'Storage key in R2' })
  storageKey: string;

  @ApiProperty({ description: 'MIME type' })
  mimetype: string;

  @ApiProperty({ description: 'Size in bytes' })
  size: number;

  @ApiProperty({ description: 'Upload timestamp' })
  uploadedAt: Date;
}
