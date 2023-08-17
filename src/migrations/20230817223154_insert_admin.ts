import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { Database } from '../database/database';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../types/environmentVariables';

config();

const configService = new ConfigService<EnvironmentVariables>();

export async function up(database: Database): Promise<void> {
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
}

export async function down(database: Database): Promise<void> {
  const email = configService.get('ADMIN_EMAIL');

  await database.deleteFrom('users').where('email', '=', email).execute();
}
