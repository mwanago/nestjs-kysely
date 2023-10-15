import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  articleId: number;
}
