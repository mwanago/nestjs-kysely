import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { FindOneParams } from '../utils/findOneParams';
import { ArticleDto } from './dto/article.dto';
import { ArticlesService } from './articles.service';
import { JwtAuthenticationGuard } from '../authentication/jwt-authentication.guard';
import { RequestWithUser } from '../authentication/requestWithUser.interface';
import { GetArticlesByAuthorQuery } from './getArticlesByAuthorQuery';
import { PaginationParams } from './dto/paginationParams.dto';

@Controller('articles')
@UseInterceptors(ClassSerializerInterceptor)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  getAll(
    @Query() { authorId }: GetArticlesByAuthorQuery,
    @Query() { offset, limit, idsToSkip }: PaginationParams,
  ) {
    return this.articlesService.getAll(authorId, offset, limit, idsToSkip);
  }

  @Get(':id')
  getById(@Param() { id }: FindOneParams) {
    return this.articlesService.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  create(@Body() data: ArticleDto, @Req() request: RequestWithUser) {
    return this.articlesService.create(data, request.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthenticationGuard)
  update(@Param() { id }: FindOneParams, @Body() data: ArticleDto) {
    return this.articlesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  async delete(@Param() { id }: FindOneParams) {
    await this.articlesService.delete(id);
  }
}
