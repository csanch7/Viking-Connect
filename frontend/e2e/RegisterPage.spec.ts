import { expect, test } from '@playwright/test'
import { fulfillJson, mockSession } from './support/mockApi'

test.beforeEach(async ({ page }) => {
  await mockSession(page)
  await page.goto('/register')
})

test('shows the fields that match the selected program role', async ({
  page,
}) => {
  await page.getByRole('radio', { name: /Mentor/ }).check()
  await expect(
    page.getByRole('heading', { name: 'Areas of expertise' }),
  ).toBeVisible()
  await expect(page.getByLabel('Select an area')).toBeVisible()

  await page.getByRole('radio', { name: /Mentee/ }).check()
  await expect(
    page.getByRole('heading', { name: 'Mentorship goals' }),
  ).toBeVisible()
  await expect(page.getByLabel('What help are you looking for?')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Areas of expertise' }),
  ).toBeHidden()
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
  await page
    .getByLabel('What help are you looking for?')
    .fill('Interview preparation and career planning')
  await page.getByRole('button', { name: 'Submit registration' }).click()

  await expect(page).toHaveURL('/verification')
  await expect(
    page.getByRole('heading', { name: 'Your account is pending review' }),
  ).toBeVisible()
  expect(submittedBody).toMatchObject({
    username: 'Jane Student',
    email: 'jane@example.com',
    type: 'mentee',
    gradYear: 2027,
  })
})
