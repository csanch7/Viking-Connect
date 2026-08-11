import { expect, test } from '@playwright/test'
import { fulfillJson, mockAuthenticatedSession } from './support/mockApi'

const mentor = {
  id: '42',
  name: 'Alex Mentor',
  email: 'alex@example.com',
  linkedin: 'https://www.linkedin.com/in/alex-mentor',
  type: 'mentor',
  areasOfExpertise: ['Finance'],
  gradYear: 2012,
}

test.beforeEach(async ({ page }) => {
  await mockAuthenticatedSession(page, true)
  await page.route('**/api/mentors/**', async (route) => {
    await fulfillJson(route, [mentor])
  })
})

test('requires confirmation before permanently deleting a mentor', async ({
  page,
}) => {
  let deleteRequests = 0
  await page.route('**/api/admin/users/42', async (route) => {
    deleteRequests += 1
    expect(route.request().method()).toBe('DELETE')
    await fulfillJson(route, { message: 'Alex Mentor has been deleted' })
  })

  await page.goto('/admin/mentors')

  await expect(
    page.getByRole('button', { name: 'Back to admin page' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Delete Alex Mentor' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Delete mentor account?' }),
  ).toBeVisible()
  await expect(
    page
      .getByRole('dialog', { name: 'Delete mentor account?' })
      .getByText('alex@example.com'),
  ).toBeVisible()
  expect(deleteRequests).toBe(0)

  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('dialog', { name: 'Delete mentor account?' }),
  ).toBeHidden()
  expect(deleteRequests).toBe(0)

  await page.getByRole('button', { name: 'Delete Alex Mentor' }).click()
  await page.getByRole('button', { name: 'Delete account' }).click()

  await expect(page.getByRole('status')).toHaveText(
    'Alex Mentor has been deleted',
  )
  await expect(page.getByRole('link', { name: 'Alex Mentor' })).toBeHidden()
  expect(deleteRequests).toBe(1)
})

test('searches mentors without replacing the admin list', async ({ page }) => {
  await page.goto('/admin/mentors')

  const searchRequest = page.waitForRequest((request) => {
    const url = new URL(request.url())
    return url.searchParams.get('searchText') === 'Alex'
  })
  await page.getByLabel('Mentor name').fill('Alex')
  await searchRequest

  await expect(
    page.getByRole('heading', { name: 'Manage mentors' }),
  ).toBeVisible()
  await expect(page.getByText('Gathering your information...')).toBeHidden()
})
