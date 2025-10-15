import type { Declaration, PluginCreator, Root } from 'postcss'
import { getAllVars, getVar, setVar } from '../binaryBrain'

// Глобальная регулярка для поиска var(...)
const VAR_REGEX = /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g

const addVarFallbacks: PluginCreator<undefined> = () => ({
  postcssPlugin: 'addVarFallbacks',
  async Once(root: Root) {
    const allVars = await getAllVars()
    const promises: Promise<void>[] = []

    root.walkDecls((decl: Declaration) => {
      const origValue = decl.value
      let resultValue = origValue
      let changed = false
      let m: RegExpExecArray | null

      // Используем .replace с callback для каждого var(...)
      resultValue = resultValue.replace(VAR_REGEX, (match, varName, fallback) => {
        const meta = allVars[varName]
        if (meta?.value && !fallback) {
          changed = true
          return `var(${varName}, ${meta.value})`
        }
        return match
      })

      if (changed) {
        decl.value = resultValue
      }
    })
    await Promise.all(promises)
  },
})
addVarFallbacks.postcss = true
export default addVarFallbacks
