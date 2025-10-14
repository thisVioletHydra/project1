import autoprefixer from 'autoprefixer'
import postcss from 'postcss'
import postcssNesting from 'postcss-nesting'

// Создаём postcss-процессор c inline-config (лаконично и гибко):
export const postcssProcessor = postcss([
  autoprefixer(),
  postcssNesting(),
])
