import { expect, test } from '@playwright/test'
import { fulfillJson, mockAuthenticatedSession } from './support/mockApi'

const mentee = {
  id: '77',
  name: 'Jordan Mentee',
  email: 'jordan@example.com',
  linkedin: 'https://www.linkedin.com/in/jordan-mentee',
  type: 'mentee',
  college: null,
  bio: 'I am exploring careers in finance and technology.',
  areasOfExpertise: ['Career Planning'],
  gradYear: 2027,
  status: 'approved',
  role: 'user',
}

test.beforeEach(async ({ page }) => {
  await mockAuthenticatedSession(page, false, true)
})

test('shows a mentee profile returned by the API', async ({ page }) => {
  await page.route('**/api/mentee/77', async (route) => {
    await fulfillJson(route, mentee)
  })

  await page.goto('/mentee/77')

  await expect(
    page.getByRole('heading', { name: 'Jordan Mentee', level: 1 }),
  ).toBeVisible()
  const backLink = page.getByRole('link', { name: 'Back to mentee directory' })
  await expect(backLink).toHaveAttribute('href', '/directory')
  await expect(
    page.getByRole('heading', { name: 'Areas of interest' }),
  ).toBeVisible()

  await backLink.click()
  await expect(page).toHaveURL('/directory')
  await expect(
    page.getByRole('button', { name: 'Mentees', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})

test('lets a mentor hide a mentee recommendation from the profile', async ({
  page,
}) => {
  await page.unroute('**/api/auth/session')
  await mockAuthenticatedSession(page)
  await page.route('**/api/mentee/77', async (route) => {
    await fulfillJson(route, mentee)
  })
  let action: 'dismissed' | null = null
  await page.route('**/api/match-actions/77', async (route) => {
    if (route.request().method() === 'PUT') action = 'dismissed'
    await fulfillJson(route, {
      action,
      actedAt: action ? '2026-10-13T12:00:00.000Z' : null,
    })
  })

  await page.goto('/mentee/77')
  await expect(
    page.getByRole('button', { name: 'Mark as contacted' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Not a fit' }).click()

  await expect(page.getByText('Hidden from recommendations')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Restore recommendation' }),
  ).toBeVisible()
})

test('shows a mentee-specific not-found state', async ({ page }) => {
  await page.route('**/api/mentee/404', async (route) => {
    await fulfillJson(route, { message: 'Not found' }, 404)
  })

  await page.goto('/mentee/404')

  await expect(
    page.getByRole('heading', { name: 'Mentee not found' }),
  ).toBeVisible()
})
