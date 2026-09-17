import { afterEach, describe, expect, it } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

let client: Client | undefined
let transport: StdioClientTransport | undefined

afterEach(async () => {
  await client?.close()
  await transport?.close()
})

describe('MCP stdio', () => {
  it('lists the typed NX surface and keeps mock results explicit', async () => {
    transport = new StdioClientTransport({
      command: process.execPath,
      args: ['--import', 'tsx', 'src/server.ts'],
      env: { ...process.env, DSH_NX_MODE: 'mock' } as Record<string, string>,
      cwd: process.cwd(),
    })
    client = new Client({ name: 'dsh-nx-test', version: '0.1.0' })
    await client.connect(transport)
    const listed = await client.listTools()
    expect(listed.tools.map(tool => tool.name)).toContain('nx_create_part')
    expect(listed.tools.map(tool => tool.name)).toContain('nx_verify_result')
    const health = await client.callTool({ name: 'nx_health', arguments: {} })
    expect(JSON.stringify(health)).toContain('2512-MOCK')
    expect(JSON.stringify(health)).toContain('mock')
  })
})
