import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsISO8601,
} from 'class-validator';

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

  @IsISO8601({
    strict: true,
  })
  @IsOptional()
  scheduledDate?: string;
}
