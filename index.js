const https = require('https')
const fetch = require('node-fetch')

const agent = new https.Agent({
  rejectUnauthorized: false
})

class HttpResponseError extends Error {
  constructor (status) {
    super(`unexpected response status ${status} received`)
    this.status = status
  }
}

class EdgeSwitch {
  constructor (host, username, password) {
    this._host = host
    this._username = username
    this._password = password
    this._loginFuture = null
  }

  async login (signal = null) {
    const body = JSON.stringify({
      username: this._username,
      password: this._password
    })

    const response = await fetch(this._url('/api/v1.0/user/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: this._url('/')
      },
      body,
      agent,
      signal
    })

    if (!response.ok) throw new HttpResponseError(response.status)
    return response.headers.get('x-auth-token')
  }

  async macTable (signal = null) {
    const token = await this._loginOnce(signal)
    const response = await fetch(this._url('/api/v1.0/tools/mac-table'), {
      headers: {
        'x-auth-token': token
      },
      agent,
      signal
    })

    if (!response.ok) throw new HttpResponseError(response.status)
    return await response.json()
  }

  _loginOnce (signal) {
    if (!this._loginFuture) this._loginFuture = this.login(signal)
    return this._loginFuture
  }

  _url (path) {
    return new URL(path, 'https://' + this._host)
  }
}

exports.FetchError = fetch.FetchError
exports.AbortError = fetch.AbortError
exports.HttpResponseError = HttpResponseError
exports.EdgeSwitch = EdgeSwitch
