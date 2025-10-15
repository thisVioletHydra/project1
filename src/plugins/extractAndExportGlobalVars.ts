import type { Declaration, PluginCreator, Root, Rule } from 'postcss'
import { setVar, syncVarsToActual } from '../binaryBrain'

const extractAndExportGlobalVars: PluginCreator<undefined> = () => ({
  postcssPlugin: 'extractAndExportGlobalVars',
  async Once(root: Root) {
    const liveVars = new Set<string>()
    const promises: Promise<void>[] = []
    root.walkRules((rule) => {
      if (!rule.selectors?.some(sel =>
        sel.trim() === ':root'
        || sel.trim() === 'html'
        || sel.trim().startsWith('[data-theme='),
      )) {
        return
      }
      rule.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          liveVars.add(decl.prop)
          promises.push(setVar(decl.prop, { value: decl.value, origin: 'extract', isToken: true }))
        }
      })
    })
    await Promise.all(promises)
    // ВАЖНО: вызвать sync после экспорта!
    await syncVarsToActual(liveVars)
  },
})

extractAndExportGlobalVars.postcss = true
export default extractAndExportGlobalVars
