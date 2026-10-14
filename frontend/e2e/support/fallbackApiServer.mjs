import { createServer } from 'node:http'

const host = '127.0.0.1'
const port = 4174

const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json')

  if (request.url === '/api/health') {
    response.statusCode = 200
    response.end(JSON.stringify({ status: 'ok' }))
    return
  }

  response.statusCode = 404
  response.end(
    JSON.stringify({ message: 'This API request was not mocked by the test.' }),
  )
})

server.listen(port, host)
