import { Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';
import { ContactListing } from '../../../../core/models/contact.model';
import { ContactsPageActions } from '../../data-access/contacts.actions';
import {
  selectAllContacts,
  selectCurrentPageNumber,
  selectHasMore,
  selectHasPrevious,
  selectIsEmpty,
  selectListLoading,
} from '../../data-access/contacts.reducer';

/**
 * Contacts landing page: a keyset-paginated table (see `ContactApiService.getAll`)
 * with "New Contact", edit and delete actions. Purely a dispatcher/selector
 * shell around the `contacts` NgRx feature - no local mutable state.
 */
@Component({
  selector: 'app-contact-list-page',
  imports: [RouterLink, TableModule, Button, Toolbar, ConfirmDialog],
  providers: [ConfirmationService],
  templateUrl: './contact-list-page.html',
  styleUrl: './contact-list-page.scss',
})
export class ContactListPage implements OnInit {
  private readonly store = inject(Store);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly contacts = toSignal(this.store.select(selectAllContacts), {
    initialValue: [],
  });
  protected readonly loading = toSignal(this.store.select(selectListLoading), {
    initialValue: false,
  });
  protected readonly hasMore = toSignal(this.store.select(selectHasMore), { initialValue: false });
  protected readonly hasPrevious = toSignal(this.store.select(selectHasPrevious), {
    initialValue: false,
  });
  protected readonly pageNumber = toSignal(this.store.select(selectCurrentPageNumber), {
    initialValue: 1,
  });
  protected readonly isEmpty = toSignal(this.store.select(selectIsEmpty), { initialValue: false });

  ngOnInit(): void {
    this.store.dispatch(ContactsPageActions.loadFirstPage());
  }

  loadNextPage(): void {
    this.store.dispatch(ContactsPageActions.loadNextPage());
  }

  loadPreviousPage(): void {
    this.store.dispatch(ContactsPageActions.loadPreviousPage());
  }

  confirmDelete(contact: ContactListing): void {
    this.confirmationService.confirm({
      header: 'Delete contact',
      message: `Delete ${contact.firstName} ${contact.lastName}? This cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => this.store.dispatch(ContactsPageActions.deleteContact({ id: contact.id })),
    });
  }
}
