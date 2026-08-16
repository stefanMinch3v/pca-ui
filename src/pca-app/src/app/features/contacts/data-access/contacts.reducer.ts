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

    on(ContactsPageActions.loadFirstPage, (state) => ({ ...state, listLoading: true, listError: null })),
    on(ContactsPageActions.loadNextPage, (state) => ({ ...state, listLoading: true, listError: null })),
    on(ContactsApiActions.loadContactsSuccess, (state, { page }) =>
      contactsAdapter.setAll([...page.items], {
        ...state,
        nextPageKey: page.nextPageKey,
        listLoading: false,
      }),
    ),
    on(ContactsApiActions.loadContactsFailure, (state, { error }) => ({
      ...state,
      listLoading: false,
      listError: error,
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
  extraSelectors: ({ selectContactsState, selectIds, selectNextPageKey, selectListLoading }) => {
    const { selectAll } = contactsAdapter.getSelectors(selectContactsState);

    return {
      selectAllContacts: selectAll,
      selectHasMore: createSelector(selectNextPageKey, (nextPageKey) => nextPageKey !== null),
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
  selectIsEmpty,
} = contactsFeature;
