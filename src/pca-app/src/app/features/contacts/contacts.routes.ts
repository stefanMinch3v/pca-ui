import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { contactsEffects } from './data-access/contacts.effects';
import { contactsFeature } from './data-access/contacts.reducer';

/**
 * Registers the Contacts NgRx slice (state + effects) once, scoped to this
 * route subtree via the parent's `providers`, then lazy-loads each page
 * component. Keeps the feature fully self-contained instead of eagerly
 * loading it from `app.config.ts`.
 */
export const contactsRoutes: Routes = [
  {
    path: '',
    providers: [provideState(contactsFeature), provideEffects(contactsEffects)],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./ui/contact-list-page/contact-list-page').then((m) => m.ContactListPage),
        title: 'Contacts',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./ui/contact-form-page/contact-form-page').then((m) => m.ContactFormPage),
        title: 'New Contact',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./ui/contact-form-page/contact-form-page').then((m) => m.ContactFormPage),
        title: 'Edit Contact',
      },
    ],
  },
];
