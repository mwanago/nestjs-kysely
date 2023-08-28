import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  getAll() {
    return this.categoriesRepository.getAll();
  }

  async getById(id: number) {
    const category = await this.categoriesRepository.getWithArticles(id);

    if (!category) {
      throw new NotFoundException();
    }

    return category;
  }

  async create(data: CategoryDto) {
    return this.categoriesRepository.create(data);
  }

  async update(id: number, data: CategoryDto) {
    const category = await this.categoriesRepository.update(id, data);

    if (!category) {
      throw new NotFoundException();
    }

    return category;
  }

  async delete(id: number) {
    const category = await this.categoriesRepository.delete(id);

    if (!category) {
      throw new NotFoundException();
    }

    return category;
  }
}
