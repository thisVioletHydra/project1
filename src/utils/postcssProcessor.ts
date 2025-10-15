import autoprefixer from 'autoprefixer'
import postcss from 'postcss'
import colorConverter from 'postcss-color-converter'
import postcssColorRgbaFallback from 'postcss-color-rgba-fallback'
import postcssCustomProperties from 'postcss-custom-properties'
import postcssImport from 'postcss-import'
import postcssNesting from 'postcss-nesting'
import postcssPresetEnv from 'postcss-preset-env'
import postcssPxToRem from 'postcss-pxtorem'
import addVarFallbacks from '../plugins/addVarFallbacks'
import dedupeButKeepFallbacks from '../plugins/dedupeButKeepFallbacks'
import transparentToRgba from '../plugins/transparentToRgba'

export const postcssProcessor = postcss([
  postcssImport(), // 1 — раскрытие импортов
  postcssPresetEnv({ // 2 — обработка новых фич, переменных, nesting, фоллбеки IE
    stage: 3,
    browsers: 'ie 11',
    features: {
      'custom-properties': { preserve: true },
      'nesting-rules': true,
    },
  }),
  postcssNesting(), // 3 — (на случай, если нужен дополнительный nesting)
  dedupeButKeepFallbacks(),
  transparentToRgba(), // 5 — конвертация transparent → rgba(0,0,0,0)
  addVarFallbacks(),
  postcssCustomProperties({ preserve: true }), // 4 — контроль переменных, ручные фоллбеки
  postcssColorRgbaFallback(), // 6 — rgba фоллбеки
  colorConverter({ outputColorFormat: 'rgb', alwaysAlpha: true }), // 7 — все цвета в rgb/rgba
  autoprefixer(), // 8 — автопрефиксы (после всех трансформаций)
  postcssPxToRem({ rootValue: 16, propList: ['*', '!font-size'] }), // 9 — перевод px → rem в самом конце
])
