import type { Declaration, PluginCreator  } from 'postcss'

const transparentToRgba: PluginCreator<undefined> = () => {
  return {
    postcssPlugin: 'transparent-to-rgba',
    Declaration(decl: Declaration) {
      // Меняет transparent на rgba(0,0,0,0) везде, не важно где встречается
      const replaced = decl.value.replace(/\btransparent\b/gi, 'rgba(0,0,0,0)')
      if (replaced !== decl.value) {
        decl.value = replaced
      }
    },
  }
}
transparentToRgba.postcss = true

export default transparentToRgba
