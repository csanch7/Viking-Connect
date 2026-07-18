import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockSession } from './support/mockApi'

const publicPages = [
  { path: '/', heading: 'Turn school pride into career momentum.' },
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
