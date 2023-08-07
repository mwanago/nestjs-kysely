import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { ArticlesRepository } from './articles.repository';
import FindOneParams from '../utils/findOneParams';
import ArticleDto from './dto/article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesRepository: ArticlesRepository) {}

  @Get()
  getAll() {
    return this.articlesRepository.getAll();
  }

  @Get(':id')
  getById(@Param() { id }: FindOneParams) {
    return this.articlesRepository.getById(id);
  }

  @Post()
  create(@Body() data: ArticleDto) {
    return this.articlesRepository.create(data);
  }

  @Put(':id')
  update(@Param() { id }: FindOneParams, @Body() data: ArticleDto) {
    return this.articlesRepository.update(id, data);
  }
}
