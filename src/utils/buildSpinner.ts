import type { SpinnerType } from './spinner'
import { createSpinner } from './spinner'

let globalScriptSpinner: SpinnerType | null = null
let buildStageSpinner: SpinnerType | null = null
let watchSpinner: SpinnerType | null = null

export const buildSpinner = {
  // CLI задачи
  script(type: 'start' | 'success' | 'error') {
    if (type === 'start') {
      if (!globalScriptSpinner) {
        globalScriptSpinner = createSpinner('Запуск сборки...').start()
      }
      else {
        globalScriptSpinner.text = 'Запуск сборки...'
        if (!globalScriptSpinner.isSpinning)
          globalScriptSpinner.start()
      }
    }
    if (type === 'success') {
      globalScriptSpinner?.success('CLI завершил работу')
      globalScriptSpinner = null
    }
    if (type === 'error') {
      globalScriptSpinner?.error('CLI завершился с ошибкой')
      globalScriptSpinner = null
    }
  },

  // Build этап
  build(type: 'start' | 'success' | 'error') {
    if (type === 'start') {
      if (!buildStageSpinner) {
        buildStageSpinner = createSpinner('Сборка стилей...').start()
      }
      else {
        buildStageSpinner.text = 'Сборка стилей...'
        if (!buildStageSpinner.isSpinning)
          buildStageSpinner.start()
      }
    }
    if (type === 'success') {
      buildStageSpinner?.success('Стили собраны успешно')
      buildStageSpinner = null
    }
    if (type === 'error') {
      buildStageSpinner?.error('Ошибка при сборке')
      buildStageSpinner = null
    }
  },

  // Watcher: строгий UX — только один раз крутим спиннер, потом убираем
  devWatcherCycle(type: 'start' | 'stop' | 'error') {
    if (type === 'start') {
      if (!watchSpinner)
        watchSpinner = createSpinner('Watch mode: слежение за изменениями...').start()
    }
    if (type === 'stop') {
      watchSpinner?.stop('Watch запущен!')
      watchSpinner = null
    }
    if (type === 'error') {
      watchSpinner?.error('Ошибка watch-процесса')
      watchSpinner = null
    }
  },
}
