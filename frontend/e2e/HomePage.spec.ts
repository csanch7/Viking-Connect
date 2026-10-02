import { expect, test } from '@playwright/test'
import { mockSession } from './support/mockApi'

test('shows the public home page and opens registration', async ({
  page,
  isMobile,
}) => {
  await mockSession(page)
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: 'Viking Connect',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }),
  ).toBeVisible()
  await expect(
    page.getByText(
      'Viking Connect is the St. Laurence networking and mentoring community, bringing together graduating students, alumni, and friends of the school to build relationships, share career guidance, and create opportunities for fellow Vikings.',
    ),
  ).toBeVisible()

  for (const alumnus of [
    'Aoibhe Landers ’25',
    'Anthony Rios ’16',
    'Mike Stankus ’76',
  ]) {
    await expect(page.getByText(alumnus)).toBeVisible()
  }

  for (const quote of [
    '“I’m interested in a career in wealth management and have already made three solid industry connections.”',
    '“The STL network has provided me with endless amounts of advice and opportunities, helping me land a position in a growing technology segment.”',
    '“Viking Connect has enabled me to connect and network with distinguished alumni whom I had known of, but never had the opportunity to meet personally.”',
  ]) {
    await expect(page.getByText(quote)).toBeVisible()
  }

  await expect(
    page.getByRole('heading', {
      name: 'Introductions to industry leaders and hiring managers',
    }),
  ).toBeVisible()
  await expect(
    page.getByText(
      'Mentors help with LinkedIn presence, how to get a job, interview prep, and how to advance your career.',
    ),
  ).toBeVisible()
  await expect(page.getByText('Built for action')).toHaveCount(0)

  if (!isMobile) {
    const steps = await page
      .getByRole('region', { name: 'How the program works' })
      .boundingBox()
    const viewport = page.viewportSize()

    expect(steps).not.toBeNull()
    expect(viewport).not.toBeNull()
    expect(steps!.y + steps!.height).toBeLessThanOrEqual(viewport!.height)
  }

  await page.getByRole('link', { name: 'Join the network' }).click()

  await expect(page).toHaveURL('/register')
  await expect(
    page.getByRole('heading', { name: 'Create your member profile' }),
  ).toBeVisible()
})

test('shows member navigation for an authenticated visitor', async ({
  page,
}) => {
  await mockSession(page, {
    authenticated: true,
    admin: false,
    mentee: false,
  })
  await page.goto('/')

  await expect(
    page.getByRole('link', { name: 'Directory', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Profile', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Join the network' }),
  ).toBeHidden()
})
