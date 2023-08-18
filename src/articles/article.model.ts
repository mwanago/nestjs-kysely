interface ArticleModelData {
  id: number;
  title: string;
  article_content: string;
  author_id: number;
}

export class Article {
  id: number;
  title: string;
  content: string;
  authorId: number;
  constructor({ id, title, article_content, author_id }: ArticleModelData) {
    this.id = id;
    this.title = title;
    this.content = article_content;
    this.authorId = author_id;
  }
}
