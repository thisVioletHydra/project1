import path from 'node:path'
import process from 'node:process'
import { buildStyles } from './src/processors/cssProcessor';
import logger from './src/utils/logger';

const CMD = process.argv[2] ?? 'build' // поддерживаем 'build' и 'dev'
const stylesDir = path.resolve(process.cwd(), 'styles')
const useHash = process.env.STYLES_HASH === '1'

async function runBuild() {
  try {
    logger.info({ useHash }, 'Building styles → view/')
    const res = await buildStyles({ stylesRoot: stylesDir, outDir: path.resolve(process.cwd(), 'view'), useHash })
    logger.info({ written: res }, 'Build finished')
  }
  catch (e) {
    logger.error({ err: e }, 'Build failed')
    process.exitCode = 1
  }
}

async function main() {
  if (CMD === 'build') {
    await runBuild()
  }
  else if (CMD === 'dev') {
    // initial build
    await runBuild()

    // динамический import чтобы не ломать build если @parcel/watcher отсутствует
    try {
      const parcel = await import('@parcel/watcher')
      logger.info({ dir: stylesDir }, 'Watching styles directory')

      // простой debounce
      let timer: NodeJS.Timeout | null = null

      const subscription = await parcel.subscribe(
        stylesDir,
        (err: Error | null, events: { path: string }[]) => {
          if (err) {
            logger.error({ err }, 'Watcher error')
            return
          }
          if (!events || events.length === 0)
            return
          if (timer)
            clearTimeout(timer)
          timer = setTimeout(async () => {
            logger.debug({ eventsCount: events.length }, 'Changes detected, rebuilding styles')
            await runBuild()
          }, 120)
        },
      )

      const shutdown = async () => {
        try {
          await subscription.unsubscribe()
          logger.info('Watcher unsubscribed, exiting')
        }
        catch (e) {
          logger.warn({ err: e }, 'Error while unsubscribing')
        }
        finally {
          process.exit(0)
        }
      }
      process.on('SIGINT', shutdown)
      process.on('SIGTERM', shutdown)
    }
    catch (error) {
      logger.error({ err: error }, 'Failed to start watcher. Make sure @parcel/watcher is installed.')
      process.exitCode = 1
    }
  }
  else {
    logger.error(`Unknown command: ${CMD}. Supported: build, dev`)
    process.exitCode = 2
  }
}

main().catch((error) => {
  logger.error({ err: error }, 'Unexpected error')
  process.exitCode = 1
})
