import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';

@Module({
  imports: [],
  controllers: [ArticlesController],
  providers: [],
})
export class ArticlesModule {}
