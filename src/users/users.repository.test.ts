import { CreateUserDto } from './dto/createUser.dto';
import { Test } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { User, UserModelData } from './user.model';
import { DatabaseError } from '../types/databaseError';
import { PostgresErrorCode } from '../database/postgresErrorCode.enum';
import { Database } from '../database/database';
import { BadRequestException } from '@nestjs/common';

describe('The UsersRepository class', () => {
  let executeTakeFirstOrThrowMock: jest.Mock;
  let createUserData: CreateUserDto;
  let usersRepository: UsersRepository;
  beforeEach(async () => {
    createUserData = {
      name: 'John',
      email: 'john@smith.com',
      password: 'strongPassword123',
    };
    executeTakeFirstOrThrowMock = jest.fn();
    const module = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: Database,
          useValue: {
            insertInto: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            returningAll: jest.fn().mockReturnThis(),
            executeTakeFirstOrThrow: executeTakeFirstOrThrowMock,
          },
        },
      ],
    }).compile();

    usersRepository = await module.get(UsersRepository);
  });
  describe('when the create method is called', () => {
    describe('and the database returns valid data', () => {
      let userModelData: UserModelData;
      beforeEach(() => {
        userModelData = {
          id: 1,
          name: 'John',
          email: 'john@smith.com',
          password: 'strongPassword123',
          address_id: null,
          address_street: null,
          address_city: null,
          address_country: null,
        };
        executeTakeFirstOrThrowMock.mockResolvedValue(userModelData);
      });
      it('should return an instance of the UserModel', async () => {
        const result = await usersRepository.create(createUserData);

        expect(result instanceof User).toBe(true);
      });
      it('should return the UserModel with correct properties', async () => {
        const result = await usersRepository.create(createUserData);

        expect(result.id).toBe(userModelData.id);
        expect(result.email).toBe(userModelData.email);
        expect(result.name).toBe(userModelData.name);
        expect(result.password).toBe(userModelData.password);
        expect(result.address).not.toBeDefined();
      });
    });
    describe('and the database throws the UniqueViolation', () => {
      beforeEach(() => {
        const databaseError: DatabaseError = {
          code: PostgresErrorCode.UniqueViolation,
          table: 'users',
          detail: 'Key (email)=(john@smith.com) already exists.',
        };
        executeTakeFirstOrThrowMock.mockImplementation(() => {
          throw databaseError;
        });
      });
      it('should throw the BadRequestException exception', () => {
        return expect(() =>
          usersRepository.create(createUserData),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
