import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import FindOneParams from '../utils/findOneParams';
import ArticleDto from './dto/article.dto';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  getAll() {
    return this.articlesService.getAll();
  }

  @Get(':id')
  getById(@Param() { id }: FindOneParams) {
    return this.articlesService.getById(id);
  }

  @Post()
  create(@Body() data: ArticleDto) {
    return this.articlesService.create(data);
  }

  @Put(':id')
  update(@Param() { id }: FindOneParams, @Body() data: ArticleDto) {
    return this.articlesService.update(id, data);
  }
}
