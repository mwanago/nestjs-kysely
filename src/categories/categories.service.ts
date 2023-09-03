import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  getAll() {
    return this.categoriesRepository.getAll();
  }

  getById(id: number) {
    return this.categoriesRepository.getWithArticles(id);
  }

  create(data: CategoryDto) {
    return this.categoriesRepository.create(data);
  }

  update(id: number, data: CategoryDto) {
    return this.categoriesRepository.update(id, data);
  }

  delete(id: number) {
    return this.categoriesRepository.delete(id);
  }
}
