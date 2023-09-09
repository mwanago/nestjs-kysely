import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getByEmail(email: string) {
    const user = await this.usersRepository.getByEmail(email);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async getById(id: number) {
    const user = await this.usersRepository.getById(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async create(user: CreateUserDto) {
    if (user.address) {
      return await this.usersRepository.createWithAddress(user);
    }
    return await this.usersRepository.create(user);
  }
}
