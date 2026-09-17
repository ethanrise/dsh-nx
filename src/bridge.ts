import { randomUUID } from 'node:crypto'
import type { BridgeResponse, JsonObject, NxBridge } from './types.js'

export class UnavailableBridge implements NxBridge {
  async call(method: string): Promise<JsonObject> {
    if (method === 'health') return { connected: false, mode: 'unavailable', reason: 'NX bridge is not configured' }
    throw new Error('NX bridge is unavailable. Configure DSH_NX_BRIDGE_URL or use DSH_NX_MODE=mock for tests.')
  }
}

export class HttpBridge implements NxBridge {
  constructor(private readonly endpoint: URL, private readonly token: string) {
    if (!['127.0.0.1', 'localhost', '::1'].includes(endpoint.hostname)) {
      throw new Error('DSH NX 0.1 only permits a loopback bridge endpoint')
    }
  }

  async call(method: string, params: JsonObject = {}): Promise<JsonObject> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), Number(process.env.DSH_NX_TIMEOUT_MS ?? 30_000))
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${this.token}` },
        body: JSON.stringify({ id: randomUUID(), method, params }),
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`NX bridge HTTP ${response.status}`)
      const body = await response.json() as BridgeResponse
      if (!body.ok) throw new Error(`${body.error?.code ?? 'NX_ERROR'}: ${body.error?.message ?? 'Unknown NX error'}`)
      return body.result ?? {}
    } finally {
      clearTimeout(timeout)
    }
  }
}

interface MockState { part?: string; features: Array<{ id: string; type: string; name: string }>; undo: string[] }

export class MockBridge implements NxBridge {
  private readonly state: MockState = { features: [], undo: [] }

  async call(method: string, params: JsonObject = {}): Promise<JsonObject> {
    if (method === 'health') return { connected: true, mode: 'mock', nxVersion: '2512-MOCK', warning: 'No real NX operation occurred' }
    if (method === 'capabilities') return { adapter: 'mock-2512', verified: false, operations: SUPPORTED_METHODS }
    if (method === 'create_part') { this.state.part = String(params.path); return { part: this.state.part, units: 'mm', mock: true } }
    if (method === 'list_features') return { features: this.state.features, mock: true }
    if (method === 'measure_body') return { bodyCount: this.state.features.length ? 1 : 0, mock: true, exact: false }
    if (method === 'save_part_as' || method === 'export_step') return { path: String(params.path), mock: true, written: false }
    if (method === 'undo') { const transactionId = this.state.undo.pop(); this.state.features.pop(); return { transactionId, undone: Boolean(transactionId), mock: true } }
    const id = `mock-${this.state.features.length + 1}`
    const transactionId = randomUUID()
    this.state.features.push({ id, type: method, name: String(params.name ?? method) })
    this.state.undo.push(transactionId)
    return { featureId: id, transactionId, mock: true }
  }
}

export const SUPPORTED_METHODS = [
  'create_part', 'create_expression', 'create_rectangle_sketch', 'create_circle_sketch',
  'extrude', 'create_simple_hole', 'rectangular_pattern', 'fillet', 'chamfer',
  'list_features', 'measure_body', 'save_part_as', 'export_step', 'undo',
]

export function createBridge(): NxBridge {
  if (process.env.DSH_NX_MODE === 'mock') return new MockBridge()
  const raw = process.env.DSH_NX_BRIDGE_URL
  const token = process.env.DSH_NX_BRIDGE_TOKEN
  if (raw && token) return new HttpBridge(new URL(raw), token)
  return new UnavailableBridge()
}
