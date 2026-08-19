import { expect, test } from '@playwright/test'
import {
  fulfillJson,
  mockAuthenticatedSession,
  mockColleges,
  mockTopics,
} from './support/mockApi'

const mentee = {
  id: '7',
  name: 'Jane Student',
  email: 'jane@example.com',
  type: 'mentee',
  college: null,
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
  await mockColleges(page)
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
  await expect(page.getByRole('button', { name: 'Edit profile' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit bio' })).toBeHidden()
})

test('edits and saves the complete profile from one action', async ({
  page,
}) => {
  await page.route('**/api/profile/7', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      bio: 'I am looking for resume review and interview preparation.',
      college: 'University of Illinois Chicago',
      areasOfExpertise: ['Career Planning'],
    })
    await fulfillJson(route, {
      message: 'Profile has been successfully updated',
      bio: 'I am looking for resume review and interview preparation.',
      college: 'University of Illinois Chicago',
      areasOfExpertise: ['Career Planning'],
    })
  })
  await page.goto('/profile')

  await page.getByRole('button', { name: 'Edit profile' }).click()
  await expect(
    page.getByRole('heading', { name: 'Edit your profile' }),
  ).toBeVisible()
  await expect(page.getByText('No changes yet')).toBeVisible()
  await page
    .getByLabel('About you')
    .fill('I am looking for resume review and interview preparation.')
  await page
    .getByLabel('College')
    .selectOption('University of Illinois Chicago')
  await page.getByLabel('Add an interest').selectOption('Career Planning')
  await page.getByRole('button', { name: 'Add' }).click()
  await expect(page.getByText('Unsaved changes')).toBeVisible()
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('button', { name: 'Edit profile' })).toBeVisible()

  await expect(
    page.getByText('I am looking for resume review and interview preparation.'),
  ).toBeVisible()
  await expect(
    page.getByText('University of Illinois Chicago', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('listitem').filter({ hasText: /^Career Planning$/ }),
  ).toBeVisible()
  await expect(
    page.getByText('Your profile is updated and visible to the community.'),
  ).toBeVisible()
})

test('warns before discarding unsaved profile changes', async ({ page }) => {
  await page.goto('/profile')

  await page.getByRole('button', { name: 'Edit profile' }).click()
  await page.getByLabel('About you').fill('A changed introduction')
  await page.getByRole('button', { name: 'Cancel' }).click()

  await expect(
    page.getByRole('heading', { name: 'Discard your profile changes?' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Discard changes' }).click()

  await expect(page.getByRole('button', { name: 'Edit profile' })).toBeVisible()
  await expect(page.getByText('A changed introduction')).toBeHidden()
})

test('signs out and returns to the sign-in page', async ({ page }) => {
  await page.route('**/api/auth/logout', async (route) => {
    await fulfillJson(route, { message: 'Logged out' })
  })
  await page.goto('/profile')

  await page.getByRole('button', { name: 'Sign out' }).nth(1).click()

  await expect(page).toHaveURL('/login')
  await expect(
    page.getByRole('heading', { name: 'Sign in to your account' }),
  ).toBeVisible()
})
