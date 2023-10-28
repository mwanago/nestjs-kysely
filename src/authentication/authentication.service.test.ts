import { AuthenticationService } from './authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { SignUpDto } from './dto/signUp.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.model';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('The AuthenticationService', () => {
  let signUpData: SignUpDto;
  let authenticationService: AuthenticationService;
  let getByEmailMock: jest.Mock;
  let password: string;
  beforeEach(async () => {
    getByEmailMock = jest.fn();
    password = 'strongPassword123';
    signUpData = {
      password,
      email: 'john@smith.com',
      name: 'John',
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockReturnValue(signUpData),
            getByEmail: getByEmailMock,
          },
        },
      ],
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
          secretOrPrivateKey: 'Secret key',
        }),
      ],
    }).compile();

    authenticationService = await module.get(AuthenticationService);
  });
  describe('when calling the getCookieForLogOut method', () => {
    it('should return a correct string', () => {
      const result = authenticationService.getCookieForLogOut();
      expect(result).toBe('Authentication=; HttpOnly; Path=/; Max-Age=0');
    });
  });
  describe('when registering a new user', () => {
    describe('and when the usersService returns the new user', () => {
      it('should return the new user', async () => {
        const result = await authenticationService.signUp(signUpData);
        expect(result).toBe(signUpData);
      });
    });
  });
  describe('when the getAuthenticatedUser method is called', () => {
    describe('and a valid email and password are provided', () => {
      let userData: User;
      beforeEach(async () => {
        const hashedPassword = await bcrypt.hash(password, 10);
        userData = {
          id: 1,
          email: 'john@smith.com',
          name: 'John',
          password: hashedPassword,
        };
        getByEmailMock.mockResolvedValue(userData);
      });
      it('should return the new user', async () => {
        const result = await authenticationService.getAuthenticatedUser(
          userData.email,
          password,
        );
        expect(result).toBe(userData);
      });
    });
    describe('and an invalid email is provided', () => {
      beforeEach(() => {
        getByEmailMock.mockRejectedValue(new NotFoundException());
      });
      it('should throw the BadRequestException', () => {
        return expect(async () => {
          await authenticationService.getAuthenticatedUser(
            'john@smith.com',
            password,
          );
        }).rejects.toThrow(BadRequestException);
      });
    });
  });
});
