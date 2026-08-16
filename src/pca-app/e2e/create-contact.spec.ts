import { expect, test } from '@playwright/test';

test('creating a contact adds it to the contacts list', async ({ page }) => {
  const uniqueSuffix = Date.now();
  const firstName = `E2E-${uniqueSuffix}`;
  const lastName = 'Playwright';

  await page.goto('/contacts/new');

  await page.getByRole('textbox', { name: 'First name' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Last name' }).fill(lastName);

  // PrimeNG's DatePicker parses the value on real keystrokes rather than a
  // plain `fill()`, which sets the DOM value directly without triggering
  // its internal key handlers - so it never patches the form control.
  await page.getByRole('combobox', { name: 'Date of birth' }).pressSequentially('1990-05-15');
  await page.keyboard.press('Tab');

  await page.getByRole('textbox', { name: 'Phone number' }).fill('+491701234567');
  await page.getByRole('textbox', { name: 'Street' }).fill('Main Street 1');
  await page.getByRole('textbox', { name: 'City' }).fill('Berlin');
  await page.getByRole('textbox', { name: 'Postal code' }).fill('10115');
  await page.getByRole('textbox', { name: 'Country' }).fill('Germany');
  await page.getByRole('textbox', { name: 'IBAN' }).fill('DE89370400440532013000');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page).toHaveURL(/\/contacts$/);
  await expect(
    page.getByRole('row', { name: new RegExp(`${firstName}.*${lastName}`) }),
  ).toBeVisible();
});
