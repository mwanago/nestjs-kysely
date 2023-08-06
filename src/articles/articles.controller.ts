import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ArticlesRepository } from './articles.repository';
import FindOneParams from '../utils/findOneParams';

@Controller('articles')
@UseInterceptors(ClassSerializerInterceptor)
export class ArticlesController {
  constructor(private readonly articlesRepository: ArticlesRepository) {}

  @Get()
  async getAll() {
    return this.articlesRepository.getAll();
  }

  @Get(':id')
  async getById(@Param() { id }: FindOneParams) {
    return this.articlesRepository.getById(id);
  }
}
