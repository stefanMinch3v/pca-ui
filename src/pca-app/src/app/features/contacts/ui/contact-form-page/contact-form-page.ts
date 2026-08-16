import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { filter, take } from 'rxjs';
import { ContactDetails, ContactInput } from '../../../../core/models/contact.model';
import { ContactsApiActions, ContactsPageActions } from '../../data-access/contacts.actions';
import {
  selectMutating,
  selectSelectedContact,
  selectSelectedContactError,
  selectSelectedContactLoading,
} from '../../data-access/contacts.reducer';

interface ContactFormValue {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  iban: string;
}

/** International-ish phone format shared with `PhoneNumber` on the API: optional '+', 7-15 digits. */
const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;

/**
 * Single page used for both "New Contact" and "Edit Contact" (`contacts.routes.ts`
 * maps `new` and `:id/edit` to this same component) - the only difference is
 * whether a contact is loaded and patched into the form first, and which
 * `ContactsPageActions` mutation is dispatched on submit.
 */
@Component({
  selector: 'app-contact-form-page',
  imports: [ReactiveFormsModule, RouterLink, Button, Card, DatePicker, InputText, Message],
  templateUrl: './contact-form-page.html',
  styleUrl: './contact-form-page.scss',
})
export class ContactFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly contactId = this.route.snapshot.paramMap.get('id');
  protected readonly isEditMode = this.contactId !== null;
  protected readonly maxDateOfBirth = new Date();

  protected readonly loadingContact = toSignal(this.store.select(selectSelectedContactLoading), {
    initialValue: false,
  });
  protected readonly loadError = toSignal(this.store.select(selectSelectedContactError), {
    initialValue: null,
  });
  protected readonly saving = toSignal(this.store.select(selectMutating), { initialValue: false });

  protected readonly form = this.fb.group({
    firstName: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    lastName: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    dateOfBirth: this.fb.control<Date | null>(null, Validators.required),
    street: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),
    city: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    postalCode: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    country: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    phoneNumber: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(PHONE_PATTERN),
    ]),
    iban: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(15),
      Validators.maxLength(34),
    ]),
  });

  ngOnInit(): void {
    // Clear out any `selectedContact`/`selectedContactError` left behind by
    // a previous visit (e.g. a failed edit) before doing anything else -
    // otherwise it can leak into this visit, such as hiding the "New
    // Contact" form behind a stale error screen from an earlier edit.
    this.store.dispatch(ContactsPageActions.resetSelectedContact());

    if (this.isEditMode && this.contactId) {
      this.store.dispatch(ContactsPageActions.loadContact({ id: this.contactId }));

      // `take(1)` (after filtering for *this* contact having loaded) so the
      // form is only ever patched once - otherwise an unrelated later store
      // emission (e.g. this same contact updating elsewhere) would silently
      // overwrite whatever the user is mid-way through typing.
      this.store
        .select(selectSelectedContact)
        .pipe(
          filter(
            (contact): contact is ContactDetails =>
              contact !== null && contact.id === this.contactId,
          ),
          take(1),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((contact) => {
          this.form.patchValue({
            firstName: contact.firstName,
            lastName: contact.lastName,
            dateOfBirth: fromIsoDate(contact.dateOfBirth),
            street: contact.address.street,
            city: contact.address.city,
            postalCode: contact.address.postalCode,
            country: contact.address.country,
            phoneNumber: contact.phoneNumber,
            iban: contact.iban,
          });
        });
    }

    this.actions$
      .pipe(
        ofType(ContactsApiActions.createContactSuccess, ContactsApiActions.updateContactSuccess),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.router.navigate(['/contacts']));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const input = toContactInput(this.form.getRawValue());

    if (this.isEditMode && this.contactId) {
      this.store.dispatch(ContactsPageActions.updateContact({ id: this.contactId, input }));
    } else {
      this.store.dispatch(ContactsPageActions.createContact({ input }));
    }
  }

  /** Field-level error message, shown only once the user has interacted with the field. */
  errorMessage(controlName: keyof ContactFormValue): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.errors || !(control.dirty || control.touched)) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['maxlength']) {
      return `Must not exceed ${control.errors['maxlength'].requiredLength} characters.`;
    }
    if (control.errors['minlength']) {
      return `Must be at least ${control.errors['minlength'].requiredLength} characters.`;
    }
    if (control.errors['pattern']) {
      return 'Invalid format.';
    }

    return 'Invalid value.';
  }

  isInvalid(controlName: keyof ContactFormValue): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}

function toContactInput(value: ContactFormValue): ContactInput {
  return {
    firstName: value.firstName.trim(),
    lastName: value.lastName.trim(),
    dateOfBirth: toIsoDate(value.dateOfBirth!),
    country: value.country.trim(),
    street: value.street.trim(),
    postalCode: value.postalCode.trim(),
    city: value.city.trim(),
    phoneNumber: value.phoneNumber.trim(),
    iban: value.iban.trim(),
  };
}

/** Formats using local date parts (not `toISOString()`, which would shift by timezone offset). */
function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}
