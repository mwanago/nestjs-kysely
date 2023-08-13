import { BadRequestException } from '@nestjs/common';

export class UserAlreadyExistsException extends BadRequestException {
  constructor(email: string) {
    super(`User with ${email} email already exists`);
  }
}
