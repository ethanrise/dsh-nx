import { afterEach, describe, expect, it } from 'vitest'
import { requirePrtPath, safeWorkspacePath } from '../src/policy.js'

const original = process.env.DSH_NX_WORKSPACE
afterEach(() => { if (original === undefined) delete process.env.DSH_NX_WORKSPACE; else process.env.DSH_NX_WORKSPACE = original })

describe('workspace policy', () => {
  it('accepts a relative part path under the workspace', () => {
    process.env.DSH_NX_WORKSPACE = '/tmp/dsh-nx-test'
    expect(requirePrtPath('parts/demo.prt')).toBe('/tmp/dsh-nx-test/parts/demo.prt')
  })

  it('rejects traversal', () => {
    process.env.DSH_NX_WORKSPACE = '/tmp/dsh-nx-test'
    expect(() => safeWorkspacePath('../escape.prt')).toThrow(/outside/)
  })

  it('requires native part extension', () => {
    process.env.DSH_NX_WORKSPACE = '/tmp/dsh-nx-test'
    expect(() => requirePrtPath('demo.step')).toThrow(/\.prt/)
  })
})
