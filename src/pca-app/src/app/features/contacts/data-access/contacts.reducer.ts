import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { ContactDetails, ContactListing } from '../../../core/models/contact.model';
import { ContactsApiActions, ContactsPageActions } from './contacts.actions';

function toListing(contact: ContactDetails): ContactListing {
  return {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phoneNumber: contact.phoneNumber,
  };
}

export interface ContactsState extends EntityState<ContactListing> {
  /**
   * Keyset (page-key) pagination history: `pageKeys[i]` is the opaque key
   * that was sent to `ContactApiService.getAll` to fetch page `i` -
   * `pageKeys[0]` is always `null` (the first page has no cursor). Since
   * keys are stateless/deterministic (see `GetAllContactsQuery`), caching
   * them here is what lets "previous" re-fetch an earlier page instead of
   * only ever being able to move forward.
   */
  pageKeys: readonly (string | null)[];
  currentPageIndex: number;
  /** Key to fetch the page *after* `currentPageIndex`; `null` = no next page. */
  nextPageKey: string | null;
  listLoading: boolean;
  listError: string | null;
  selectedContact: ContactDetails | null;
  selectedContactLoading: boolean;
  selectedContactError: string | null;
  mutating: boolean;
  mutationError: string | null;
}

export const contactsAdapter = createEntityAdapter<ContactListing>();

const initialState: ContactsState = contactsAdapter.getInitialState({
  pageKeys: [null],
  currentPageIndex: 0,
  nextPageKey: null,
  listLoading: false,
  listError: null,
  selectedContact: null,
  selectedContactLoading: false,
  selectedContactError: null,
  mutating: false,
  mutationError: null,
});

export const contactsFeature = createFeature({
  name: 'contacts',
  reducer: createReducer(
    initialState,

    on(ContactsPageActions.loadFirstPage, (state) => ({
      ...state,
      listLoading: true,
      listError: null,
    })),
    // No-op (instead of a wasted request) once there's nowhere left to move -
    // keeps `listLoading` from getting stuck on `true` if a Next/Previous
    // action is ever dispatched past the edge (e.g. a stale click).
    on(ContactsPageActions.loadNextPage, (state) =>
      state.nextPageKey === null ? state : { ...state, listLoading: true, listError: null },
    ),
    on(ContactsPageActions.loadPreviousPage, (state) =>
      state.currentPageIndex <= 0 ? state : { ...state, listLoading: true, listError: null },
    ),
    on(ContactsApiActions.loadContactsSuccess, (state, { page, pageIndex }) => {
      // Keep this page's own key (already recorded) and (re)record the key
      // for the page after it, discarding any stale forward history beyond
      // that - it'll be rebuilt as the user pages forward again.
      const pageKeys = [...state.pageKeys.slice(0, pageIndex + 1), page.nextPageKey];

      return contactsAdapter.setAll([...page.items], {
        ...state,
        pageKeys,
        currentPageIndex: pageIndex,
        nextPageKey: page.nextPageKey,
        listLoading: false,
      });
    }),
    on(ContactsApiActions.loadContactsFailure, (state, { error }) => ({
      ...state,
      listLoading: false,
      listError: error,
    })),

    on(ContactsPageActions.resetSelectedContact, (state) => ({
      ...state,
      selectedContact: null,
      selectedContactLoading: false,
      selectedContactError: null,
    })),
    on(ContactsPageActions.loadContact, (state) => ({
      ...state,
      selectedContactLoading: true,
      selectedContactError: null,
    })),
    on(ContactsApiActions.loadContactSuccess, (state, { contact }) => ({
      ...state,
      selectedContact: contact,
      selectedContactLoading: false,
    })),
    on(ContactsApiActions.loadContactFailure, (state, { error }) => ({
      ...state,
      selectedContact: null,
      selectedContactLoading: false,
      selectedContactError: error,
    })),

    on(
      ContactsPageActions.createContact,
      ContactsPageActions.updateContact,
      ContactsPageActions.deleteContact,
      (state) => ({ ...state, mutating: true, mutationError: null }),
    ),
    on(ContactsApiActions.createContactSuccess, (state, { contact }) =>
      contactsAdapter.addOne(toListing(contact), { ...state, mutating: false }),
    ),
    on(ContactsApiActions.updateContactSuccess, (state, { contact }) =>
      contactsAdapter.updateOne(
        { id: contact.id, changes: toListing(contact) },
        { ...state, mutating: false, selectedContact: contact },
      ),
    ),
    on(ContactsApiActions.deleteContactSuccess, (state, { id }) =>
      contactsAdapter.removeOne(id, { ...state, mutating: false }),
    ),
    on(
      ContactsApiActions.createContactFailure,
      ContactsApiActions.updateContactFailure,
      ContactsApiActions.deleteContactFailure,
      (state, { error }) => ({ ...state, mutating: false, mutationError: error }),
    ),
  ),
  extraSelectors: ({
    selectContactsState,
    selectIds,
    selectPageKeys,
    selectCurrentPageIndex,
    selectNextPageKey,
    selectListLoading,
  }) => {
    const { selectAll } = contactsAdapter.getSelectors(selectContactsState);

    return {
      selectAllContacts: selectAll,
      selectHasMore: createSelector(selectNextPageKey, (nextPageKey) => nextPageKey !== null),
      selectHasPrevious: createSelector(
        selectCurrentPageIndex,
        (currentPageIndex) => currentPageIndex > 0,
      ),
      selectCurrentPageNumber: createSelector(
        selectCurrentPageIndex,
        (currentPageIndex) => currentPageIndex + 1,
      ),
      /** The key to re-fetch the page before `currentPageIndex`, for the "Previous" effect. */
      selectPreviousPageKey: createSelector(
        selectPageKeys,
        selectCurrentPageIndex,
        (pageKeys, currentPageIndex) =>
          currentPageIndex > 0 ? pageKeys[currentPageIndex - 1] : null,
      ),
      selectIsEmpty: createSelector(
        selectIds,
        selectListLoading,
        (ids, loading) => !loading && ids.length === 0,
      ),
    };
  },
});

export const {
  name: contactsFeatureKey,
  reducer: contactsReducer,
  selectContactsState,
  selectPageKeys,
  selectCurrentPageIndex,
  selectNextPageKey,
  selectListLoading,
  selectListError,
  selectSelectedContact,
  selectSelectedContactLoading,
  selectSelectedContactError,
  selectMutating,
  selectMutationError,
  selectAllContacts,
  selectHasMore,
  selectHasPrevious,
  selectCurrentPageNumber,
  selectPreviousPageKey,
  selectIsEmpty,
} = contactsFeature;
