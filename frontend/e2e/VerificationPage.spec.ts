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
  await expect(page.getByText('Viking Connect registration')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute(
    'href',
    '/',
  )
  await expect(
    page.getByRole('link', { name: 'Sign in after approval' }),
  ).toHaveAttribute('href', '/login')
})
