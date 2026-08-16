import { expect, test } from '@playwright/test'
import {
  fulfillJson,
  mockAllTopics,
  mockAuthenticatedSession,
} from './support/mockApi'

test.beforeEach(async ({ page }) => {
  await mockAuthenticatedSession(page, true)
})

test('shows the topic library and its program context', async ({ page }) => {
  await mockAllTopics(page)
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
  await mockAllTopics(page, [])
  await page.goto('/admin/topics')

  await expect(
    page.getByRole('heading', { name: 'No topics available' }),
  ).toBeVisible()
  await expect(page.getByLabel('Add a topic')).toBeVisible()
})

test('changes topic availability with clear pending and success feedback', async ({
  page,
}) => {
  let releaseUpdate!: () => void
  const updateReleased = new Promise<void>((resolve) => {
    releaseUpdate = resolve
  })

  await page.route('**/api/topics/**', async (route) => {
    await updateReleased
    await fulfillJson(route, { is_active: true })
  })
  await mockAllTopics(page, [{ id: '2', name: 'Finance', is_active: false }])
  await page.goto('/admin/topics')

  const topicRow = page
    .getByRole('list', { name: 'Available topics' })
    .getByRole('listitem')
  const availabilityButton = topicRow.getByRole('button', {
    name: 'Finance availability',
  })

  await expect(availabilityButton).toHaveAttribute('aria-pressed', 'false')
  await expect(availabilityButton).toHaveText('Inactive')
  await availabilityButton.click()
  await expect(topicRow).toContainText('Updating…')
  await expect(availabilityButton).toBeDisabled()

  releaseUpdate()

  await expect(availabilityButton).toHaveAttribute('aria-pressed', 'true')
  await expect(availabilityButton).toHaveText('Active')
  await expect(page.getByText(/Finance is now available in/)).toHaveText(
    'Finance is now available in registration and filters.',
  )
})

test('keeps the previous topic state when an update fails', async ({
  page,
}) => {
  await page.route('**/api/topics/**', async (route) => {
    await fulfillJson(route, { message: 'Unavailable' }, 500)
  })
  await mockAllTopics(page, [
    { id: '1', name: 'Career Planning', is_active: true },
  ])
  await page.goto('/admin/topics')

  const availabilityButton = page.getByRole('button', {
    name: 'Career Planning availability',
  })
  await availabilityButton.click()

  await expect(availabilityButton).toHaveAttribute('aria-pressed', 'true')
  await expect(availabilityButton).toHaveText('Active')
  await expect(page.getByRole('alert')).toHaveText(
    'We could not update Career Planning. Try again.',
  )
})

test('adds a topic and updates the shared topic list', async ({ page }) => {
  let submittedBody: unknown
  await page.route('**/api/topics', async (route) => {
    if (route.request().method() === 'POST') {
      submittedBody = route.request().postDataJSON()
      await fulfillJson(
        route,
        { topic: { id: '4', name: 'Leadership', is_active: true } },
        201,
      )
      return
    }

    await fulfillJson(route, {
      topics: [
        { id: '1', name: 'Career Planning', is_active: true },
        { id: '2', name: 'Finance', is_active: false },
        { id: '3', name: 'Technology', is_active: true },
      ],
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
    await fulfillJson(route, {
      topics: [{ id: '4', name: 'Leadership', is_active: true }],
    })
  })
  await page.goto('/admin/topics')

  await expect(
    page.getByRole('heading', { name: 'Topics could not be loaded' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('heading', { name: 'Leadership' })).toBeVisible()
})
