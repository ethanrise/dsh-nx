import { describe, expect, it } from 'vitest'
import { HttpBridge, MockBridge, UnavailableBridge } from '../src/bridge.js'

describe('bridges', () => {
  it('reports unavailable without pretending NX is connected', async () => {
    await expect(new UnavailableBridge().call('health')).resolves.toMatchObject({ connected: false })
    await expect(new UnavailableBridge().call('create_part')).rejects.toThrow(/unavailable/)
  })

  it('marks every mock mutation as mock', async () => {
    const bridge = new MockBridge()
    await bridge.call('create_part', { path: 'demo.prt' })
    await expect(bridge.call('extrude', { name: '02_BASE_EXTRUDE' })).resolves.toMatchObject({ mock: true })
    await expect(bridge.call('list_features')).resolves.toMatchObject({ mock: true })
  })

  it('rejects non-loopback bridge endpoints', () => {
    expect(() => new HttpBridge(new URL('http://example.com'), 'token')).toThrow(/loopback/)
  })
})
