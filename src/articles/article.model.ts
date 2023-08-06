interface ArticleModelData {
  id: number;
  title: string;
  article_content: string;
}

export class Article {
  id: number;
  title: string;
  content: string;
  constructor({ id, title, article_content }: ArticleModelData) {
    this.id = id;
    this.title = title;
    this.content = article_content;
  }
}
