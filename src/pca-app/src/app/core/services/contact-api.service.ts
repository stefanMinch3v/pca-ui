import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactDetails, ContactInput, ContactListing } from '../models/contact.model';
import { Page } from '../models/page.model';

/**
 * Talks to the endpoints mapped by `pca.Api.Endpoints.ContactEndpoints`
 * (`/api/contacts`). One method per endpoint, kept as thin as possible -
 * mapping/derived state belongs in the consuming feature, not here.
 */
@Injectable({ providedIn: 'root' })
export class ContactApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/contacts`;

  /** GET /api/contacts - keyset-paginated listing, newest first. */
  getAll(pageKey?: string | null): Observable<Page<ContactListing>> {
    const params = pageKey ? new HttpParams().set('pageKey', pageKey) : undefined;

    return this.http.get<Page<ContactListing>>(this.baseUrl, { params });
  }

  /** GET /api/contacts/{id} */
  getById(id: string): Observable<ContactDetails> {
    return this.http.get<ContactDetails>(`${this.baseUrl}/${id}`);
  }

  /** POST /api/contacts */
  create(contact: ContactInput): Observable<ContactDetails> {
    return this.http.post<ContactDetails>(this.baseUrl, contact);
  }

  /** PUT /api/contacts/{id} */
  update(id: string, contact: ContactInput): Observable<ContactDetails> {
    return this.http.put<ContactDetails>(`${this.baseUrl}/${id}`, contact);
  }

  /** DELETE /api/contacts/{id} */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
