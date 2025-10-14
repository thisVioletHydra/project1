import path from 'node:path'
import { subscribe } from '@parcel/watcher'
import { processCSS } from './src/processors/cssProcessor'
import { processTS } from './src/processors/tsProcessor'

const watchDirs = ['src']
const cssGlob = /\.css$/i
const tsGlob = /\.(ts|tsx)$/i

for (const dir of watchDirs) {
  subscribe(dir, async (err, events) => {
    if (err)
      throw err
    for (const event of events) {
      const file = event.path
      if (cssGlob.test(file))
        await processCSS(file)
      if (tsGlob.test(file))
        await processTS(file)
    }
  })
}

console.log('Live watcher (Bun, yocto-spinner, модульно) запущен ✔️')
