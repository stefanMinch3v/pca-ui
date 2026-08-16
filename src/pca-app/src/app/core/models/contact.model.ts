import { Address } from './address.model';

/**
 * Mirrors `pca.Application.Contacts.OutputModels.ContactListingOutputModel`.
 * The shape returned by `GET /api/contacts` - a lightweight row for listing.
 */
export interface ContactListing {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
}

/**
 * Mirrors `pca.Application.Contacts.OutputModels.ContactDetailsOutputModel`.
 * The shape returned by `GET /api/contacts/{id}` and by create/update.
 */
export interface ContactDetails {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth: string;
  readonly address: Address;
  readonly phoneNumber: string;
  readonly iban: string;
}

/**
 * Mirrors `pca.Application.Contacts.InputModels.ContactInputModel`.
 * The payload sent to `POST /api/contacts` and `PUT /api/contacts/{id}`.
 */
export interface ContactInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth: string;
  readonly country: string;
  readonly street: string;
  readonly postalCode: string;
  readonly city: string;
  readonly phoneNumber: string;
  readonly iban: string;
}
