import { resolve, relative, isAbsolute } from 'node:path'

export function workspaceRoot(): string {
  return resolve(process.env.DSH_NX_WORKSPACE ?? resolve(process.cwd(), 'nx-workspace'))
}

export function safeWorkspacePath(input: string): string {
  if (!input.trim()) throw new Error('Path must not be empty')
  const root = workspaceRoot()
  const target = resolve(root, input)
  const rel = relative(root, target)
  if (isAbsolute(rel) || rel === '..' || rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)) {
    throw new Error(`Path is outside DSH_NX_WORKSPACE: ${input}`)
  }
  return target
}

export function requirePrtPath(input: string): string {
  const target = safeWorkspacePath(input)
  if (!target.toLowerCase().endsWith('.prt')) throw new Error('NX part path must end with .prt')
  return target
}
