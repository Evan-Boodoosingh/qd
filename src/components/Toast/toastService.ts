type ToastType = 'success' | 'error'

let addToastGlobal: ((message: string, type?: ToastType) => void) | null = null

export const toast = {
  success: (message: string) => addToastGlobal?.(message, 'success'),
  error: (message: string) => addToastGlobal?.(message, 'error'),
}

export const setToastHandler = (fn: ((message: string, type?: ToastType) => void) | null) => {
  addToastGlobal = fn
}

export type { ToastType }