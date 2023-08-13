import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UsersRepository } from './users.repository';
import { isRecord } from '../utils/isRecord';
import { PostgresErrorCode } from '../database/postgresErrorCode.enum';
import { UserAlreadyExistsException } from './exceptions/userAlreadyExists.exception';

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
    try {
      if (user.address) {
        return await this.usersRepository.createWithAddress(user);
      }
      return await this.usersRepository.create(user);
    } catch (error: unknown) {
      if (isRecord(error) && error.code === PostgresErrorCode.UniqueViolation) {
        throw new UserAlreadyExistsException(user.email);
      }
      throw error;
    }
  }
}
