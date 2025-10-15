import type { Declaration, PluginCreator, Root } from 'postcss'

function resolveVar(
  name: string,
  vars: Record<string, string>,
  visited: Set<string> = new Set(),
): string | undefined {
  if (visited.has(name)) 
return undefined
  visited.add(name)
  const value = vars[name]
  if (!value) 
return undefined

  // Рекурсивно раскрываем var(), если есть
  const match = value.match(/^var\((--[\w-]+)(?:,([^)]+))?\)$/)
  if (match) {
    const nested = resolveVar(match[1] as string, vars, visited)
    return nested ?? (match[2]?.trim() || undefined)
  }
  return value
}

const addVarFallbacks: PluginCreator<undefined> = () => ({
  postcssPlugin: 'add-var-fallbacks',
  Once(root: Root) {
    const vars: Record<string, string> = {}
    root.walkRules(':root', (rule) => {
      rule.walkDecls((decl) => {
        vars[decl.prop] = decl.value
      })
    })
    root.walkDecls((decl: Declaration) => {
      decl.value = decl.value.replace(/var\((--[\w-]+)\)/g, (_m, varName: string) => {
        const fallback = resolveVar(varName, vars)
        return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`
      })
    })
  },
})

addVarFallbacks.postcss = true
export default addVarFallbacks
