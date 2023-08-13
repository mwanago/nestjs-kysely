interface AddressModelData {
  id: number;
  street?: string | null;
  city?: string | null;
  country?: string | null;
}
export class Address {
  id: number;
  street: string | null;
  city: string | null;
  country: string | null;
  constructor({
    id,
    street = null,
    city = null,
    country = null,
  }: AddressModelData) {
    this.id = id;
    this.street = street;
    this.city = city;
    this.country = country;
  }
}
