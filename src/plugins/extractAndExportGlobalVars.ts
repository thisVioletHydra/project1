import type { Declaration, PluginCreator, Root, Rule } from 'postcss'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const GLOBAL_SELECTOR = /^:root$|^\[data-theme=.*\]$|^html$/i

interface Options {
  outFile?: string
}

// Теперь только собираем и пишем — ничего не удаляем!
const extractAndExportGlobalVars: PluginCreator<Options> = (options = {}) => {
  const collected: Map<string, string> = new Map()

  return {
    postcssPlugin: 'extract-and-export-global-vars',
    Once(root: Root) {
      root.walkRules((rule: Rule) => {
        if (!GLOBAL_SELECTOR.test(rule.selector))
          return
        rule.walkDecls((decl: Declaration) => {
          if (decl.prop.startsWith('--'))
            collected.set(decl.prop, decl.value)
        })
      })

      if (options.outFile && collected.size) {
        const varsCss = Array.from(collected.entries())
          .map(([k, v]) => `  ${k}: ${v};`)
          .join('\n')
        const out = `:root {\n${varsCss}\n}\n`
        fs.writeFile(path.resolve(process.cwd(), options.outFile), out)
      }
      // НИЧЕГО больше не удаляем!
    },
  }
}

extractAndExportGlobalVars.postcss = true
export default extractAndExportGlobalVars
