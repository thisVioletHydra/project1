import autoprefixer from 'autoprefixer'
import postcss from 'postcss'
import postcssColorRgbaFallback from 'postcss-color-rgba-fallback'
import postcssCustomProperties from 'postcss-custom-properties'
import postcssImport from 'postcss-import'
import postcssNesting from 'postcss-nesting'
import postcssPresetEnv from 'postcss-preset-env'
import postcssPxToRem from 'postcss-pxtorem'

export const postcssProcessor = postcss([
  postcssImport(),
  postcssPresetEnv({
    stage: 3,
    browsers: 'ie 11',
    features: {
      'custom-properties': {
        preserve: true,
      },
      'nesting-rules': true,
    },
  }),
  postcssCustomProperties({ preserve: true }), // если нужен явный контроль переменных
  postcssColorRgbaFallback(),
  postcssNesting(),
  autoprefixer(),
  postcssPxToRem({ rootValue: 16, propList: ['*'] }),
])
