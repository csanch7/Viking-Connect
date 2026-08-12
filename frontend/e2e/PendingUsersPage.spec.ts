import { expect, test } from '@playwright/test'
import { fulfillJson, mockAuthenticatedSession } from './support/mockApi'

const pendingUser = {
  id: '19',
  name: 'Pat Mentor',
  email: 'pat@example.com',
  linkedin: 'https://www.linkedin.com/in/pat-mentor',
  type: 'mentor',
  college: 'DePaul University',
  bio: 'I mentor students interested in technology careers.',
  areasOfExpertise: ['Technology', 'Leadership'],
  gradYear: 2008,
  role: 'user',
}

test.beforeEach(async ({ page }) => {
  await mockAuthenticatedSession(page, true)
  await page.route('**/api/admin/pending-users', async (route) => {
    await fulfillJson(route, { users: [pendingUser] })
  })
})

test('shows pending registration details', async ({ page }) => {
  await page.goto('/admin/pending-users')

  await expect(
    page.getByRole('heading', { name: 'Pending users' }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pat Mentor' })).toBeVisible()
  await expect(page.getByText('pat@example.com')).toBeVisible()
  await expect(page.getByText('Technology, Leadership')).toBeVisible()
})

test('approves a pending user and removes them from the queue', async ({
  page,
}) => {
  await page.route('**/api/admin/approve-user/19', async (route) => {
    await fulfillJson(route, { message: '19 has been approved' })
  })
  await page.goto('/admin/pending-users')

  await page.getByRole('button', { name: 'Approve' }).click()
  await page
    .getByRole('button', { name: "Confirm Pat Mentor's approval" })
    .click()

  await expect(page.getByRole('status')).toHaveText(
    'Pat Mentor was approved for Viking Connect.',
  )
  await expect(page.getByRole('heading', { name: 'Pat Mentor' })).toBeHidden()
  await expect(
    page.getByRole('heading', { name: 'No pending users' }),
  ).toBeVisible()
})

test('denies a pending user and removes them from the queue', async ({
  page,
}) => {
  await page.route('**/api/admin/deny-user/19', async (route) => {
    await fulfillJson(route, { message: '19 has been denied' })
  })
  await page.goto('/admin/pending-users')

  await page.getByRole('button', { name: 'Deny' }).click()

  await page.getByRole('button', { name: 'Confirm denial' }).click()

  await expect(page.getByRole('status')).toHaveText(
    "Pat Mentor's registration was denied.",
  )
  await expect(
    page.getByRole('heading', { name: 'No pending users' }),
  ).toBeVisible()
})
