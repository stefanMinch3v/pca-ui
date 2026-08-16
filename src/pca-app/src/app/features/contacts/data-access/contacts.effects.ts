import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, catchError, map, of, switchMap, withLatestFrom } from 'rxjs';
import { describeHttpError as describeError } from '../../../core/http/describe-http-error';
import { ContactApiService } from '../../../core/services/contact-api.service';
import { ContactsApiActions, ContactsPageActions } from './contacts.actions';
import {
  selectCurrentPageIndex,
  selectNextPageKey,
  selectPreviousPageKey,
} from './contacts.reducer';

export const loadFirstPage$ = createEffect(
  (actions$ = inject(Actions), contactApi = inject(ContactApiService)) =>
    actions$.pipe(
      ofType(ContactsPageActions.loadFirstPage),
      switchMap(() =>
        contactApi.getAll(null).pipe(
          map((page) => ContactsApiActions.loadContactsSuccess({ page, pageIndex: 0 })),
          catchError((error: unknown) =>
            of(ContactsApiActions.loadContactsFailure({ error: describeError(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const loadNextPage$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store), contactApi = inject(ContactApiService)) =>
    actions$.pipe(
      ofType(ContactsPageActions.loadNextPage),
      withLatestFrom(store.select(selectNextPageKey), store.select(selectCurrentPageIndex)),
      switchMap(([, nextPageKey, currentPageIndex]) => {
        // Mirrors the reducer's own guard - nothing to fetch past the last page.
        if (nextPageKey === null) {
          return EMPTY;
        }

        return contactApi.getAll(nextPageKey).pipe(
          map((page) =>
            ContactsApiActions.loadContactsSuccess({ page, pageIndex: currentPageIndex + 1 }),
          ),
          catchError((error: unknown) =>
            of(ContactsApiActions.loadContactsFailure({ error: describeError(error) })),
          ),
        );
      }),
    ),
  { functional: true },
);

export const loadPreviousPage$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store), contactApi = inject(ContactApiService)) =>
    actions$.pipe(
      ofType(ContactsPageActions.loadPreviousPage),
      withLatestFrom(store.select(selectPreviousPageKey), store.select(selectCurrentPageIndex)),
      switchMap(([, previousPageKey, currentPageIndex]) => {
        // Mirrors the reducer's own guard - nothing to go back to from page 0.
        if (currentPageIndex <= 0) {
          return EMPTY;
        }

        return contactApi.getAll(previousPageKey).pipe(
          map((page) =>
            ContactsApiActions.loadContactsSuccess({ page, pageIndex: currentPageIndex - 1 }),
          ),
          catchError((error: unknown) =>
            of(ContactsApiActions.loadContactsFailure({ error: describeError(error) })),
          ),
        );
      }),
    ),
  { functional: true },
);

export const loadContact$ = createEffect(
  (actions$ = inject(Actions), contactApi = inject(ContactApiService)) =>
    actions$.pipe(
      ofType(ContactsPageActions.loadContact),
      switchMap(({ id }) =>
        contactApi.getById(id).pipe(
          map((contact) => ContactsApiActions.loadContactSuccess({ contact })),
          catchError((error: unknown) =>
            of(ContactsApiActions.loadContactFailure({ error: describeError(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const createContact$ = createEffect(
  (actions$ = inject(Actions), contactApi = inject(ContactApiService)) =>
    actions$.pipe(
      ofType(ContactsPageActions.createContact),
      switchMap(({ input }) =>
        contactApi.create(input).pipe(
          map((contact) => ContactsApiActions.createContactSuccess({ contact })),
          catchError((error: unknown) =>
            of(ContactsApiActions.createContactFailure({ error: describeError(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const updateContact$ = createEffect(
  (actions$ = inject(Actions), contactApi = inject(ContactApiService)) =>
    actions$.pipe(
      ofType(ContactsPageActions.updateContact),
      switchMap(({ id, input }) =>
        contactApi.update(id, input).pipe(
          map((contact) => ContactsApiActions.updateContactSuccess({ contact })),
          catchError((error: unknown) =>
            of(ContactsApiActions.updateContactFailure({ error: describeError(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const deleteContact$ = createEffect(
  (actions$ = inject(Actions), contactApi = inject(ContactApiService)) =>
    actions$.pipe(
      ofType(ContactsPageActions.deleteContact),
      switchMap(({ id }) =>
        contactApi.delete(id).pipe(
          map(() => ContactsApiActions.deleteContactSuccess({ id })),
          catchError((error: unknown) =>
            of(ContactsApiActions.deleteContactFailure({ error: describeError(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

/** Registered together via `provideEffects(contactsEffects)`. */
export const contactsEffects = {
  loadFirstPage$,
  loadNextPage$,
  loadPreviousPage$,
  loadContact$,
  createContact$,
  updateContact$,
  deleteContact$,
};
