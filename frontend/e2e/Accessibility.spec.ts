import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {
  fulfillJson,
  mockAuthenticatedSession,
  mockColleges,
  mockSession,
  mockTopics,
} from './support/mockApi'

const publicPages = [
  { path: '/', heading: 'Viking Connect' },
  { path: '/login', heading: 'Sign in to your account' },
  { path: '/register', heading: 'Create your member profile' },
  { path: '/verification', heading: 'Your account is pending review' },
  { path: '/missing-page', heading: 'Page not found' },
]

for (const publicPage of publicPages) {
  test(`${publicPage.path} has no serious accessibility violations`, async ({
    page,
  }) => {
    await mockSession(page)
    await mockTopics(page)
    await mockColleges(page)
    await page.goto(publicPage.path)
    await expect(
      page.getByRole('heading', { name: publicPage.heading }),
    ).toBeVisible()

    const results = await new AxeBuilder({ page }).analyze()
    const seriousViolations = results.violations.filter(
      (violation) =>
        violation.impact === 'serious' || violation.impact === 'critical',
    )

    expect(seriousViolations).toEqual([])
  })
}

test('authenticated application pages have no accessibility violations', async ({
  page,
}) => {
  const user = {
    id: '42',
    name: 'Alex Mentor',
    email: 'alex@example.com',
    linkedin: 'https://www.linkedin.com/in/alex-mentor',
    type: 'mentor',
    college: 'DePaul University',
    bio: 'I help students prepare for careers in finance.',
    areasOfExpertise: ['Finance'],
    gradYear: 2012,
    status: 'approved',
    role: 'admin',
  }
  const menteeUser = {
    ...user,
    id: '77',
    name: 'Jordan Mentee',
    email: 'jordan@example.com',
    linkedin: 'https://www.linkedin.com/in/jordan-mentee',
    type: 'mentee',
    bio: 'I am exploring careers in finance and technology.',
    gradYear: 2027,
    role: 'user',
  }
  await mockAuthenticatedSession(page, true)
  await mockTopics(page, ['Finance'])
  await page.route('**/api/auth/me', async (route) =>
    fulfillJson(route, { user }),
  )
  await page.route('**/api/mentors/**', async (route) => fulfillJson(route, []))
  await page.route('**/api/mentees/**', async (route) => fulfillJson(route, []))
  await page.route('**/api/mentor/42', async (route) =>
    fulfillJson(route, user),
  )
  await page.route('**/api/mentee/77', async (route) =>
    fulfillJson(route, menteeUser),
  )
  await page.route('**/api/admin/mentor-count', async (route) =>
    fulfillJson(route, { count: 1 }),
  )
  await page.route('**/api/admin/mentee-count', async (route) =>
    fulfillJson(route, { count: 1 }),
  )
  await page.route('**/api/admin/pending-users', async (route) =>
    fulfillJson(route, { users: [user] }),
  )

  for (const [path, heading, view] of [
    ['/directory', 'Member directory'],
    ['/directory', 'Member directory', 'mentees'],
    ['/profile', 'Alex Mentor'],
    ['/mentor/42', 'Alex Mentor'],
    ['/mentee/77', 'Jordan Mentee'],
    ['/admin', 'Program review center'],
    ['/admin/pending-users', 'Pending users'],
    ['/admin/mentors', 'Manage mentors'],
    ['/admin/mentees', 'Manage mentees'],
  ]) {
    await page.goto(path)
    if (view === 'mentees') {
      await page.getByRole('button', { name: 'Mentees', exact: true }).click()
      await page.waitForTimeout(200)
    }
    await expect(
      page.getByRole('heading', { level: 1, name: heading }),
    ).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations, `${path} accessibility violations`).toEqual([])
  }
})
