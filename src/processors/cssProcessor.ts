import fs from 'node:fs/promises'
import { postcssProcessor } from '../utils/postcssProcessor'
import { createSpinner } from '../utils/spinner'

export async function processCSS(file: string) {
  const spinner = createSpinner(`Обработка CSS: ${file}`).start()
  try {
    const css = await fs.readFile(file, 'utf8')
    const result = await postcssProcessor.process(css, { from: file, to: file })
    await fs.writeFile(file, result.css)
    if (result.warnings().length > 0)
      result.warnings().forEach(w => spinner.warning(w.toString()))
    spinner.success(`CSS обновлён: ${file}`)
  }
  catch (e) {
    spinner.error(`Ошибка обработки CSS: ${e}`)
  }
}
