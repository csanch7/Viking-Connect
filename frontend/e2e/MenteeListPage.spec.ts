import { expect, test } from '@playwright/test'
import { fulfillJson, mockAuthenticatedSession } from './support/mockApi'

const mentee = {
  id: '77',
  name: 'Jordan Mentee',
  email: 'jordan@example.com',
  linkedin: 'https://www.linkedin.com/in/jordan-mentee',
  type: 'mentee',
  areasOfExpertise: ['Career Planning'],
  gradYear: 2027,
}

test('requires confirmation before permanently deleting a mentee', async ({
  page,
}) => {
  await mockAuthenticatedSession(page, true)
  await page.route('**/api/mentees/**', async (route) => {
    await fulfillJson(route, [mentee])
  })
  await page.route('**/api/admin/users/77', async (route) => {
    expect(route.request().method()).toBe('DELETE')
    await fulfillJson(route, { message: 'Jordan Mentee has been deleted' })
  })

  await page.goto('/admin/mentees')

  await page.getByRole('button', { name: 'Delete Jordan Mentee' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Delete mentee account?' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Delete account' }).click()

  await expect(page.getByRole('status')).toHaveText(
    'Jordan Mentee has been deleted',
  )
  await expect(page.getByRole('link', { name: 'Jordan Mentee' })).toBeHidden()
})
