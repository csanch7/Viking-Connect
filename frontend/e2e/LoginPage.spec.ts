import { expect, test } from '@playwright/test'
import { fulfillJson, mockSession } from './support/mockApi'

test('shows the sign-in form and an API authentication error', async ({
  page,
}) => {
  await mockSession(page)
  await page.route('**/api/auth/login', async (route) => {
    await fulfillJson(route, { message: 'Invalid email or password' }, 401)
  })
  await page.goto('/login')

  await expect(
    page.getByRole('heading', { name: 'Sign in to your account' }),
  ).toBeVisible()

  await page.getByLabel('Email').fill('jane@example.com')
  await page.getByLabel('Password').fill('WrongPassword123!')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('alert')).toContainText(
    'Invalid email or password',
  )
})

test('redirects an already authenticated visitor to their profile', async ({
  page,
}) => {
  await mockSession(page, { authenticated: true, admin: false })
  await page.route('**/api/auth/me', async (route) => {
    await fulfillJson(route, {
      user: {
        id: '7',
        username: 'Jane Student',
        email: 'jane@example.com',
        type: 'mentee',
        linkedin: 'https://www.linkedin.com/in/jane-student',
        helpText: 'Interview preparation',
        areasOfExpertise: [],
        gradYear: 2027,
        status: 'approved',
        role: 'user',
      },
    })
  })
  await page.goto('/login')

  await expect(page).toHaveURL('/profile')
  await expect(
    page.getByRole('heading', { name: 'Jane Student' }),
  ).toBeVisible()
})
