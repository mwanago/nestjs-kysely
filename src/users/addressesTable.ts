import { Generated } from 'kysely';

export interface AddressesTable {
  id: Generated<number>;
  street: string | null;
  city: string | null;
  country: string | null;
}
