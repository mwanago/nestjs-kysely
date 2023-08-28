export interface CategoryModelData {
  id: number;
  name: string;
}

export class Category {
  id: number;
  name: string;
  constructor({ id, name }: CategoryModelData) {
    this.id = id;
    this.name = name;
  }
}
