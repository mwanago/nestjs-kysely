import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class ArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsNumber({}, { each: true })
  categoryIds?: number[];
}
