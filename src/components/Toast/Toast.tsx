import { useState, useEffect, useCallback } from 'react'
import { setToastHandler } from './toastService'
import type { ToastType } from './toastService'

type Toast = {
  id: string
  message: string
  type: ToastType
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    setToastHandler(addToast)
    return () => { setToastHandler(null) }
  }, [addToast])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-full text-[13px] font-medium text-white shadow-lg pointer-events-auto animate-fade-in ${
            t.type === 'success' ? 'bg-[#1a1815] border border-white/10' : 'bg-red-500/90'
          }`}
        >
          {t.type === 'success' && <span className="text-[#D13924] mr-2">✓</span>}
          {t.message}
        </div>
      ))}
    </div>
  )
}