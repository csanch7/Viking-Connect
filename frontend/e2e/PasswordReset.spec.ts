import { expect, test } from '@playwright/test'
import { fulfillJson, mockSession } from './support/mockApi'

test.beforeEach(async ({ page }) => {
  await mockSession(page)
})

test('requests a password reset without revealing account existence', async ({
  page,
}) => {
  await page.route('**/api/auth/forgot-password', async (route) => {
    await fulfillJson(route, {
      message: 'If an account exists, a reset link has been sent',
    })
  })
  await page.goto('/forgot-password')
  await page.getByLabel('Email').fill('jane@example.com')
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(page.getByRole('status')).toContainText('If an account exists')
})

test('sets a new password from a valid reset link', async ({ page }) => {
  await page.route('**/api/auth/reset-password', async (route) => {
    await fulfillJson(route, { message: 'Password reset successfully' })
  })
  await page.goto('/reset-password?token=valid-token')
  await page
    .getByLabel('New password', { exact: true })
    .fill('NewStrongPass123!')
  await page.getByLabel('Confirm new password').fill('NewStrongPass123!')
  await page.getByRole('button', { name: 'Save new password' }).click()
  await expect(page.getByRole('status')).toContainText('You can now sign in')
})
