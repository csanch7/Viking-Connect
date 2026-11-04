type CsvValue = string | number | boolean | null | undefined

function encodeCell(value: CsvValue): string {
  let text = String(value ?? '')

  // Quoting CSV alone does not stop spreadsheet apps interpreting formulas.
  // eslint-disable-next-line no-control-regex -- Detect control-prefixed spreadsheet formulas.
  if (/^[\s\u0000-\u001f]*[=+\-@＝＋－＠]|^[\t\r\n]/u.test(text)) {
    text = `'${text}`
  }

  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function jsonToCsv(items: Record<string, CsvValue>[]): string {
  if (items.length === 0) return ''

  const headers = Object.keys(items[0])
  return [
    headers.map(encodeCell).join(','),
    ...items.map((row) =>
      headers.map((header) => encodeCell(row[header])).join(','),
    ),
  ].join('\n')
}

export function downloadCSV(csvContent: string, fileName = 'mentees.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.hidden = true

  document.body.appendChild(link)
  link.click()
  link.remove()
  // Allow the browser to start the download before releasing the URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
