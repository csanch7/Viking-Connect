import { expect, test } from '@playwright/test'
import { fulfillJson, mockAuthenticatedSession } from './support/mockApi'

const mentee = {
  id: '7',
  username: 'Jane Student',
  email: 'jane@example.com',
  type: 'mentee',
  linkedin: 'https://www.linkedin.com/in/jane-student',
  helpText: 'Interview preparation',
  areasOfExpertise: [],
  gradYear: 2027,
  status: 'approved',
  role: 'user',
}

test.beforeEach(async ({ page }) => {
  await mockAuthenticatedSession(page)
  await page.route('**/api/auth/me', async (route) => {
    await fulfillJson(route, { user: mentee })
  })
})

test('shows the signed-in member profile', async ({ page }) => {
  await page.goto('/profile')

  await expect(
    page.getByRole('heading', { name: 'Jane Student' }),
  ).toBeVisible()
  await expect(page.getByText('Interview preparation')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'jane@example.com' }),
  ).toHaveAttribute('href', 'mailto:jane@example.com')
  await expect(page.getByText('2027')).toBeVisible()
})

test('edits and saves a mentee help request', async ({ page }) => {
  await page.route('**/api/change-text/7', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      helpText: 'Resume review and interview preparation',
    })
    await fulfillJson(route, {
      message: 'Help text has been successfully updated',
      helpText: 'Resume review and interview preparation',
    })
  })
  await page.goto('/profile')

  await page.getByRole('button', { name: 'Edit help text' }).click()
  await page
    .getByLabel('Help needed')
    .fill('Resume review and interview preparation')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(
    page.getByText('Resume review and interview preparation'),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Edit help text' }),
  ).toBeVisible()
})

test('edits and saves mentor expertise', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await fulfillJson(route, {
      user: {
        ...mentee,
        type: 'mentor',
        helpText: '',
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
