import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class GetArticlesByAuthorQuery {
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => Number(value))
  authorId?: number;
}
