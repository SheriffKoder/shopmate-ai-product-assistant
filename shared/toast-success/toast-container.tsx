/**
 * Toast Container Component
 * 
 * Purpose: Container component that manages multiple toast notifications
 * Used in: User settings page and other pages that need toast notifications
 * Why: Provides a centralized way to manage and display multiple toasts
 * 
 * Implementation Steps:
 * 1. Create container that manages multiple toasts
 * 2. Provide methods to add and remove toasts
 * 3. Support different toast types and positions
 * 4. Handle toast lifecycle and cleanup
 */

'use client'

import { useState, useCallback } from 'react'
import Toast, { ToastType, ToastPosition, ToastStacking, ToastProps } from './toast'

/**
 * Toast item interface
 * @interface ToastItem
 */
interface ToastItem extends ToastProps {
  id: string
}

/**
 * Toast container props interface
 * @interface ToastContainerProps
 */
interface ToastContainerProps {
  position?: ToastPosition
  maxToasts?: number
  stacking?: ToastStacking
}

/**
 * Toast container component
 * @param {ToastContainerProps} props - Component props
 * @returns {JSX.Element} Toast container with management functions
 */
export default function ToastContainer({ 
  position = ToastPosition.TOP_RIGHT,
  maxToasts = 5,
  stacking = ToastStacking.PUSH_UP
}: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  ///////////////////////
  // Add a new toast
  const addToast = useCallback((toast: Omit<ToastProps, 'position' | 'stacking'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastItem = {
      ...toast,
      id,
      position,
      stacking
    }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      // Limit the number of toasts
      return updated.slice(0, maxToasts)
    })
  }, [position, stacking, maxToasts])

  ///////////////////////
  // Remove a toast
  const removeToast = useCallback((id?: string) => {
    if (id) {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }
  }, [])

  ///////////////////////
  // Convenience methods for different toast types
  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    addToast({
      type: ToastType.SUCCESS,
      title,
      message,
      duration
    })
  }, [addToast])

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    addToast({
      type: ToastType.ERROR,
      title,
      message,
      duration
    })
  }, [addToast])

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    addToast({
      type: ToastType.WARNING,
      title,
      message,
      duration
    })
  }, [addToast])

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    addToast({
      type: ToastType.INFO,
      title,
      message,
      duration
    })
  }, [addToast])

  ///////////////////////
  // Expose methods via window object for global access
  if (typeof window !== 'undefined') {
    (window as any).toast = {
      showSuccess,
      showError,
      showWarning,
      showInfo,
      addToast
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          {...toast}
          index={index}
          zIndex={50 + toasts.length - index}
          onClose={removeToast}
        />
      ))}
    </div>
  )
} 