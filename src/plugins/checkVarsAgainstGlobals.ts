import type { Declaration, PluginCreator, Root } from 'postcss'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import logger from '../utils/logger'

const VARS_PATH = path.resolve(process.cwd(), 'view/variables.css')

// Быстрый парсер variables.css
function parseCssVarsFromFile(filePath: string): Set<string> {
  const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
  return new Set(raw.match(/--[\w-]+(?=:)/g) || [])
}

const checkVarsAgainstGlobals: PluginCreator<undefined> = () => {
  const varSet = parseCssVarsFromFile(VARS_PATH)
  return {
    postcssPlugin: 'check-vars-against-globals',
    Once(root: Root) {
      root.walkDecls((decl: Declaration) => {
        const varMatches = Array.from(decl.value.matchAll(/var\((--[\w-]+)/g))
        for (const [, varName] of varMatches) {
          if (!varSet.has(varName as string)) {
            // Вставить комментарий только если parent определён
            if (decl.parent) {
              decl.parent.insertAfter(decl, {
                type: 'comment',
                text: `! undefined: ${varName} (переменная не определена в variables.css)`,
              })
            }
            // Логгируем с безопасной подстановкой файлов
            const file = decl.source?.input.file ?? '[inline-css]'
            const line = decl.source?.start?.line ?? '-'
            const col = decl.source?.start?.column ?? '-'
            logger.warn(`[TOKENS][WARN] Не найдена переменная: '${varName}' в ${file} (${line}:${col})`)
          }
        }
      })
    },
  }
}

checkVarsAgainstGlobals.postcss = true
export default checkVarsAgainstGlobals
