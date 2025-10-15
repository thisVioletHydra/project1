import type { Spinner } from 'yocto-spinner'
import yoctoSpinner from 'yocto-spinner'

export type SpinnerType = Spinner
export function createSpinner(text: string = 'Loading...'): Spinner {
  return yoctoSpinner({ text, color: 'yellow' })
}
