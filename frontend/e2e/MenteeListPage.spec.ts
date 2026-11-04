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

test('requires confirmation before deleting a mentee', async ({ page }) => {
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

test('downloads mentee contacts as a safe CSV with loading feedback', async ({
  page,
}) => {
  await mockAuthenticatedSession(page, true)
  await page.route('**/api/mentees/**', (route) => fulfillJson(route, [mentee]))
  let releaseExport!: () => void
  const exportReady = new Promise<void>((resolve) => {
    releaseExport = resolve
  })
  await page.route('**/api/admin/mentee-list', async (route) => {
    await exportReady
    await fulfillJson(route, {
      users: [
        { name: mentee.name, email: mentee.email },
        { name: '=1+1', email: 'test@example.com' },
      ],
    })
  })
  await page.goto('/admin/mentees')
  await page.getByRole('button', { name: 'Download mentee list' }).click()
  await expect(
    page.getByRole('button', { name: 'Preparing download…' }),
  ).toBeDisabled()
  const downloaded = page.waitForEvent('download')
  releaseExport()
  const download = await downloaded
  expect(download.suggestedFilename()).toBe('mentees.csv')
  const stream = await download.createReadStream()
  const chunks = []
  for await (const chunk of stream!) chunks.push(chunk)
  expect(Buffer.concat(chunks).toString('utf8')).toBe(
    "name,email\nJordan Mentee,jordan@example.com\n'=1+1,test@example.com",
  )
  await expect(
    page.getByRole('button', { name: 'Download mentee list' }),
  ).toBeEnabled()
})

test('shows a recoverable error when exporting fails', async ({ page }) => {
  await mockAuthenticatedSession(page, true)
  await page.route('**/api/mentees/**', (route) => fulfillJson(route, [mentee]))
  await page.route('**/api/admin/mentee-list', (route) =>
    fulfillJson(route, {}, 500),
  )
  await page.goto('/admin/mentees')
  await page.getByRole('button', { name: 'Download mentee list' }).click()
  await expect(page.getByRole('alert')).toHaveText(
    'We could not download the mentee list. Please try again.',
  )
  await expect(
    page.getByRole('button', { name: 'Download mentee list' }),
  ).toBeEnabled()
})
