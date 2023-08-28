import { Article, ArticleModelData } from './article.model';

export interface ArticleWithCategoryIdsModelData extends ArticleModelData {
  category_ids?: number[];
}

export class ArticleWithCategoryIds extends Article {
  categoryIds: number[];
  constructor(articleData: ArticleWithCategoryIdsModelData) {
    super(articleData);
    this.categoryIds = articleData.category_ids ?? [];
  }
}
