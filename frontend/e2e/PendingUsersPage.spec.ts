import { expect, test } from '@playwright/test'
import { fulfillJson, mockAuthenticatedSession } from './support/mockApi'

const pendingUser = {
  id: '19',
  username: 'Pat Mentor',
  email: 'pat@example.com',
  linkedin: 'https://www.linkedin.com/in/pat-mentor',
  type: 'mentor',
  helpText: '',
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

  await expect(page.getByRole('status')).toHaveText('User approved')
  await expect(page.getByRole('heading', { name: 'Pat Mentor' })).toBeHidden()
  await expect(
    page.getByRole('heading', { name: 'No pending users' }),
  ).toBeVisible()
})
