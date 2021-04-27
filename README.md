# edge-switch

EdgeSwitch HTTP client library targeting unofficial JSON endpoints.

    npm install @thermocline-labs/edge-switch

## Usage

The client instance exposes a promise based interface for communicating with the EdgeSwitch JSON API. All the methods also accept an optional abort signal used to abort the in-flight HTTP request.

```js
const { EdgeSwitch, FetchError, HttpResponseError, AbortError } = require('@thermocline-labs/edge-switch')

const client = EdgeSwitch('localhost', 'username', 'password')

try {
  const abortController = new AbortController()
  const macTable = await client.macTable(abortController.signal)

  console.log(macTable)
} catch (err) {
  if (err instanceof FetchError || err instanceof HttpResponseError) {
    // Handle http error
    return
  }
  if (err instanceof AbortError) {
    // Handle manual abort error
    return
  }

  throw err
}
```
