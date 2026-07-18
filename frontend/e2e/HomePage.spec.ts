import { expect, test } from '@playwright/test'
import { mockSession } from './support/mockApi'

test('shows the public home page and opens registration', async ({ page }) => {
  await mockSession(page)
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: 'Turn school pride into career momentum.',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Home navigation' }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Join the network' }).click()

  await expect(page).toHaveURL('/register')
  await expect(
    page.getByRole('heading', { name: 'Create your member profile' }),
  ).toBeVisible()
})

test('shows member navigation for an authenticated visitor', async ({
  page,
}) => {
  await mockSession(page, { authenticated: true, admin: false })
  await page.goto('/')

  await expect(
    page.getByRole('link', { name: 'Dashboard', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Profile', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Join the network' }),
  ).toBeHidden()
})
