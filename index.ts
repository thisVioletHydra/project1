import path from 'node:path'
import process from 'node:process'
import { buildStyles } from './src/processors/cssProcessor'
import { buildSpinner } from './src/utils/buildSpinner'
import logger from './src/utils/logger'

const CMD = process.argv[2] ?? 'build'
const stylesDir = path.resolve(process.cwd(), 'styles')
const useHash = process.env.STYLES_HASH === '1'

async function runBuild() {
  buildSpinner.build('start')
  try {
    logger.info({ useHash }, 'Building styles → view/')
    const res = await buildStyles({
      stylesRoot: stylesDir,
      outDir: path.resolve(process.cwd(), 'view'),
      useHash,
    })
    buildSpinner.build('success')
    logger.info({ written: res }, 'Build finished')
  }
  catch (e) {
    buildSpinner.build('error')
    logger.error({ err: e }, 'Build failed')
    buildSpinner.script('error')
    process.exitCode = 1
  }
}

async function main() {
  if (CMD === 'build') {
    buildSpinner.script('start')
    await runBuild()
    buildSpinner.script('success')
  }
  else if (CMD === 'dev') {
    buildSpinner.script('start')
    buildSpinner.script('success') // закрываем сразу!
    buildSpinner.devWatcherCycle('start')
    await runBuild()
    try {
      const parcel = await import('@parcel/watcher')
      logger.info({ dir: stylesDir }, 'Watching styles directory')
      let timer: NodeJS.Timeout | null = null

      const subscription = await parcel.subscribe(
        stylesDir,
        (err: Error | null, events: { path: string }[]) => {
          if (err) {
            buildSpinner.devWatcherCycle('error')
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

      buildSpinner.devWatcherCycle('stop')

      const shutdown = async () => {
        try {
          await subscription.unsubscribe()
          logger.info('Watcher unsubscribed, exiting')
        }
        catch (e) {
          logger.warn({ err: e }, 'Error while unsubscribing')
        }
        finally {
          buildSpinner.script('success')
          process.exit(0)
        }
      }

      process.on('SIGINT', shutdown)
      process.on('SIGTERM', shutdown)
    }
    catch (error) {
      buildSpinner.devWatcherCycle('error')
      logger.error({ err: error }, 'Failed to start watcher. Maybe @parcel/watcher not installed.')
      buildSpinner.script('error')
      process.exitCode = 1
    }
  }
  else {
    buildSpinner.script('error')
    logger.error(`Unknown command: ${CMD}. Supported: build, dev`)
    process.exitCode = 2
  }
}

main()
