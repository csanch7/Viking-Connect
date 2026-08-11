import { expect, test } from '@playwright/test'
import {
  fulfillJson,
  mockAuthenticatedSession,
  mockTopics,
} from './support/mockApi'

test.beforeEach(async ({ page }) => {
  await mockAuthenticatedSession(page, true)
})

test('shows the topic library and its program context', async ({ page }) => {
  await mockTopics(page, ['Career Planning', 'Finance', 'Technology'])
  await page.goto('/admin/topics')

  await expect(
    page.getByRole('heading', { name: 'Topic library' }),
  ).toBeVisible()
  await expect(page.getByLabel('3 topics')).toHaveText('3')
  await expect(
    page.getByRole('list', { name: 'Available topics' }).getByRole('listitem'),
  ).toHaveCount(3)
  await expect(page.getByRole('heading', { name: 'Finance' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'How topics are used' }),
  ).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }),
  ).toBeVisible()
})

test('shows an empty state when no topics are available', async ({ page }) => {
  await mockTopics(page, [])
  await page.goto('/admin/topics')

  await expect(
    page.getByRole('heading', { name: 'No topics available' }),
  ).toBeVisible()
  await expect(page.getByLabel('Add a topic')).toBeVisible()
})

test('adds a topic and updates the shared topic list', async ({ page }) => {
  let submittedBody: unknown
  await page.route('**/api/topics', async (route) => {
    if (route.request().method() === 'POST') {
      submittedBody = route.request().postDataJSON()
      await fulfillJson(route, { topic: 'Leadership' }, 201)
      return
    }

    await fulfillJson(route, {
      topics: ['Career Planning', 'Finance', 'Technology'],
    })
  })
  await page.goto('/admin/topics')

  await page.getByLabel('Add a topic').fill('Leadership')
  await page.getByRole('button', { name: 'Add topic' }).click()

  await expect(
    page.getByRole('heading', { name: 'Add this topic?' }),
  ).toBeVisible()
  expect(submittedBody).toBeUndefined()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(
    page.getByRole('heading', { name: 'Add this topic?' }),
  ).toBeHidden()
  await expect(page.getByLabel('Add a topic')).toHaveValue('Leadership')
  expect(submittedBody).toBeUndefined()

  await page.getByRole('button', { name: 'Add topic' }).click()
  await page.getByRole('button', { name: 'Confirm topic' }).click()

  expect(submittedBody).toEqual({ topic: 'Leadership' })
  await expect(page.getByLabel('4 topics')).toHaveText('4')
  await expect(page.getByRole('heading', { name: 'Leadership' })).toBeVisible()
  await expect(page.getByRole('status')).toHaveText(
    'Leadership was added to the topic library.',
  )
  await expect(page.getByLabel('Add a topic')).toHaveValue('')
})

test('allows an admin to retry after topics fail to load', async ({ page }) => {
  let requestCount = 0
  await page.route('**/api/topics', async (route) => {
    requestCount += 1
    if (requestCount === 1) {
      await fulfillJson(route, { error: 'Unavailable' }, 500)
      return
    }
    await fulfillJson(route, { topics: ['Leadership'] })
  })
  await page.goto('/admin/topics')

  await expect(
    page.getByRole('heading', { name: 'Topics could not be loaded' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('heading', { name: 'Leadership' })).toBeVisible()
})
