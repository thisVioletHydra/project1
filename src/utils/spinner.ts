import yoctoSpinner from '@socketregistry/yocto-spinner'

export interface Spinner {
  start: (text?: string) => this
  success: (text?: string) => this
  error: (text?: string) => this
  stop: (text?: string) => this
  warning: (text?: string) => this
}

export function createSpinner(text: string = 'Loading...'): Spinner {
  return yoctoSpinner({ text, color: 'cyan' })
}
