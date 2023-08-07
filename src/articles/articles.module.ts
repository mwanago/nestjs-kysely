import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesRepository } from './articles.repository';
import { ArticlesService } from './articles.service';

@Module({
  imports: [],
  controllers: [ArticlesController],
  providers: [ArticlesRepository, ArticlesService],
})
export class ArticlesModule {}
