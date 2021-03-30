const test = require('tape')
const nock = require('nock')
const { EdgeSwitch, HttpResponseError } = require('.')

test('login', async t => {
  const scope = nock('https://localhost')
    .matchHeader('Content-Type', 'application/json')
    .matchHeader('Referer', 'https://localhost/')
    .post('/api/v1.0/user/login', { username: 'test-username', password: 'test-password' })
    .reply(200, {}, { 'x-auth-token': 'test-token' })

  const client = new EdgeSwitch('localhost', 'test-username', 'test-password')
  const token = await client.login()

  t.ok(scope.isDone())
  t.equal(token, 'test-token')
})

test('login error', async t => {
  const scope = nock('https://localhost')
    .matchHeader('Content-Type', 'application/json')
    .matchHeader('Referer', 'https://localhost/')
    .post('/api/v1.0/user/login', { username: 'test-username', password: 'test-password' })
    .reply(400)

  const client = new EdgeSwitch('localhost', 'test-username', 'test-password')

  try {
    await client.login()
  } catch (err) {
    t.ok(scope.isDone())
    t.ok(err instanceof HttpResponseError)
    t.equal(err.message, 'unexpected response status 400 received')
    t.equal(err.status, 400)
    return
  }

  t.fail('expected error')
})

test('get mac table', async t => {
  const loginScope = nock('https://localhost')
    .matchHeader('Content-Type', 'application/json')
    .matchHeader('Referer', 'https://localhost/')
    .post('/api/v1.0/user/login', { username: 'test-username', password: 'test-password' })
    .reply(200, {}, { 'x-auth-token': 'test-token' })

  const macTableScope = nock('https://localhost')
    .get('/api/v1.0/tools/mac-table')
    .matchHeader('x-auth-token', 'test-token')
    .reply(200, [
      {
        port: {
          id: '0/1',
          position: '0/1',
          mac: 'test-port-mac-1'
        },
        mac: 'test-mac-1',
        address: 'test-address-1',
        hostname: 'test-hostname-1'
      }, {
        port: {
          id: '0/2',
          position: '0/2',
          mac: 'test-port-mac-2'
        },
        mac: 'test-mac-2',
        address: 'test-address-2',
        hostname: 'test-hostname-2'
      }
    ])

  const client = new EdgeSwitch('localhost', 'test-username', 'test-password')
  const macTable = await client.macTable()

  t.ok(loginScope.isDone())
  t.ok(macTableScope.isDone())
  t.deepEqual(macTable, [
    {
      port: {
        id: '0/1',
        position: '0/1',
        mac: 'test-port-mac-1'
      },
      mac: 'test-mac-1',
      address: 'test-address-1',
      hostname: 'test-hostname-1'
    }, {
      port: {
        id: '0/2',
        position: '0/2',
        mac: 'test-port-mac-2'
      },
      mac: 'test-mac-2',
      address: 'test-address-2',
      hostname: 'test-hostname-2'
    }
  ])
})
