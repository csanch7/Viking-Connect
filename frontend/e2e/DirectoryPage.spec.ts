import { expect, test } from '@playwright/test'
import {
  fulfillJson,
  mockAuthenticatedSession,
  mockTopics,
} from './support/mockApi'

const mentors = [
  {
    id: '42',
    name: 'Alex Mentor',
    email: 'alex@example.com',
    linkedin: 'https://www.linkedin.com/in/alex-mentor',
    type: 'mentor',
    areasOfExpertise: ['Finance', 'Career Planning'],
    gradYear: 2012,
  },
]

test.beforeEach(async ({ page }) => {
  await mockAuthenticatedSession(page)
  await mockTopics(page, ['Career Planning', 'Data Ethics', 'Finance'])
  await page.route('**/api/mentors/**', async (route) => {
    await fulfillJson(route, mentors)
  })
})

test('shows the mentor directory and mentor contact details', async ({
  page,
}) => {
  await page.goto('/directory')

  await expect(
    page.getByRole('heading', { name: 'Find alumni mentors' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Alex Mentor' })).toHaveAttribute(
    'href',
    '/mentor/42',
  )
  await expect(page.getByText('alex@example.com')).toBeVisible()
  await expect(page.getByText('Finance')).toBeVisible()
})

test('applies an expertise filter to the mentor request', async ({ page }) => {
  await page.goto('/directory')
  await expect(
    page.getByRole('heading', { name: 'Find alumni mentors' }),
  ).toBeVisible()

  await page.getByRole('button', { name: /Filters/ }).click()
  await page.getByRole('checkbox', { name: 'Data Ethics', exact: true }).check()

  const filteredRequest = page.waitForRequest((request) => {
    const url = new URL(request.url())
    return (
      url.pathname === '/api/mentors/0' &&
      url.searchParams.get('filter') === 'Data Ethics'
    )
  })
  await page.getByRole('button', { name: 'Apply filters' }).click()

  await filteredRequest
})

test('paginates when another mentor result exists', async ({ page }) => {
  await page.route('**/api/mentors/**', async (route) => {
    const pageNumber = Number(
      new URL(route.request().url()).pathname.split('/').pop(),
    )
    await fulfillJson(
      route,
      pageNumber === 0
        ? Array.from({ length: 11 }, (_, index) => ({
            ...mentors[0],
            id: String(index + 1),
            name: `Mentor ${index + 1}`,
          }))
        : [
            {
              ...mentors[0],
              id: '11',
              name: 'Mentor 11',
            },
          ],
    )
  })
  await page.goto('/directory')

  await page.getByRole('button', { name: 'Next page' }).click()

  await expect(page.getByText('Page 2')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Mentor 11' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next page' })).toBeHidden()

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Previous page' }).click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('does not show a next page for exactly ten results', async ({ page }) => {
  await page.route('**/api/mentors/**', async (route) => {
    await fulfillJson(
      route,
      Array.from({ length: 10 }, (_, index) => ({
        ...mentors[0],
        id: String(index + 1),
        name: `Mentor ${index + 1}`,
      })),
    )
  })
  await page.goto('/directory')

  await expect(page.getByText('Page 1')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next page' })).toBeHidden()
})

test('shows an error state when mentor loading fails', async ({ page }) => {
  await page.route('**/api/mentors/**', async (route) => {
    await fulfillJson(route, { message: 'Unavailable' }, 503)
  })
  await page.goto('/directory')

  await expect(
    page.getByRole('heading', { name: 'Unable to load mentors' }),
  ).toBeVisible()
})
