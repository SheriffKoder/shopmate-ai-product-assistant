/**
 * Toast Notification Component
 * 
 * Purpose: Reusable toast notification component for showing success, error, warning, and info messages
 * Used in: User settings page and other components that need temporary notifications
 * Why: Provides consistent, configurable notification system across the app
 * 
 * Features:
 * - Auto-dismiss with configurable duration (0 = no auto-dismiss)
 * - Manual dismiss with close button
 * - Multiple positions (top-left, top-right, top-center, bottom-left, bottom-right, bottom-center)
 * - Different types with appropriate colors and icons (success, error, warning, info)
 * - Smooth animations
 * - Dark mode support
 * - Responsive design
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Multiple toasts support with configurable limit
 * 
 * Implementation Steps:
 * 1. Create toast container with different types (success, error, warning, info)
 * 2. Support auto-dismiss with configurable duration
 * 3. Support manual dismiss with close button
 * 4. Support custom positioning
 * 5. Support custom styling and icons
 */

'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

/**
 * Toast type enum
 * @enum ToastType
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Toast position enum
 * @enum ToastPosition
 */
export enum ToastPosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  TOP_CENTER = 'top-center',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_CENTER = 'bottom-center'
}

/**
 * Toast stacking behavior enum
 * @enum ToastStacking
 */
export enum ToastStacking {
  NONE = 'none',           // No stacking, toasts overlap
  PUSH_UP = 'push-up',     // New toasts push existing ones up
  PUSH_DOWN = 'push-down'  // New toasts push existing ones down
}

/**
 * Toast props interface
 * @interface ToastProps
 */
export interface ToastProps {
  id?: string
  type: ToastType
  title?: string
  message: string
  duration?: number // in milliseconds, 0 = no auto-dismiss
  position?: ToastPosition
  stacking?: ToastStacking
  onClose?: (id?: string) => void
  showCloseButton?: boolean
  className?: string
  index?: number // Internal use for stacking
  zIndex?: number // Custom z-index
}

/**
 * Toast icon mapping
 */
const toastIcons = {
  [ToastType.SUCCESS]: CheckCircle,
  [ToastType.ERROR]: AlertCircle,
  [ToastType.WARNING]: AlertTriangle,
  [ToastType.INFO]: Info
}

/**
 * Toast color mapping
 */
const toastColors = {
  [ToastType.SUCCESS]: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    icon: 'text-green-600 dark:text-green-400'
  },
  [ToastType.ERROR]: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    icon: 'text-red-600 dark:text-red-400'
  },
  [ToastType.WARNING]: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: 'text-yellow-600 dark:text-yellow-400'
  },
  [ToastType.INFO]: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    icon: 'text-blue-600 dark:text-blue-400'
  }
}

/**
 * Toast position classes
 */
const positionClasses = {
  [ToastPosition.TOP_LEFT]: 'top-4 left-4',
  [ToastPosition.TOP_RIGHT]: 'top-4 right-4',
  [ToastPosition.TOP_CENTER]: 'top-4 left-1/2 transform -translate-x-1/2',
  [ToastPosition.BOTTOM_LEFT]: 'bottom-4 left-4',
  [ToastPosition.BOTTOM_RIGHT]: 'bottom-4 right-4',
  [ToastPosition.BOTTOM_CENTER]: 'bottom-4 left-1/2 transform -translate-x-1/2'
}

/**
 * Toast notification component
 * @param {ToastProps} props - Component props
 * @returns {JSX.Element | null} Toast notification component
 */
export default function Toast({
  id,
  type,
  title,
  message,
  duration = 3000,
  position = ToastPosition.TOP_RIGHT,
  stacking = ToastStacking.NONE,
  onClose,
  showCloseButton = true,
  className = '',
  index,
  zIndex
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  const colors = toastColors[type]
  const IconComponent = toastIcons[type]
  const basePositionClass = positionClasses[position]

  ///////////////////////
  // Calculate stacking offset
  const getStackingOffset = () => {
    if (stacking === ToastStacking.NONE || index === undefined) {
      return { transform: '' }
    }

    const offset = index * 80 // 80px per toast (includes margin)
    
    if (stacking === ToastStacking.PUSH_UP) {
      // For top positions, push existing toasts up
      if (position.includes('top')) {
        return { transform: `translateY(-${offset}px)` }
      }
      // For bottom positions, push existing toasts down
      else {
        return { transform: `translateY(${offset}px)` }
      }
    } else if (stacking === ToastStacking.PUSH_DOWN) {
      // For top positions, push existing toasts down
      if (position.includes('top')) {
        return { transform: `translateY(${offset}px)` }
      }
      // For bottom positions, push existing toasts up
      else {
        return { transform: `translateY(-${offset}px)` }
      }
    }
    
    return { transform: '' }
  }

  const stackingOffset = getStackingOffset()
  const positionClass = basePositionClass

  // Combine stacking offset with z-index
  const combinedStyle = {
    ...stackingOffset,
    zIndex: zIndex || 50
  }

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onClose?.(id)
        }, 300) // Wait for fade out animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose, id])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.(id)
    }, 300) // Wait for fade out animation
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`fixed ${positionClass} max-w-sm w-full transition-transform duration-300 ease-in-out ${className}`}
      style={combinedStyle}
      role="alert"
      aria-live="assertive"
    >
      <div
        className={`${colors.bg} ${colors.border} border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colors.icon}`} />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`text-sm font-medium ${colors.text} mb-1`}>
                {title}
              </h3>
            )}
            <p className={`text-sm ${colors.text}`}>
              {message}
            </p>
          </div>
          
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={handleClose}
              className={`flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${colors.text}`}
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 