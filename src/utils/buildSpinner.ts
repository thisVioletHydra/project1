import { createSpinner } from './spinner'

let globalScriptSpinner: ReturnType<typeof createSpinner> | null = null
let buildStageSpinner: ReturnType<typeof createSpinner> | null = null
let watchSpinner: ReturnType<typeof createSpinner> | null = null

export const buildSpinner = {
  // CLI общий запуск
  scriptStart: () => (globalScriptSpinner = createSpinner('Запуск сборки...').start()),
  scriptSuccess: () => globalScriptSpinner?.success('CLI завершил работу'),
  scriptError: () => globalScriptSpinner?.error('CLI завершился с ошибкой'),

  // этап сборки
  buildStart: () => (buildStageSpinner = createSpinner('Сборка стилей...').start()),
  buildSuccess: () => buildStageSpinner?.success('Стили собраны успешно'),
  buildError: () => buildStageSpinner?.error('Ошибка при сборке'),

  // режим живого мониторинга (watch)
  watchStart: () => (watchSpinner = createSpinner('Watch mode: слежение за изменениями...').start()),
  watchRebuild: () => (watchSpinner = createSpinner('Изменения обнаружены, пересборка...').start()),
  watchRebuildSuccess: () => watchSpinner?.success('Пересборка завершена'),
  watchError: () => watchSpinner?.error('Ошибка watch-процесса'),
}
