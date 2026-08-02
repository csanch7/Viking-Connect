import { expect, test } from '@playwright/test'
import { fulfillJson, mockAuthenticatedSession } from './support/mockApi'

test('shows directory totals and the pending-user queue link', async ({
  page,
}) => {
  await mockAuthenticatedSession(page, true)
  await page.route('**/api/admin/mentor-count', async (route) => {
    await fulfillJson(route, { count: '12' })
  })
  await page.route('**/api/admin/mentee-count', async (route) => {
    await fulfillJson(route, { count: '34' })
  })
  await page.goto('/admin')

  await expect(
    page.getByRole('heading', { name: 'Program review center' }),
  ).toBeVisible()
  await expect(page.getByText('12', { exact: true })).toBeVisible()
  await expect(page.getByText('34', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'View pending users' }),
  ).toHaveAttribute('href', '/admin/pending-users')
  const approvedMembers = page.getByRole('region', {
    name: 'Approved members',
  })
  await expect(
    approvedMembers.getByRole('link', { name: 'Manage mentors' }),
  ).toHaveAttribute('href', '/admin/mentors')
  await expect(
    approvedMembers.getByRole('link', { name: 'Manage mentees' }),
  ).toHaveAttribute('href', '/admin/mentees')
})

test('redirects a signed-in non-admin visitor to the directory', async ({
  page,
}) => {
  await mockAuthenticatedSession(page)
  await page.route('**/api/mentors/**', async (route) => {
    await fulfillJson(route, [])
  })
  await page.goto('/admin')

  await expect(page).toHaveURL('/directory')
  await expect(
    page.getByRole('heading', { name: 'Find alumni mentors' }),
  ).toBeVisible()
})
