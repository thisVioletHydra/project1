import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import autoprefixer from 'autoprefixer'
import postcss from 'postcss'
import postcssNesting from 'postcss-nesting'
import logger from '../utils/logger'
import { postcssProcessor } from '../utils/postcssProcessor'
import { createSpinner } from '../utils/spinner'

interface Opts {
  stylesRoot?: string
  outDir?: string
  useHash?: boolean // если true — добавляет .{hash4} перед расширением
}

async function walkFiles(dir: string, exts = ['.css', '.pcss']) {
  const res: string[] = []
  const stack = [dir]
  while (stack.length) {
    const cur = stack.pop() as string
    const entries = await fs.readdir(cur, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(cur, e.name)
      if (e.isDirectory())
        stack.push(full)
      else if (e.isFile() && exts.includes(path.extname(e.name)))
        res.push(full)
    }
  }
  // deterministic order
  return res.sort()
}

/**
 * Собирает стили по топ‑уровневым папкам внутри stylesRoot.
 * Для каждой топ‑папки (layer) создаёт файл view/<layer>.css
 * Если useHash === true — добавляет .{hash4} перед .css
 */
export async function buildStyles(opts: Opts = {}) {
  const stylesRoot = opts.stylesRoot ?? path.resolve(process.cwd(), 'styles')
  const outDir = opts.outDir ?? path.resolve(process.cwd(), 'view')
  const useHash = !!opts.useHash

  // ensure outDir
  await fs.mkdir(outDir, { recursive: true })

  const topEntries = await fs.readdir(stylesRoot, { withFileTypes: true }).catch(() => [])
  const layers = topEntries.filter(e => e.isDirectory()).map(d => d.name)

  const results: Record<string, string> = {}

  for (const layer of layers) {
    const layerDir = path.join(stylesRoot, layer)
    const files = await walkFiles(layerDir)
    if (files.length === 0)
      continue

    // read and concatenate in deterministic order
    const parts = await Promise.all(files.map(f => fs.readFile(f, 'utf8')))
    const inputCss = parts.join('\n\n/* --- file boundary --- */\n\n')

    const processed = await postcss([postcssNesting(), autoprefixer()]).process(inputCss, { from: undefined })
    let outName = `${layer}.css`
    if (useHash) {
      const hash = crypto.createHash('md5').update(processed.css).digest('hex').slice(0, 4)
      outName = `${layer}.${hash}.css`
    }
    const outPath = path.join(outDir, outName)
    await fs.writeFile(outPath, processed.css, 'utf8')
    results[layer] = outPath
  }

  return results
}

// небольшая CLI-оболочка, ESM‑совместимая (import.meta.url)
const _isCliRun = (() => {
  try {
    const entry = process.argv[1]
    if (!entry)
      return false
    return import.meta.url === pathToFileURL(entry).href
  }
  catch {
    return false
  }
})()

if (_isCliRun && process.argv[1]?.endsWith('cssProcessor.ts')) {
  const useHash = process.env.STYLES_HASH === '1'
  buildStyles({ useHash }).then((r) => {
    logger.info({ written: r }, 'Written styles')
  }).catch((err) => {
    logger.error({ err }, 'Error building styles')
    process.exit(1)
  })
}

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
