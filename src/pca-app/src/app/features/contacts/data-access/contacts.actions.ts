import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ContactDetails, ContactInput, ContactListing } from '../../../core/models/contact.model';
import { Page } from '../../../core/models/page.model';

/**
 * Actions dispatched by the UI (components) to ask for something to happen.
 * Named after the "source" that triggers them, per the NgRx style guide.
 */
export const ContactsPageActions = createActionGroup({
  source: 'Contacts Page',
  events: {
    'Load First Page': emptyProps(),
    'Load Next Page': emptyProps(),
    'Load Previous Page': emptyProps(),
    /**
     * Dispatched when the form page mounts (new or edit), before anything
     * else - clears any `selectedContact`/`selectedContactError` left over
     * from a previous visit (e.g. a failed edit) so it can't leak into an
     * unrelated later visit, such as hiding the "New Contact" form behind
     * a stale error screen.
     */
    'Reset Selected Contact': emptyProps(),
    'Load Contact': props<{ id: string }>(),
    'Create Contact': props<{ input: ContactInput }>(),
    'Update Contact': props<{ id: string; input: ContactInput }>(),
    'Delete Contact': props<{ id: string }>(),
  },
});

/**
 * Actions dispatched by effects once `ContactApiService` (talking to
 * `pca.Api.Endpoints.ContactEndpoints`) responds - the only actions the
 * reducer needs to actually apply to state.
 */
export const ContactsApiActions = createActionGroup({
  source: 'Contacts API',
  events: {
    'Load Contacts Success': props<{ page: Page<ContactListing>; pageIndex: number }>(),
    'Load Contacts Failure': props<{ error: string }>(),
    'Load Contact Success': props<{ contact: ContactDetails }>(),
    'Load Contact Failure': props<{ error: string }>(),
    'Create Contact Success': props<{ contact: ContactDetails }>(),
    'Create Contact Failure': props<{ error: string }>(),
    'Update Contact Success': props<{ contact: ContactDetails }>(),
    'Update Contact Failure': props<{ error: string }>(),
    'Delete Contact Success': props<{ id: string }>(),
    'Delete Contact Failure': props<{ error: string }>(),
  },
});
