import { expect, test } from '@playwright/test'
import {
  fulfillJson,
  mockAuthenticatedSession,
  mockTopics,
} from './support/mockApi'

const mentee = {
  id: '7',
  name: 'Jane Student',
  email: 'jane@example.com',
  type: 'mentee',
  linkedin: 'https://www.linkedin.com/in/jane-student',
  bio: 'I am preparing for internships and early-career interviews.',
  areasOfExpertise: [],
  gradYear: 2027,
  status: 'approved',
  role: 'user',
}

test.beforeEach(async ({ page }) => {
  await mockAuthenticatedSession(page)
  await mockTopics(page)
  await page.route('**/api/auth/me', async (route) => {
    await fulfillJson(route, { user: mentee })
  })
})

test('shows the signed-in member profile', async ({ page }) => {
  await page.goto('/profile')

  await expect(
    page.getByRole('heading', { name: 'Jane Student' }),
  ).toBeVisible()
  await expect(
    page.getByText(
      'I am preparing for internships and early-career interviews.',
    ),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'jane@example.com' }),
  ).toHaveAttribute('href', 'mailto:jane@example.com')
  await expect(page.getByText('2027')).toBeVisible()
})

test('edits and saves a member bio', async ({ page }) => {
  await page.route('**/api/change-bio/7', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      bio: 'I am looking for resume review and interview preparation.',
    })
    await fulfillJson(route, {
      message: 'Bio has been successfully updated',
      bio: 'I am looking for resume review and interview preparation.',
    })
  })
  await page.goto('/profile')

  await page.getByRole('button', { name: 'Edit bio' }).click()
  await page
    .getByLabel('Bio')
    .fill('I am looking for resume review and interview preparation.')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(
    page.getByText('I am looking for resume review and interview preparation.'),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Edit bio' }),
  ).toBeVisible()
})

test('edits and saves mentor expertise', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await fulfillJson(route, {
      user: {
        ...mentee,
        type: 'mentor',
        bio: 'I help students prepare for careers in technology.',
        areasOfExpertise: ['Technology'],
      },
    })
  })
  await page.route('**/api/change-areas-of-expertise/7', async (route) => {
    await fulfillJson(route, {
      message: 'Areas of expertise have been successfully updated',
      areasOfExpertise: ['Technology', 'Finance'],
    })
  })
  await page.goto('/profile')

  await page.getByRole('button', { name: 'Edit areas of expertise' }).click()
  await page.getByLabel('Select an area').selectOption('Finance')
  await page.getByRole('button', { name: 'Add' }).click()
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(
    page.getByRole('listitem').filter({ hasText: /^Finance$/ }),
  ).toBeVisible()
})

test('signs out and returns to the sign-in page', async ({ page }) => {
  await page.route('**/api/auth/logout', async (route) => {
    await fulfillJson(route, { message: 'Logged out' })
  })
  await page.goto('/profile')

  await page.getByRole('button', { name: 'Sign out' }).click()

  await expect(page).toHaveURL('/login')
  await expect(
    page.getByRole('heading', { name: 'Sign in to your account' }),
  ).toBeVisible()
})
