import { expect, test } from '@playwright/test'
import { fulfillJson, mockAuthenticatedSession } from './support/mockApi'

test.beforeEach(async ({ page }) => {
  await mockAuthenticatedSession(page)
})

test('shows a mentor profile returned by the API', async ({ page }) => {
  await page.route('**/api/mentor/42', async (route) => {
    await fulfillJson(route, {
      id: '42',
      name: 'Alex Mentor',
      email: 'alex@example.com',
      linkedin: 'https://www.linkedin.com/in/alex-mentor',
      type: 'mentor',
      college: 'DePaul University',
      bio: 'I help students prepare for careers in finance.',
      areasOfExpertise: ['Finance', 'Career Planning'],
      gradYear: 2012,
      status: 'approved',
      role: 'user',
    })
  })
  await page.goto('/mentor/42')

  await expect(page.getByRole('heading', { name: 'Alex Mentor' })).toBeVisible()
  await expect(page.getByText('Finance', { exact: true })).toBeVisible()
  await expect(
    page.getByText('I help students prepare for careers in finance.'),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: /View profile/ }),
  ).toHaveAttribute('href', 'https://www.linkedin.com/in/alex-mentor')
  await expect(
    page.getByRole('link', { name: 'Back to mentor directory' }),
  ).toHaveAttribute('href', '/directory')
})

test('lets a mentee mark a mentor as contacted', async ({ page }) => {
  await page.unroute('**/api/auth/session')
  await mockAuthenticatedSession(page, false, true)
  await page.route('**/api/mentor/42', async (route) => {
    await fulfillJson(route, {
      id: '42',
      name: 'Alex Mentor',
      email: 'alex@example.com',
      linkedin: 'https://www.linkedin.com/in/alex-mentor',
      type: 'mentor',
      college: 'DePaul University',
      bio: 'I help students prepare for careers in finance.',
      areasOfExpertise: ['Finance'],
      gradYear: 2012,
      status: 'approved',
      role: 'user',
    })
  })
  let contacted = false
  await page.route('**/api/match-actions/42', async (route) => {
    if (route.request().method() === 'PUT') contacted = true
    await fulfillJson(
      route,
      contacted
        ? { action: 'contacted', actedAt: '2026-10-13T12:00:00.000Z' }
        : { action: null, actedAt: null },
    )
  })

  await page.goto('/mentor/42')
  await expect(page.getByRole('button', { name: 'Not a fit' })).toBeVisible()
  await page.getByRole('button', { name: 'Mark as contacted' }).click()

  await expect(page.getByText('Contacted Oct 13, 2026')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Remove from history' }),
  ).toBeVisible()
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
  ).toHaveAttribute('href', '/directory')
})
