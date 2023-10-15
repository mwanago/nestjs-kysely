import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Comment } from './comment.model';
import { CommentDto } from './comment.dto';
import { Database } from '../database/database';
import { sql } from 'kysely';
import { PostgresErrorCode } from '../database/postgresErrorCode.enum';
import { isDatabaseError } from '../types/databaseError';

@Injectable()
export class CommentsRepository {
  constructor(private readonly database: Database) {}

  async getAll() {
    const databaseResponse = await this.database
      .selectFrom('comments')
      .where('deleted_at', 'is', null)
      .selectAll()
      .execute();
    return databaseResponse.map((comment) => new Comment(comment));
  }

  async getById(id: number) {
    const databaseResponse = await this.database
      .selectFrom('comments')
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .selectAll()
      .executeTakeFirst();

    if (!databaseResponse || databaseResponse.deleted_at) {
      throw new NotFoundException();
    }

    return new Comment(databaseResponse);
  }

  async create(commentData: CommentDto, authorId: number) {
    try {
      const databaseResponse = await this.database
        .insertInto('comments')
        .values({
          content: commentData.content,
          author_id: authorId,
          article_id: commentData.articleId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return new Comment(databaseResponse);
    } catch (error) {
      if (
        isDatabaseError(error) &&
        error.code === PostgresErrorCode.ForeignKeyViolation
      ) {
        throw new BadRequestException('Article not found');
      }
      throw error;
    }
  }

  async update(id: number, commentData: CommentDto) {
    const databaseResponse = await this.database
      .updateTable('comments')
      .set({
        content: commentData.content,
        article_id: commentData.articleId,
      })
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .returningAll()
      .executeTakeFirst();

    if (!databaseResponse) {
      throw new NotFoundException();
    }
    return new Comment(databaseResponse);
  }

  async delete(id: number) {
    const databaseResponse = await this.database
      .updateTable('comments')
      .set({
        deleted_at: sql`now()`,
      })
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .returningAll()
      .executeTakeFirst();

    if (!databaseResponse) {
      throw new NotFoundException();
    }
    return new Comment(databaseResponse);
  }

  async restore(id: number) {
    const databaseResponse = await this.database
      .updateTable('comments')
      .set({
        deleted_at: null,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!databaseResponse) {
      throw new NotFoundException();
    }
    return new Comment(databaseResponse);
  }
}
