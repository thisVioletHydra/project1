import type { Declaration, PluginCreator, Root } from 'postcss'
import { getAllVars } from '../binaryBrain'

const checkVarsAgainstGlobals: PluginCreator<undefined> = () => ({
  postcssPlugin: 'checkVarsAgainstGlobals',
  async Once(root: Root) {
    const allVars = await getAllVars()
    root.walkDecls((decl: Declaration) => {
      const regex = /var\(\s*(--[\w-]+)\s*(?:,[^)]+)?\)/g
      let match
      while ((match = regex.exec(decl.value))) {
        const varName = match[1]
        if (!(varName in allVars)) {
          // Проверяем, не дублируем ли комментарий
          if (
            !decl.next()
            || decl.next().type !== 'comment'
            || !decl.next().text.includes(`! undefined: ${varName}`)
          ) {
            decl.after({ type: 'comment', text: `! undefined: ${varName}` })
          }
        }
      }
    })
  },
})
checkVarsAgainstGlobals.postcss = true
export default checkVarsAgainstGlobals
