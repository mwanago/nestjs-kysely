import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../types/environmentVariables';
import { Migration } from 'kysely';

config();

const configService = new ConfigService<EnvironmentVariables>();

export const up: Migration['up'] = async (database) => {
  const email = configService.get('ADMIN_EMAIL');
  const password = configService.get('ADMIN_PASSWORD');
  const hashedPassword = await bcrypt.hash(password, 10);

  await database
    .insertInto('users')
    .values({
      email,
      password: hashedPassword,
      name: 'Admin',
    })
    .execute();
};

export const down: Migration['up'] = async (database) => {
  const email = configService.get('ADMIN_EMAIL');

  await database.deleteFrom('users').where('email', '=', email).execute();
};
