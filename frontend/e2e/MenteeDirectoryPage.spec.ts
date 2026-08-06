import { expect, test } from '@playwright/test'
import {
  fulfillJson,
  mockAuthenticatedSession,
  mockTopics,
} from './support/mockApi'

const mentee = {
  id: '77',
  name: 'Jordan Mentee',
  email: 'jordan@example.com',
  linkedin: 'https://www.linkedin.com/in/jordan-mentee',
  type: 'mentee',
  areasOfExpertise: ['Career Planning'],
  gradYear: 2027,
}

test('loads approved mentees for an authenticated mentee', async ({ page }) => {
  await mockAuthenticatedSession(page, false, true)
  await mockTopics(page, ['Career Planning'])
  await page.route('**/api/mentees/**', async (route) => {
    await fulfillJson(route, [mentee])
  })

  await page.goto('/mentees/directory')

  await expect(
    page.getByRole('heading', { name: 'Connect with fellow mentees' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Jordan Mentee' }),
  ).toHaveAttribute('href', '/mentee/77')
  await expect(page.getByText('jordan@example.com')).toBeVisible()
})

test('applies interest filters without replacing the directory', async ({
  page,
}) => {
  let releaseFilteredResponse: (() => void) | undefined
  const filteredResponseAllowed = new Promise<void>((resolve) => {
    releaseFilteredResponse = resolve
  })

  await mockAuthenticatedSession(page, false, true)
  await mockTopics(page, ['Career Planning', 'Data Ethics'])
  await page.route('**/api/mentees/**', async (route) => {
    const isFiltered = new URL(route.request().url()).searchParams.has('filter')

    if (isFiltered) {
      await filteredResponseAllowed
    }

    await fulfillJson(route, [mentee])
  })

  await page.goto('/mentees/directory')
  await page.getByRole('button', { name: /Filters/ }).click()
  await page.getByRole('checkbox', { name: 'Data Ethics', exact: true }).check()

  const filteredRequest = page.waitForRequest((request) => {
    const url = new URL(request.url())
    return url.searchParams.get('filter') === 'Data Ethics'
  })
  await page.getByRole('button', { name: 'Apply filters' }).click()
  await filteredRequest

  await expect(
    page.getByRole('heading', { name: 'Connect with fellow mentees' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Jordan Mentee' })).toBeVisible()
  await expect(page.getByText('Gathering your information...')).toBeHidden()

  releaseFilteredResponse?.()
})
