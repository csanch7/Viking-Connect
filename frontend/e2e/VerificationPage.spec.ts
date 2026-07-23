import { expect, test } from '@playwright/test'
import { mockSession } from './support/mockApi'

test('confirms that registration is pending and links home', async ({
  page,
}) => {
  await mockSession(page)
  await page.goto('/verification')

  await expect(
    page.getByRole('heading', { name: 'Your account is pending review' }),
  ).toBeVisible()
  await expect(page.getByText('Registration received')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Back to sign in' }),
  ).toHaveAttribute('href', '/login')
})
