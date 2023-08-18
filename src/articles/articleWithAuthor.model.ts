import { Article, ArticleModelData } from './article.model';
import { User } from '../users/user.model';
import { Type } from 'class-transformer';

interface ArticleWithAuthorModelData extends ArticleModelData {
  user_id: number;
  user_email: string;
  user_name: string;
  user_password: string;
  address_id: number | null;
  address_street: string | null;
  address_city: string | null;
  address_country: string | null;
}
export class ArticleWithAuthorModel extends Article {
  @Type(() => User)
  author: User;
  constructor(articleData: ArticleWithAuthorModelData) {
    super(articleData);
    this.author = new User({
      id: articleData.user_id,
      email: articleData.user_email,
      name: articleData.user_name,
      password: articleData.user_password,
      address_city: articleData.address_city,
      address_country: articleData.address_country,
      address_street: articleData.address_street,
      address_id: articleData.address_id,
    });
  }
}
