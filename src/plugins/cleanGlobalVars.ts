import type { Declaration, PluginCreator, Root, Rule } from 'postcss'

const GLOBAL_SELECTOR = /^:root$|^\[data-theme=.*\]$|^html$/i

const cleanGlobalVars: PluginCreator<undefined> = () => ({
  postcssPlugin: 'clean-global-vars',
  Once(root: Root) {
    root.walkRules((rule: Rule) => {
      if (!GLOBAL_SELECTOR.test(rule.selector))
        return
      rule.walkDecls((decl: Declaration) => {
        if (decl.prop.startsWith('--'))
          decl.remove()
      })
      if (!rule.nodes?.length)
        rule.remove()
    })
  },
})

cleanGlobalVars.postcss = true
export default cleanGlobalVars
