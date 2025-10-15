import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import logger from '../utils/logger'
import { postcssProcessor } from '../utils/postcssProcessor'
import { createSpinner } from '../utils/spinner'

interface Opts {
  stylesRoot?: string
  outDir?: string
}

async function findMasterFile(dir: string): Promise<string | null> {
  // Ищет index.postcss либо main.postcss как мастер-файл слоя
  const candidates = ['index.postcss', 'main.postcss']
  for (const name of candidates) {
    const file = path.join(dir, name)
    try {
      await fs.access(file)
      return file
    }
    catch {}
  }
  return null
}

export async function buildStyles(opts: Opts = {}) {
  const stylesRoot = opts.stylesRoot ?? path.resolve(process.cwd(), 'styles')
  const outDir = opts.outDir ?? path.resolve(process.cwd(), 'view')

  await fs.mkdir(outDir, { recursive: true })
  const entries = await fs.readdir(stylesRoot, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory())
      continue
    const layer = entry.name
    const layerDir = path.join(stylesRoot, layer)
    const masterFile = await findMasterFile(layerDir)

    if (!masterFile) {
      logger.warn(`[style] no master file found for layer "${layer}", skipping`)
      continue
    }

    const spinner = createSpinner(`[style] ${layer} -> ${layer}.css`).start()
    try {
      const inputCss = await fs.readFile(masterFile, 'utf8')
      const processed = await postcssProcessor.process(inputCss, { from: masterFile })
      const outPath = path.join(outDir, `${layer}.css`)
      await fs.writeFile(outPath, processed.css, 'utf8')
      spinner.success(`view/${layer}.css готов!`)
    }
    catch (e) {
      spinner.error(`Сборка layer ${layer}: ${e}`)
    }
  }
}
