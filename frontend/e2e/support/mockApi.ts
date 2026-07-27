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
  session: { authenticated: boolean; admin: boolean } = {
    authenticated: false,
    admin: false,
  },
) {
  await page.route('**/api/auth/session', async (route) => {
    await fulfillJson(route, session)
  })
}

export async function mockAuthenticatedSession(page: Page, admin = false) {
  await mockSession(page, { authenticated: true, admin })
}

export async function mockTopics(
  page: Page,
  topics = ['Career Planning', 'Finance', 'Technology'],
) {
  await page.route('**/api/topics', async (route) => {
    await fulfillJson(route, { topics })
  })
}
