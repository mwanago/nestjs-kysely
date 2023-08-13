import { Exclude } from 'class-transformer';

interface UserModelData {
  id: number;
  email: string;
  name: string;
  password: string;
}

export class User {
  id: number;
  email: string;
  name: string;
  @Exclude({ toPlainOnly: true })
  password: string;
  constructor({ id, email, name, password }: UserModelData) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
  }
}
