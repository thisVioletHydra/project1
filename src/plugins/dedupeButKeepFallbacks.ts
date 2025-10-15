import type { PluginCreator, Rule } from 'postcss'

const dedupeButKeepFallbacks: PluginCreator<undefined> = () => ({
  postcssPlugin: 'dedupe-but-keep-fallbacks',
  Rule(rule: Rule) {
    const seen = new Map<string, number>()

    rule.nodes.forEach((decl, i) => {
      if (decl.type === 'decl') {
        const lastIdx = seen.get(decl.prop)

        // Не удаляем первый IE‑fallback, если текущая строка содержит var()
        if (
          typeof lastIdx === 'number'
          && !/\bvar\(/i.test(rule.nodes[lastIdx]?.toString())
          && !/\bvar\(/i.test(decl.value)
        ) {
          decl.remove()
          return
        }

        seen.set(decl.prop, i)
      }
    })
  },
})

dedupeButKeepFallbacks.postcss = true
export default dedupeButKeepFallbacks
