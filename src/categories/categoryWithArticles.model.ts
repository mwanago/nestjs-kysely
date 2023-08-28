import { Category, CategoryModelData } from './category.model';
import { Article, ArticleModelData } from '../articles/article.model';

export interface CategoryWithArticlesModelData extends CategoryModelData {
  articles: ArticleModelData[];
}
class CategoryWithArticles extends Category {
  articles: Article[];
  constructor(categoryData: CategoryWithArticlesModelData) {
    super(categoryData);
    this.articles = categoryData.articles.map((articleData) => {
      return new Article(articleData);
    });
  }
}

export default CategoryWithArticles;
