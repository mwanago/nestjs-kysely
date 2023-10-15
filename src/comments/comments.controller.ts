import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import FindOneParams from '../utils/findOneParams';
import { CommentsService } from './comments.service';
import { CommentDto } from './comment.dto';
import { JwtAuthenticationGuard } from '../authentication/jwt-authentication.guard';
import { RequestWithUser } from '../authentication/requestWithUser.interface';

@Controller('comments')
@UseInterceptors(ClassSerializerInterceptor)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  getAll() {
    return this.commentsService.getAll();
  }

  @Get(':id')
  getById(@Param() { id }: FindOneParams) {
    return this.commentsService.getBytId(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthenticationGuard)
  update(@Param() { id }: FindOneParams, @Body() commentData: CommentDto) {
    return this.commentsService.update(id, commentData);
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  create(@Body() commentData: CommentDto, @Req() request: RequestWithUser) {
    return this.commentsService.create(commentData, request.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  async delete(@Param() { id }: FindOneParams) {
    await this.commentsService.delete(id);
  }
}
