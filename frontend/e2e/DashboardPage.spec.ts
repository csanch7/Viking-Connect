import { expect, test } from '@playwright/test'
import { fulfillJson, mockAuthenticatedSession } from './support/mockApi'

const mentors = [
  {
    id: '42',
    username: 'Alex Mentor',
    email: 'alex@example.com',
    linkedin: 'https://www.linkedin.com/in/alex-mentor',
    areasOfExpertise: ['Finance', 'Career Planning'],
    gradYear: 2012,
  },
]

test.beforeEach(async ({ page }) => {
  await mockAuthenticatedSession(page)
  await page.route('**/api/mentors/**', async (route) => {
    await fulfillJson(route, mentors)
  })
})

test('shows the mentor directory and mentor contact details', async ({
  page,
}) => {
  await page.goto('/dashboard')

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
  await page.goto('/dashboard')
  await expect(
    page.getByRole('heading', { name: 'Find alumni mentors' }),
  ).toBeVisible()

  await page.getByRole('button', { name: /Filters/ }).click()
  await page.getByRole('checkbox', { name: 'Finance' }).check()

  const filteredRequest = page.waitForRequest((request) => {
    const url = new URL(request.url())
    return (
      url.pathname === '/api/mentors/0' &&
      url.searchParams.get('filter') === 'Finance'
    )
  })
  await page.getByRole('button', { name: 'Apply filters' }).click()

  await filteredRequest
})

test('paginates a full mentor result page', async ({ page }) => {
  await page.route('**/api/mentors/**', async (route) => {
    const pageNumber = Number(
      new URL(route.request().url()).pathname.split('/').pop(),
    )
    await fulfillJson(
      route,
      pageNumber === 0
        ? Array.from({ length: 10 }, (_, index) => ({
            ...mentors[0],
            id: String(index + 1),
            username: `Mentor ${index + 1}`,
          }))
        : [],
    )
  })
  await page.goto('/dashboard')

  await page.getByRole('button', { name: 'Next page' }).click()

  await expect(page.getByText('Page 2')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'No mentors found' }),
  ).toBeVisible()
})

test('shows an error state when mentor loading fails', async ({ page }) => {
  await page.route('**/api/mentors/**', async (route) => {
    await fulfillJson(route, { message: 'Unavailable' }, 503)
  })
  await page.goto('/dashboard')

  await expect(
    page.getByRole('heading', { name: 'Unable to load mentors' }),
  ).toBeVisible()
})
