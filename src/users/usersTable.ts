import { Generated } from 'kysely';

export interface UsersTable {
  id: Generated<number>;
  email: string;
  name: string;
  password: string;
  address_id: number | null;
}
