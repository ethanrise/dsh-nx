#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { createBridge } from './bridge.js'
import { requirePrtPath, safeWorkspacePath } from './policy.js'

const bridge = createBridge()
const server = new McpServer({ name: 'dsh-nx', version: '0.1.0' })
const output = (value: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }], structuredContent: value as Record<string, unknown> })
const invoke = async (method: string, params: Record<string, unknown> = {}) => output(await bridge.call(method, params))

server.registerTool('nx_health', { description: 'Check the configured Siemens NX bridge without modifying NX.' }, async () => invoke('health'))
server.registerTool('nx_get_capabilities', { description: 'List the NX adapter and its explicitly supported operations.' }, async () => invoke('capabilities'))
server.registerTool('nx_get_session_state', { description: 'Read current work-part, feature-count and modified state without changing NX.' }, async () => invoke('session_state'))

server.registerTool('nx_preflight', {
  description: 'Validate one exact planned operation against current NX state immediately before mutation.',
  inputSchema: {
    operation: z.enum(['create_expression', 'create_rectangle_sketch', 'create_circle_sketch', 'extrude', 'create_simple_hole', 'rectangular_pattern', 'fillet', 'chamfer']),
    expectedFeatureDelta: z.number().int().min(0).max(100).default(1),
  },
}, async args => invoke('preflight', args))

server.registerTool('nx_verify_result', {
  description: 'Verify observed feature/body state after a mutation; mock mode never claims exact geometry.',
  inputSchema: { preflightId: z.string().uuid(), expectedFeatureCount: z.number().int().min(0), expectedBodyCount: z.number().int().min(0).max(100) },
}, async args => invoke('verify', args))

server.registerTool('nx_create_part', {
  description: 'Create a new millimeter NX part below DSH_NX_WORKSPACE. Does not overwrite an existing file.',
  inputSchema: { path: z.string().describe('Workspace-relative .prt path') },
}, async ({ path }) => invoke('create_part', { path: requirePrtPath(path), units: 'mm', overwrite: false }))

server.registerTool('nx_create_expression', {
  description: 'Create a named NX expression in the current work part.',
  inputSchema: { name: z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/), value: z.number().finite(), unit: z.literal('mm').default('mm') },
}, async args => invoke('create_expression', args))

server.registerTool('nx_create_rectangle_sketch', {
  description: 'Create a constrained, named rectangle sketch on a principal datum plane.',
  inputSchema: { name: z.string(), plane: z.enum(['XY', 'YZ', 'XZ']), width: z.number().positive(), height: z.number().positive(), centered: z.boolean().default(true) },
}, async args => invoke('create_rectangle_sketch', args))

server.registerTool('nx_create_circle_sketch', {
  description: 'Create a constrained, named circle sketch on a principal datum plane.',
  inputSchema: { name: z.string(), plane: z.enum(['XY', 'YZ', 'XZ']), diameter: z.number().positive(), centerX: z.number().default(0), centerY: z.number().default(0) },
}, async args => invoke('create_circle_sketch', args))

server.registerTool('nx_extrude', {
  description: 'Create a native NX extrusion from an existing sketch.',
  inputSchema: { name: z.string(), sketchId: z.string(), distance: z.number().positive(), operation: z.enum(['new_body', 'unite', 'subtract']).default('new_body') },
}, async args => invoke('extrude', args))

server.registerTool('nx_create_simple_hole', {
  description: 'Create a native simple through or blind hole in the unique current solid.',
  inputSchema: { name: z.string(), diameter: z.number().positive(), x: z.number(), y: z.number(), depth: z.number().positive().optional(), through: z.boolean().default(true) },
}, async args => invoke('create_simple_hole', args))

server.registerTool('nx_rectangular_pattern', {
  description: 'Create a rectangular native feature pattern from an exact feature id.',
  inputSchema: { name: z.string(), featureId: z.string(), countX: z.number().int().min(1).max(100), pitchX: z.number().positive(), countY: z.number().int().min(1).max(100), pitchY: z.number().positive() },
}, async args => invoke('rectangular_pattern', args))

server.registerTool('nx_fillet', {
  description: 'Apply a constant-radius fillet using bridge-validated edge selectors.',
  inputSchema: { name: z.string(), radius: z.number().positive(), selector: z.enum(['all_vertical', 'all_outer']).default('all_vertical') },
}, async args => invoke('fillet', args))

server.registerTool('nx_chamfer', {
  description: 'Apply an equal-distance chamfer using bridge-validated edge selectors.',
  inputSchema: { name: z.string(), distance: z.number().positive(), selector: z.enum(['all_vertical', 'all_outer']).default('all_outer') },
}, async args => invoke('chamfer', args))

server.registerTool('nx_list_features', { description: 'Read the current work part feature tree.' }, async () => invoke('list_features'))
server.registerTool('nx_measure_body', { description: 'Read body count, bounding box, area, volume and centroid.' }, async () => invoke('measure_body'))

server.registerTool('nx_save_part_as', {
  description: 'Save the current part to a new workspace-relative .prt path. Never overwrites.',
  inputSchema: { path: z.string() },
}, async ({ path }) => invoke('save_part_as', { path: requirePrtPath(path), overwrite: false }))

server.registerTool('nx_export_step', {
  description: 'Export the current work part as STEP AP242 below DSH_NX_WORKSPACE. Never overwrites.',
  inputSchema: { path: z.string().refine(value => /\.(step|stp)$/i.test(value), 'Expected .step or .stp') },
}, async ({ path }) => invoke('export_step', { path: safeWorkspacePath(path), schema: 'AP242', overwrite: false }))

server.registerTool('nx_undo', {
  description: 'Undo the most recent dsh-nx transaction after inspecting current state.',
  inputSchema: { transactionId: z.string().uuid().optional() },
}, async args => invoke('undo', args))

await server.connect(new StdioServerTransport())
