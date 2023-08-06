import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { Database } from '../database/database';

@Controller('articles')
@UseInterceptors(ClassSerializerInterceptor)
export class ArticlesController {
  constructor(private readonly database: Database) {}

  @Get()
  async getCategories() {
    return this.database.selectFrom('articles').selectAll().execute();
  }
}
