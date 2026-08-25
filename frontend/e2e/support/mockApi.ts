import type { Page, Route } from '@playwright/test'

export async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

export async function mockSession(
  page: Page,
  session: { authenticated: boolean; admin: boolean; mentee: boolean } = {
    authenticated: false,
    admin: false,
    mentee: false,
  },
) {
  await page.route('**/api/auth/session', async (route) => {
    await fulfillJson(route, session)
  })
}

export async function mockAuthenticatedSession(
  page: Page,
  admin = false,
  mentee = false,
) {
  await mockSession(page, { authenticated: true, admin, mentee })
}

export async function mockTopics(
  page: Page,
  topics = ['Career Planning', 'Finance', 'Technology'],
) {
  await page.route('**/api/active-topics', async (route) => {
    await fulfillJson(route, { topics })
  })
}

export async function mockAllTopics(
  page: Page,
  topics = [
    { id: '1', name: 'Career Planning', is_active: true },
    { id: '2', name: 'Finance', is_active: true },
    { id: '3', name: 'Technology', is_active: true },
  ],
) {
  await page.route('**/api/topics', async (route) => {
    await fulfillJson(route, { topics })
  })
}

export async function mockColleges(
  page: Page,
  colleges = ['DePaul University', 'University of Illinois Chicago'],
) {
  await page.route('**/api/colleges*', async (route) => {
    await fulfillJson(route, { colleges })
  })
}

export async function chooseCollege(
  page: Page,
  college: string,
  searchText = college,
) {
  await page
    .getByRole('combobox', { name: 'College', exact: true })
    .fill(searchText)
  await page.getByRole('option', { name: college, exact: true }).click()
}
