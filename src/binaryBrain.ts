import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pack, unpack } from 'msgpackr'

const STATEPATH = path.resolve(process.cwd(), '.binstyles')

export interface VarMeta {
  value: string
  resolvedValue?: string // итоговое раскрытое значение
  resolutionError?: string // ошибка раскрытия (если есть)
  origin?: string
  isToken?: boolean
  fallbacks?: string
  usedIn?: string[]
  lastSeen?: number
  deleted?: boolean
  type?: 'palette' | 'token' | 'theme' | 'local'
}
type VariableMap = Record<string, VarMeta>
let inMemory: VariableMap | null = null

async function ensureLoaded(): Promise<VariableMap> {
  if (inMemory)
    return inMemory
  try {
    const buf = await fs.readFile(STATEPATH)
    inMemory = unpack(buf) as VariableMap
  }
  catch {
    inMemory = {}
  }
  return inMemory
}

export async function getVar(name: string): Promise<VarMeta | undefined> {
  return (await ensureLoaded())[name]
}

export async function setVar(name: string, meta: VarMeta) {
  const map = await ensureLoaded()
  map[name] = { ...meta, lastSeen: Date.now() }
}

export async function getAllVars(): Promise<VariableMap> {
  return await ensureLoaded()
}

export async function flushVars() {
  if (!inMemory)
    return
  await fs.writeFile(STATEPATH, pack(inMemory))
}

export async function logVarsStats() {
  const map = await ensureLoaded()
  const all = Object.keys(map).length
  const tokens = Object.values(map).filter(v => v.isToken).length
  const withFallbacks = Object.values(map).filter(v => v.fallbacks).length
  const deleted = Object.values(map).filter(v => v.deleted).length
  const orphan = Object.values(map).filter(v => !v.value).length
  console.log('[binaryBrain stats]')
  console.log('Total:', all)
  console.log('Tokens:', tokens)
  console.log('With fallbacks:', withFallbacks)
  console.log('Deleted:', deleted)
  console.log('Orphan:', orphan)
}
// binaryBrain.ts
export async function syncVarsToActual(actualKeys: Set<string>) {
  const map = await ensureLoaded()
  let changed = false
  for (const key of Object.keys(map)) {
    if (!actualKeys.has(key)) {
      delete map[key]
      changed = true
    }
  }
  if (changed)
    await flushVars()
}
// Рекурсивный резолвер (используется ниже)
export async function resolveVarRecursively(
  name: string,
  allVars: VariableMap,
  stack: string[] = [],
): Promise<{ resolved: string | undefined, error?: string }> {
  if (stack.includes(name))
    return { resolved: undefined, error: 'Cyclic variable reference' }
  const meta = allVars[name]
  if (!meta)
    return { resolved: undefined, error: `Variable not found: ${name}` }
  if (!meta.value.startsWith('var('))
    return { resolved: meta.value }
  const rx = /^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/
  const match = rx.exec(meta.value)
  if (!match)
    return { resolved: meta.value }
  const [, varName, fallback] = match
  const next = allVars[varName]
  if (!next) {
    if (fallback)
      return { resolved: fallback, error: `Fallback used: ${fallback}` }
    return { resolved: undefined, error: `No value or fallback for: ${varName}` }
  }
  return resolveVarRecursively(varName, allVars, [...stack, name])
}
// Batch‑функция (запускать один раз после заполнения всех токенов):
export async function resolveAllVars() {
  const allVars = await getAllVars()
  for (const key of Object.keys(allVars)) {
    const { resolved, error } = await resolveVarRecursively(key, allVars)
    allVars[key].resolvedValue = resolved
    allVars[key].resolutionError = error
  }
  await flushVars()
}
