import { expect, test } from '@playwright/test'
import {
  chooseCollege,
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
    page.getByRole('heading', { name: 'Member directory' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Mentors', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('link', { name: 'Alex Mentor' })).toHaveAttribute(
    'href',
    '/mentor/42',
  )
  await expect(
    page.getByRole('region', { name: 'Mentor list' }).getByText('Finance'),
  ).toBeVisible()
})

test('previews the directory structure while mentor profiles load', async ({
  page,
}) => {
  let releaseResponse: (() => void) | undefined
  const responseAllowed = new Promise<void>((resolve) => {
    releaseResponse = resolve
  })

  await page.unroute('**/api/mentors/**')
  await page.route('**/api/mentors/**', async (route) => {
    await responseAllowed
    await fulfillJson(route, mentors)
  })

  await page.goto('/directory')

  const loadingState = page.getByRole('status', { name: 'Loading mentors' })
  await expect(loadingState).toHaveAttribute('aria-busy', 'true')
  await expect(
    loadingState.locator('.directory-loading-skeleton-row'),
  ).toHaveCount(3)

  releaseResponse?.()
  await expect(page.getByRole('link', { name: 'Alex Mentor' })).toBeVisible()
  await expect(loadingState).toHaveCount(0)
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
    page.getByText(
      'A fellow St. Laurence alum who also knows Career Planning.',
    ),
  ).toBeVisible()
  await expect(
    page.getByLabel('Why this match').getByText('Career Planning'),
  ).toBeVisible()
  await expect(
    page.getByText('College connection', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'View profile and contact' }),
  ).toHaveAttribute('href', '/mentor/42')
  await expect(page.getByText('/100 match')).toBeHidden()
})

test('describes a same-college-only recommendation accurately', async ({
  page,
}) => {
  await page.unroute('**/api/auth/session')
  await mockAuthenticatedSession(page, false, true)
  await page.route('**/api/recommendations/mentors', async (route) => {
    await fulfillJson(route, {
      recommendations: [
        {
          mentor: {
            ...mentors[0],
            id: '84',
            name: 'Taylor Mentor',
            areasOfExpertise: ['Technology', 'Product Design'],
          },
          recommendationScore: 10,
          coveragePercentage: 0,
          sharedTopicCount: 0,
          matchedTopics: [],
          sameCollege: true,
        },
      ],
    })
  })

  await page.goto('/directory')

  await expect(
    page.getByText(
      'A shared college connection gives you a natural place to start.',
    ),
  ).toBeVisible()
  await expect(page.getByText('Mentor expertise / industries')).toBeVisible()
  await expect(page.getByText('Technology')).toBeVisible()
  await expect(page.getByText('No shared topics')).toBeHidden()
})

test('shows a recommendation skeleton while personalized matches load', async ({
  page,
}) => {
  let releaseRecommendations: (() => void) | undefined
  const recommendationsAllowed = new Promise<void>((resolve) => {
    releaseRecommendations = resolve
  })

  await page.unroute('**/api/auth/session')
  await mockAuthenticatedSession(page, false, true)
  await page.route('**/api/recommendations/mentors', async (route) => {
    await recommendationsAllowed
    await fulfillJson(route, { recommendations: [] })
  })

  await page.goto('/directory')

  const loadingState = page.getByRole('status', {
    name: 'Loading mentor recommendations',
  })
  await expect(loadingState).toHaveAttribute('aria-busy', 'true')
  await expect(
    loadingState.locator('.recommendation-card--loading'),
  ).toHaveCount(3)

  releaseRecommendations?.()
  await expect(page.getByText('No close matches yet')).toBeVisible()
})

test('recovers when personalized recommendations fail to load', async ({
  page,
}) => {
  let requestCount = 0

  await page.unroute('**/api/auth/session')
  await mockAuthenticatedSession(page, false, true)
  await page.route('**/api/recommendations/mentors', async (route) => {
    requestCount += 1
    await fulfillJson(
      route,
      requestCount === 1 ? { message: 'Unavailable' } : { recommendations: [] },
      requestCount === 1 ? 503 : 200,
    )
  })

  await page.goto('/directory')

  await expect(
    page.getByText('Recommendations are temporarily unavailable'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Try recommendations again' }).click()

  await expect(page.getByText('No close matches yet')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Review your profile' }),
  ).toHaveAttribute('href', '/profile')
})

test('applies an expertise filter to the mentor request', async ({ page }) => {
  await page.goto('/directory')
  await expect(
    page.getByRole('heading', { name: 'Member directory' }),
  ).toBeVisible()

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
  await page.getByRole('checkbox', { name: 'Data Ethics', exact: true }).check()

  const filteredRequest = page.waitForRequest((request) =>
    new URL(request.url()).searchParams.has('filter'),
  )
  await page.getByRole('button', { name: 'Apply filters' }).click()
  await filteredRequest

  await expect(
    page.getByRole('heading', { name: 'Member directory' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Alex Mentor' })).toBeVisible()
  await expect(page.getByText('Gathering your information...')).toBeHidden()

  releaseFilteredResponse?.()
})

test('applies and clears a separate college filter', async ({ page }) => {
  await page.goto('/directory')
  const expertiseBox = await page.getByLabel('Search expertise').boundingBox()
  const collegeBox = await page
    .getByRole('combobox', { name: 'College', exact: true })
    .boundingBox()

  if (!expertiseBox || !collegeBox) {
    throw new Error('Directory filter controls should be visible')
  }

  expect(Math.abs(expertiseBox.height - collegeBox.height)).toBeLessThanOrEqual(
    1,
  )

  if ((page.viewportSize()?.width ?? 0) <= 760) {
    expect(Math.abs(expertiseBox.x - collegeBox.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(expertiseBox.width - collegeBox.width)).toBeLessThanOrEqual(
      1,
    )
    expect(collegeBox.y).toBeGreaterThan(expertiseBox.y + expertiseBox.height)
  } else {
    expect(Math.abs(expertiseBox.y - collegeBox.y)).toBeLessThanOrEqual(1)
  }

  await chooseCollege(page, 'University of Illinois Chicago', 'Illinois')

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
  await expect(page.getByLabel('College', { exact: true })).toHaveValue('')
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

test('uses the full directory width when no mentors are available', async ({
  page,
}) => {
  await page.unroute('**/api/mentors/**')
  await page.route('**/api/mentors/**', async (route) => {
    await fulfillJson(route, [])
  })

  await page.goto('/directory')

  const emptyState = page.locator('.directory-empty')
  await expect(
    emptyState.getByRole('heading', { name: 'No mentors yet' }),
  ).toBeVisible()

  const [emptyStateWidth, controlsWidth] = await Promise.all([
    emptyState.evaluate((element) => element.getBoundingClientRect().width),
    page
      .locator('.directory-controls')
      .evaluate((element) => element.getBoundingClientRect().width),
  ])

  expect(Math.abs(emptyStateWidth - controlsWidth)).toBeLessThan(1)
})

test('keeps filtered no-results recovery concise', async ({ page }) => {
  await page.unroute('**/api/mentors/**')
  await page.route('**/api/mentors/**', async (route) => {
    const hasCollegeFilter = new URL(route.request().url()).searchParams.has(
      'college',
    )
    await fulfillJson(route, hasCollegeFilter ? [] : mentors)
  })

  await page.goto('/directory')
  await chooseCollege(page, 'University of Illinois Chicago', 'Illinois')
  await page.getByRole('button', { name: 'Apply filters' }).click()

  await expect(
    page.getByRole('heading', { name: 'No matching mentors' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Clear all filters' }),
  ).toHaveCount(1)
  await expect(page.getByText('Page 1')).toBeHidden()
})

test('resets filters when switching views and keeps a clean URL', async ({
  page,
}) => {
  await page.route('**/api/mentees/**', async (route) => {
    await fulfillJson(route, [])
  })
  await page.goto('/directory')

  await page.getByRole('checkbox', { name: 'Data Ethics', exact: true }).check()
  await page.getByRole('button', { name: 'Apply filters' }).click()

  await expect(page).toHaveURL('/directory')

  await page.getByRole('button', { name: 'Mentees', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Search mentees' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Mentors', exact: true }).click()
  await expect(page.getByLabel('Active filters')).toHaveCount(0)

  await page.getByRole('button', { name: 'Mentees', exact: true }).click()
  await expect(page.getByLabel('Active filters')).toHaveCount(0)
  await expect(page).toHaveURL('/directory')
})
