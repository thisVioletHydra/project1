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
import checkVarsAgainstGlobals from '../plugins/checkVarsAgainstGlobals'
import cleanGlobalVars from '../plugins/cleanGlobalVars'
import dedupeButKeepFallbacks from '../plugins/dedupeButKeepFallbacks'
import extractAndExportGlobalVars from '../plugins/extractAndExportGlobalVars'
import removeComments from '../plugins/removeComments'
import transparentToRgba from '../plugins/transparentToRgba'

export const postcssProcessor = postcss([
  postcssImport(),
  removeComments(),
  extractAndExportGlobalVars({ outFile: 'view/variables.css' }),

  postcssPresetEnv({
    stage: 3,
    browsers: 'ie 11',
    features: {
      'custom-properties': { preserve: true },
      'nesting-rules': true,
    },
  }),
  postcssNesting(),

  addVarFallbacks(),
  transparentToRgba(),
  postcssCustomProperties({ preserve: true }),

  postcssColorRgbaFallback(),
  colorConverter({ outputColorFormat: 'rgb', alwaysAlpha: true }),
  autoprefixer(),

  postcssPxToRem({ rootValue: 16, propList: ['*', '!font-size'] }),

  cleanGlobalVars(),
  dedupeButKeepFallbacks(), // last for clean output
  checkVarsAgainstGlobals(), // validation after all
])
