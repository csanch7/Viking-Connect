import { expect, test } from '@playwright/test'
import { fulfillJson, mockAuthenticatedSession } from './support/mockApi'

test.beforeEach(async ({ page }) => {
  await mockAuthenticatedSession(page)
})

test('shows a mentor profile returned by the API', async ({ page }) => {
  await page.route('**/api/mentor/42', async (route) => {
    await fulfillJson(route, {
      id: '42',
      username: 'Alex Mentor',
      email: 'alex@example.com',
      linkedin: 'https://www.linkedin.com/in/alex-mentor',
      areasOfExpertise: ['Finance', 'Career Planning'],
      gradYear: 2012,
    })
  })
  await page.goto('/mentor/42')

  await expect(page.getByRole('heading', { name: 'Alex Mentor' })).toBeVisible()
  await expect(page.getByText('Finance')).toBeVisible()
  await expect(
    page.getByRole('link', { name: /View profile/ }),
  ).toHaveAttribute('href', 'https://www.linkedin.com/in/alex-mentor')
  await expect(
    page.getByRole('link', { name: 'Back to mentor directory' }),
  ).toHaveAttribute('href', '/dashboard')
})

test('shows the not-found state when the mentor request fails', async ({
  page,
}) => {
  await page.route('**/api/mentor/999', async (route) => {
    await fulfillJson(route, { message: 'Could not find mentor' }, 404)
  })
  await page.goto('/mentor/999')

  await expect(
    page.getByRole('heading', { name: 'Mentor not found' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Back to directory' }),
  ).toHaveAttribute('href', '/dashboard')
})
