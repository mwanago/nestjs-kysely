import { Exclude } from 'class-transformer';
import { Address } from './address.model';

interface UserModelData {
  id: number;
  email: string;
  name: string;
  password: string;
  address_id?: number | null;
  address_street?: string | null;
  address_city?: string | null;
  address_country?: string | null;
}

export class User {
  id: number;
  email: string;
  name: string;
  @Exclude({ toPlainOnly: true })
  password: string;
  address?: Address;
  constructor({
    id,
    email,
    name,
    password,
    address_id = null,
    address_street = null,
    address_country = null,
    address_city = null,
  }: UserModelData) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
    if (address_id) {
      this.address = new Address({
        id: address_id,
        street: address_street,
        city: address_city,
        country: address_country,
      });
    }
  }
}
