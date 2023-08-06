import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesRepository } from './articles.repository';

@Module({
  imports: [],
  controllers: [ArticlesController],
  providers: [ArticlesRepository],
})
export class ArticlesModule {}
