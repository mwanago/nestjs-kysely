import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class ArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  paragraphs: string[];

  @IsOptional()
  @IsNumber({}, { each: true })
  categoryIds?: number[];
}
