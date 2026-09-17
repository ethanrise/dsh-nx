#!/usr/bin/env node
import { accessSync, constants, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { workspaceRoot } from './policy.js'

const rows: Array<[string, boolean, string]> = []
rows.push(['Node.js >= 22.19', Number(process.versions.node.split('.')[0]) >= 22, process.versions.node])
rows.push(['Windows runtime', process.platform === 'win32', process.platform === 'win32' ? 'win32' : `${process.platform} (development/mock only)`])
const nxRoot = process.env.DSH_NX_ROOT ?? process.env.UGII_BASE_DIR ?? ''
rows.push(['NX root configured', Boolean(nxRoot), nxRoot || 'Set DSH_NX_ROOT on the Windows NX machine'])
const nxBin = nxRoot ? resolve(nxRoot, 'NXBIN') : ''
rows.push(['NXBIN detected', Boolean(nxBin && existsSync(nxBin)), nxBin || 'not checked'])
const workspace = workspaceRoot()
let writable = false
try { accessSync(resolve(workspace, '..'), constants.W_OK); writable = true } catch { /* diagnostic only */ }
rows.push(['Workspace parent writable', writable, workspace])
rows.push(['Bridge configured', Boolean(process.env.DSH_NX_BRIDGE_URL && process.env.DSH_NX_BRIDGE_TOKEN), process.env.DSH_NX_BRIDGE_URL ?? 'not configured'])

for (const [name, pass, detail] of rows) console.log(`[${pass ? 'PASS' : 'WARN'}] ${name}: ${detail}`)
if (process.platform !== 'win32') console.log('\nNX 2512 runtime validation requires native Windows. Mock MCP development is supported here.')
