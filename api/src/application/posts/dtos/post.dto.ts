import { IsOptional, IsString, IsArray, ArrayNotEmpty, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [String] })
  medias?: string[];

  @IsOptional()
  isAnonymous?: boolean | string;
}

export class EditPostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  medias?: string[];
}
