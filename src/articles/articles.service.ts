import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleDto } from './dto/article.dto';
import { ArticlesRepository } from './articles.repository';

@Injectable()
export class ArticlesService {
  constructor(private readonly articlesRepository: ArticlesRepository) {}

  getAll(authorId?: number) {
    if (authorId) {
      return this.articlesRepository.getByAuthorId(authorId);
    }
    return this.articlesRepository.getAll();
  }

  async getById(id: number) {
    const article = await this.articlesRepository.getById(id);

    if (!article) {
      throw new NotFoundException();
    }

    return article;
  }

  async create(data: ArticleDto, authorId: number) {
    return this.articlesRepository.create(data, authorId);
  }

  async update(id: number, data: ArticleDto) {
    const article = await this.articlesRepository.update(id, data);

    if (!article) {
      throw new NotFoundException();
    }

    return article;
  }

  async delete(id: number) {
    const article = await this.articlesRepository.delete(id);

    if (!article) {
      throw new NotFoundException();
    }

    return article;
  }
}
