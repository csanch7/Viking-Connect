import { expect, test } from '@playwright/test'
import {
  fulfillJson,
  mockColleges,
  mockSession,
  mockTopics,
} from './support/mockApi'

test.beforeEach(async ({ page }) => {
  await mockSession(page)
  await mockTopics(page)
  await mockColleges(page)
  await page.goto('/register')
})

test('shows the fields that match the selected program role', async ({
  page,
}) => {
  await page.getByRole('radio', { name: /Mentor/ }).check()
  await expect(page.getByLabel('Graduation year')).toHaveAttribute(
    'type',
    'number',
  )
  await expect(page.getByRole('heading', { name: 'About you' })).toBeVisible()
  await expect(page.getByLabel('Bio')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Areas of expertise' }),
  ).toBeVisible()
  await expect(page.getByLabel('Select an area')).toBeVisible()

  await page.getByRole('radio', { name: /Mentee/ }).check()
  await expect(page.getByRole('heading', { name: 'About you' })).toBeVisible()
  await expect(page.getByLabel('Bio')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Areas of expertise' }),
  ).toBeHidden()
  await expect(
    page.getByRole('heading', { name: 'Areas of interest' }),
  ).toBeVisible()
})

test('shows a loading state before database topics arrive', async ({
  page,
}) => {
  await page.unroute('**/api/topics')

  let releaseTopics!: () => void
  const waitForRelease = new Promise<void>((resolve) => {
    releaseTopics = resolve
  })

  await page.route('**/api/topics', async (route) => {
    await waitForRelease
    await fulfillJson(route, { topics: ['Career Planning', 'Finance'] })
  })

  await page.reload()
  await page.getByRole('radio', { name: /Mentor/ }).check()

  const selector = page.getByLabel('Select an area')
  await expect(selector).toBeDisabled()
  await expect(selector.locator('option:checked')).toHaveText(
    'Loading topics...',
  )

  releaseTopics()

  await expect(selector).toBeEnabled()
  await expect(selector.getByRole('option', { name: 'Finance' })).toBeAttached()
})

test('validates and submits a complete mentee registration', async ({
  page,
}) => {
  let submittedBody: unknown
  await page.route('**/api/register', async (route) => {
    submittedBody = route.request().postDataJSON()
    await fulfillJson(route, { message: 'User created' }, 201)
  })

  await page.getByLabel('Name').fill('Jane Student')
  await page.getByLabel('Email').fill('jane@example.com')
  await page.getByLabel('Password', { exact: true }).fill('StrongPass123!')
  await page.getByLabel('Confirm password').fill('StrongPass123!')
  await page.getByRole('radio', { name: /Mentee/ }).check()
  await page
    .getByLabel('LinkedIn URL')
    .fill('https://www.linkedin.com/in/jane-student')
  await page.getByLabel('Graduation year').fill('2027')
  await page.getByLabel('College').selectOption('DePaul University')
  await page
    .getByLabel('Bio')
    .fill('I am interested in interview preparation and career planning.')
  await page.getByLabel('Select an area').selectOption('Career Planning')
  await page.getByRole('button', { name: 'Add' }).click()
  await page.getByRole('button', { name: 'Submit registration' }).click()

  await expect(page).toHaveURL('/verification')
  await expect(
    page.getByRole('heading', { name: 'Your account is pending review' }),
  ).toBeVisible()
  expect(submittedBody).toMatchObject({
    name: 'Jane Student',
    email: 'jane@example.com',
    type: 'mentee',
    college: 'DePaul University',
    bio: 'I am interested in interview preparation and career planning.',
    areasOfExpertise: ['Career Planning'],
    gradYear: 2027,
  })
})
