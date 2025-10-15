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

// === BEFORE (импорт, очистка, экспорт токенов в память) ===
const beforePlugins = [
  postcssImport(), // импорт файлов, нужен первым всегда!
  removeComments(), // убрать мусорные комментарии на старте
  extractAndExportGlobalVars(), // экспорт var(--token-*) в binaryBrain для всего pipeline
]

// === MAIN (feature-плагины, преобразования, генерация фолбеков) ===
const mainPlugins = [
  postcssPresetEnv({
    stage: 3,
    browsers: 'ie 11',
    features: {
      'custom-properties': { preserve: true },
      'nesting-rules': true,
    },
  }),
  postcssNesting(), // поддержка вложенности в любом виде

  addVarFallbacks(), // поиск var(...) без fallback и подстановка значений из binaryBrain
  transparentToRgba(), // конвертация transparent → rgba
  postcssCustomProperties({ preserve: true }), // финальное преобразование кастомных пропов (см. порядок — после varFallbacks)

  postcssColorRgbaFallback(), // генерация явных rgba фолбеков для IE11
  colorConverter({ outputColorFormat: 'rgb', alwaysAlpha: true }), // единый rgb-формат
  autoprefixer(), // автопрефиксы, влияет на совместимость + корректный порядок
  postcssPxToRem({ rootValue: 16, propList: ['*', '!font-size'] }), // rem-конвертер
]

// === AFTER (финальный рефайн, удаление неиспользуемого, dedupe, валидатор) ===
const afterPlugins = [
  cleanGlobalVars(), // чистка var, которые не нужны в финальном аутпуте
  dedupeButKeepFallbacks(), // последнее удаление дублей, но с сохранением IE/legacy fallback'ов
  checkVarsAgainstGlobals(), // финальный валидатор: undefined-переменные и добавление comment
]

// === Финальный pipeline для экспорта ===
export const postcssProcessor = postcss([
  ...beforePlugins,
  ...mainPlugins,
  ...afterPlugins,
])
