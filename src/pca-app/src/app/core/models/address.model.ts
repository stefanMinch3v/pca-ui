/**
 * Mirrors `pca.Application.Common.DTOs.AddressDto` on the API.
 */
export interface Address {
  readonly street: string;
  readonly city: string;
  readonly postalCode: string;
  readonly country: string;
}
