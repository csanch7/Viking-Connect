import { expect, test } from '@playwright/test'
import { mockSession } from './support/mockApi'

test('shows a useful not-found message and return link', async ({ page }) => {
  await mockSession(page)
  await page.goto('/does-not-exist')

  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible()
  await expect(
    page.getByText('The page you requested does not exist'),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute(
    'href',
    '/',
  )
})
