import { test, expect } from '@playwright/test';

const website = 'https://second-circle-marketplace.vercel.app';

test.beforeEach(async ({ page }) => {
  await page.goto(website);
});

test('homepage shows the main marketplace content', async ({ page }) => {
  await expect(page).toHaveTitle(/Second Circle/);

  await expect(
    page.getByRole('heading', { name: /Find what you need/ })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', { name: 'Search' })
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Log in' })
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Sell an item' })
  ).toBeVisible();
});

test('login link opens the authentication page', async ({ page }) => {
  await page.getByRole('link', { name: 'Log in' }).click();

  await expect(page).toHaveURL(`${website}/auth`);

  await expect(
    page.getByRole('heading', { name: 'Create your account' })
  ).toBeVisible();
});

test('sell item redirects an unauthenticated user to authentication', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'Sell an item' }).click();

  await expect(page).toHaveURL(`${website}/auth?next=/sell`);

  await expect(
    page.getByRole('heading', { name: 'Create your account' })
  ).toBeVisible();
});

test('account creation form prevents empty submission', async ({ page }) => {
  await page.goto(`${website}/auth`);

  const fullName = page.getByRole('textbox', { name: 'Full name' });
  const email = page.getByRole('textbox', { name: 'Email address' });
  const password = page.getByLabel('Password', { exact: true });
  const confirmPassword = page.getByLabel('Confirm password');

  await expect(fullName).toHaveAttribute('required', '');
  await expect(email).toHaveAttribute('required', '');
  await expect(password).toHaveAttribute('required', '');
  await expect(confirmPassword).toHaveAttribute('required', '');

  await page
    .getByRole('button', { name: 'Create account' })
    .last()
    .click();

  await expect(fullName).toBeFocused();
  await expect(page).toHaveURL(`${website}/auth`);
});
test('account creation shows an error when passwords do not match', async ({
  page,
}) => {
  await page.goto(`${website}/auth`);

  await page
    .getByRole('textbox', { name: 'Full name' })
    .fill('Test User');

  await page
    .getByRole('textbox', { name: 'Email address' })
    .fill('test@example.com');

  await page
    .getByLabel('Password', { exact: true })
    .fill('Password123');

  await page
    .getByLabel('Confirm password')
    .fill('Different123');

  await page
    .getByRole('button', { name: 'Create account' })
    .last()
    .click();

  await expect(
    page.getByText('The passwords do not match.')
  ).toBeVisible();

  await expect(page).toHaveURL(`${website}/auth`);
});