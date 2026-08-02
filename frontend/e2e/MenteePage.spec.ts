import { expect, test } from '@playwright/test'
import { fulfillJson, mockAuthenticatedSession } from './support/mockApi'

const mentee = {
  id: '77',
  name: 'Jordan Mentee',
  email: 'jordan@example.com',
  linkedin: 'https://www.linkedin.com/in/jordan-mentee',
  type: 'mentee',
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
  await expect(
    page.getByRole('link', { name: 'Back to mentee directory' }),
  ).toHaveAttribute('href', '/mentees/directory')
  await expect(
    page.getByRole('heading', { name: 'Areas of interest' }),
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
