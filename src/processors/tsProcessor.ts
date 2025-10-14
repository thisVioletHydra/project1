import { createSpinner } from '../utils/spinner'

// Пример TS проверщика. Можно реализовать actual typechecking через exec("bunx tsc ...")
export async function processTS(file: string) {
  const spinner = createSpinner(`TS/TSX изменён: ${file}`).start()
  // Здесь можно вставить валидацию, билд или спецлогику
  spinner.success(`TS/TSX просто обработан: ${file}`)
}
