import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsNumber()
  parent_id?: number;
}


export class EditCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
