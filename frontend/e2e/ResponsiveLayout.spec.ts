import { expect, test } from '@playwright/test'
import { fulfillJson, mockTopics } from './support/mockApi'

test('key pages do not create horizontal document scrolling', async ({
  page,
}) => {
  let authenticated = false
  await page.route('**/api/auth/session', async (route) => {
    await fulfillJson(route, { authenticated, admin: authenticated })
  })
  await mockTopics(page)
  await page.route('**/api/admin/mentor-count', async (route) => {
    await fulfillJson(route, { count: 12 })
  })
  await page.route('**/api/admin/mentee-count', async (route) => {
    await fulfillJson(route, { count: 34 })
  })

  for (const path of ['/', '/register']) {
    await page.goto(path)
    if (path === '/register') {
      await page.getByRole('radio', { name: 'Mentee' }).check()
    }
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(
      dimensions.scrollWidth,
      `${path} overflowed horizontally`,
    ).toBeLessThanOrEqual(dimensions.clientWidth)
  }

  authenticated = true
  await page.goto('/admin')
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
})
