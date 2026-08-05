/**
 * Use Toast Hook
 * 
 * Purpose: Custom hook for easy toast notification management
 * Used in: Components that need to show toast notifications
 * Why: Provides a clean, type-safe API for showing toasts
 * 
 * Implementation Steps:
 * 1. Create hook that accesses global toast methods
 * 2. Provide type-safe methods for different toast types
 * 3. Handle cases where toast container is not available
 */

import { useCallback } from 'react'
import { ToastType } from './toast'

/**
 * Toast methods interface
 * @interface ToastMethods
 */
interface ToastMethods {
  showSuccess: (message: string, title?: string, duration?: number) => void
  showError: (message: string, title?: string, duration?: number) => void
  showWarning: (message: string, title?: string, duration?: number) => void
  showInfo: (message: string, title?: string, duration?: number) => void
  addToast: (toast: {
    type: ToastType
    title?: string
    message: string
    duration?: number
  }) => void
}

/**
 * Use toast hook
 * @returns {ToastMethods} Toast methods for showing notifications
 */
export function useToast(): ToastMethods {
  const getToastMethods = useCallback((): ToastMethods | null => {
    if (typeof window !== 'undefined' && (window as any).toast) {
      return (window as any).toast
    }
    return null
  }, [])

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    const methods = getToastMethods()
    if (methods) {
      methods.showSuccess(message, title, duration)
    } else {
      console.warn('Toast container not available')
    }
  }, [getToastMethods])

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    const methods = getToastMethods()
    if (methods) {
      methods.showError(message, title, duration)
    } else {
      console.warn('Toast container not available')
    }
  }, [getToastMethods])

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    const methods = getToastMethods()
    if (methods) {
      methods.showWarning(message, title, duration)
    } else {
      console.warn('Toast container not available')
    }
  }, [getToastMethods])

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    const methods = getToastMethods()
    if (methods) {
      methods.showInfo(message, title, duration)
    } else {
      console.warn('Toast container not available')
    }
  }, [getToastMethods])

  const addToast = useCallback((toast: {
    type: ToastType
    title?: string
    message: string
    duration?: number
  }) => {
    const methods = getToastMethods()
    if (methods) {
      methods.addToast(toast)
    } else {
      console.warn('Toast container not available')
    }
  }, [getToastMethods])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addToast
  }
} 