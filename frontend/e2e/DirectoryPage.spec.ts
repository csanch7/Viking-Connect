import { expect, test } from '@playwright/test'
import {
  fulfillJson,
  mockAuthenticatedSession,
  mockColleges,
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
  await mockColleges(page)
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
  await expect(page.getByRole('link', { name: 'Email' })).toHaveAttribute(
    'href',
    'mailto:alex@example.com',
  )
  await expect(page.getByText('Finance')).toBeVisible()
})

test('shows personalized recommendations to mentees', async ({ page }) => {
  await page.unroute('**/api/auth/session')
  await mockAuthenticatedSession(page, false, true)
  await page.route('**/api/recommendations/mentors', async (route) => {
    await fulfillJson(route, {
      recommendations: [
        {
          mentor: mentors[0],
          recommendationScore: 60,
          coveragePercentage: 50,
          sharedTopicCount: 2,
          matchedTopics: ['Career Planning', 'Finance'],
          sameCollege: true,
        },
      ],
    })
  })

  await page.goto('/directory')

  await expect(
    page.getByRole('heading', { name: 'Recommended for you' }),
  ).toBeVisible()
  await expect(
    page.getByText('You share a college connection and mentoring interests.'),
  ).toBeVisible()
  await expect(page.getByText('2 shared topics')).toBeVisible()
  await expect(page.getByText('Same college')).toBeVisible()
  await expect(page.getByText('/100 match')).toBeHidden()
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
  await expect(page.getByLabel('Active filters')).toContainText(
    'Expertise: Data Ethics',
  )
})

test('keeps the directory visible while filters are applied', async ({
  page,
}) => {
  let releaseFilteredResponse: (() => void) | undefined
  const filteredResponseAllowed = new Promise<void>((resolve) => {
    releaseFilteredResponse = resolve
  })

  await page.unroute('**/api/mentors/**')
  await page.route('**/api/mentors/**', async (route) => {
    const isFiltered = new URL(route.request().url()).searchParams.has('filter')

    if (isFiltered) {
      await filteredResponseAllowed
    }

    await fulfillJson(route, mentors)
  })

  await page.goto('/directory')
  await page.getByRole('button', { name: /Filters/ }).click()
  await page.getByRole('checkbox', { name: 'Data Ethics', exact: true }).check()

  const filteredRequest = page.waitForRequest((request) =>
    new URL(request.url()).searchParams.has('filter'),
  )
  await page.getByRole('button', { name: 'Apply filters' }).click()
  await filteredRequest

  await expect(
    page.getByRole('heading', { name: 'Find alumni mentors' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Alex Mentor' })).toBeVisible()
  await expect(page.getByText('Gathering your information...')).toBeHidden()

  releaseFilteredResponse?.()
})

test('applies and clears a separate college filter', async ({ page }) => {
  await page.goto('/directory')
  await page.getByRole('button', { name: /Filters/ }).click()
  await page
    .getByLabel('College')
    .selectOption('University of Illinois Chicago')

  const filteredRequest = page.waitForRequest((request) => {
    const url = new URL(request.url())
    return (
      url.pathname === '/api/mentors/0' &&
      url.searchParams.get('college') === 'University of Illinois Chicago'
    )
  })

  await page.getByRole('button', { name: 'Apply filters' }).click()
  await filteredRequest

  const clearedRequest = page.waitForRequest((request) => {
    const url = new URL(request.url())
    return url.pathname === '/api/mentors/0' && !url.searchParams.has('college')
  })

  await page.getByRole('button', { name: 'Clear all filters' }).click()
  await clearedRequest
  await page.getByRole('button', { name: /Filters/ }).click()
  await expect(page.getByLabel('College')).toHaveValue('')
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
