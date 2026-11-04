import { expect, test } from '@playwright/test'
import { jsonToCsv } from '../src/utils/jsonToCsv'

test('neutralizes spreadsheet formula prefixes, including whitespace variants', () => {
  for (const prefix of ['=', '+', '-', '@', '＝', '＋', '－', '＠']) {
    for (const padding of ['', ' ', '\t', '\r', '\n', '\u0000']) {
      const value = `${padding}${prefix}1+1`
      const csv = jsonToCsv([{ name: value }])
      const escaped = `'${value}`.replace(/"/g, '""')
      expect(csv).toBe(
        `name\n${/[",\r\n]/.test(value) ? `"${escaped}"` : escaped}`,
      )
    }
  }
  expect(jsonToCsv([{ '=header': '=1+1' }])).toBe("'=header\n'=1+1")
})

test('preserves ordinary CSV values and escapes every row separator', () => {
  expect(jsonToCsv([{ name: 'Zoë O’Brien', email: 'zoe@example.com' }])).toBe(
    'name,email\nZoë O’Brien,zoe@example.com',
  )
  expect(jsonToCsv([{ name: 'Doe, "Jane"\rSmith\nJr.' }])).toBe(
    'name\n"Doe, ""Jane""\rSmith\nJr."',
  )
  expect(jsonToCsv([{ name: null, email: undefined }])).toBe('name,email\n,')
  expect(jsonToCsv([])).toBe('')
})
