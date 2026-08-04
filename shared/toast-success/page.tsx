/**
 * Test3 Page - Toast Notification Testing
 * 
 * Purpose: Test page for demonstrating all toast notification functionality
 * Used in: Development and testing of toast system
 * Why: Provides a comprehensive testing environment for all toast features
 * 
 * Implementation Steps:
 * 1. Create page with ToastContainer
 * 2. Add buttons for all toast types (success, error, warning, info)
 * 3. Add buttons for different durations
 * 4. Add buttons for different positions
 * 5. Add buttons for multiple toasts simultaneously
 * 6. Show all imports and components being used
 */

'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, Zap, Clock, MapPin, Layers } from 'lucide-react'
import ToastContainer from './toast-container'
import { ToastPosition, ToastType, ToastStacking } from './toast'
import { useToast } from './use-toast'

/**
 * Test3 page component
 * @returns {JSX.Element} Test page with toast demonstration
 */
export default function Test3Page() {
  ///////////////////////
  // Toast hook
  const { showSuccess, showError, showWarning, showInfo, addToast } = useToast()

  ///////////////////////
  // State for position and stacking testing
  const [currentPosition, setCurrentPosition] = useState<ToastPosition>(ToastPosition.TOP_RIGHT)
  const [currentStacking, setCurrentStacking] = useState<ToastStacking>(ToastStacking.PUSH_UP)

  ///////////////////////
  // Basic toast functions
  const handleSuccessToast = () => {
    showSuccess('This is a success message!', 'Success', 3000)
  }

  const handleErrorToast = () => {
    showError('This is an error message!', 'Error', 5000)
  }

  const handleWarningToast = () => {
    showWarning('This is a warning message!', 'Warning', 4000)
  }

  const handleInfoToast = () => {
    showInfo('This is an info message!', 'Info', 3000)
  }

  ///////////////////////
  // Duration testing
  const handleQuickToast = () => {
    showSuccess('Quick toast (1 second)', 'Quick', 1000)
  }

  const handleLongToast = () => {
    showInfo('Long toast (10 seconds)', 'Long', 10000)
  }

  const handlePersistentToast = () => {
    addToast({
      type: ToastType.WARNING,
      title: 'Persistent',
      message: 'This toast will not auto-dismiss (duration: 0)',
      duration: 0
    })
  }

  ///////////////////////
  // Multiple toasts
  const handleMultipleToasts = () => {
    showSuccess('First toast - Success!', 'Multiple', 3000)
    setTimeout(() => showError('Second toast - Error!', 'Multiple', 3000), 500)
    setTimeout(() => showWarning('Third toast - Warning!', 'Multiple', 3000), 1000)
    setTimeout(() => showInfo('Fourth toast - Info!', 'Multiple', 3000), 1500)
  }

  ///////////////////////
  // Custom toasts
  const handleCustomToast = () => {
    addToast({
      type: ToastType.SUCCESS,
      title: 'Custom Toast',
      message: 'This is a custom toast with specific configuration',
      duration: 4000
    })
  }

  ///////////////////////
  // Position testing
  const handlePositionChange = (position: ToastPosition) => {
    setCurrentPosition(position)
    showInfo(`Toasts now appear at ${position}`, 'Position Changed', 2000)
  }

  ///////////////////////
  // Stacking behavior testing
  const handleStackingChange = (stacking: ToastStacking) => {
    setCurrentStacking(stacking)
    showInfo(`Stacking behavior changed to ${stacking}`, 'Stacking Changed', 2000)
  }

  ///////////////////////
  // Simple stacking test
  const handleStackingTest = () => {
    // Clear any existing toasts first
    showSuccess('First toast', 'Stacking Test', 5000)
    setTimeout(() => showError('Second toast', 'Stacking Test', 5000), 500)
    setTimeout(() => showWarning('Third toast', 'Stacking Test', 5000), 1000)
    setTimeout(() => showInfo('Fourth toast', 'Stacking Test', 5000), 1500)
  }

  ///////////////////////
  // Stress test
  const handleStressTest = () => {
    for (let i = 1; i <= 8; i++) {
      setTimeout(() => {
        const types = [ToastType.SUCCESS, ToastType.ERROR, ToastType.WARNING, ToastType.INFO]
        const type = types[i % 4]
        addToast({
          type,
          title: `Toast ${i}`,
          message: `This is toast number ${i} in the stress test`,
          duration: 3000
        })
      }, i * 200)
    }
  }

  return (
    <>
      {/* Toast Container - This is the main component that manages all toasts */}
      <ToastContainer 
        position={currentPosition} 
        maxToasts={5} 
        stacking={currentStacking}
      />
      
      <div className="p-8 mx-auto max-w-6xl">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Toast Notification Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all toast notification features and see the components in action
          </p>
        </div>

        {/* Components Used Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Components & Files Being Used:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Components:</h3>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• <code>ToastContainer</code> - Manages multiple toasts</li>
                <li>• <code>Toast</code> - Individual toast component</li>
                <li>• <code>useToast</code> - Hook for easy toast usage</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Files:</h3>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• <code>components/ui/toast.tsx</code></li>
                <li>• <code>components/ui/toast-container.tsx</code></li>
                <li>• <code>hooks/ui/use-toast.ts</code></li>
                <li>• <code>components/ui/index.ts</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Basic Toast Types */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Basic Toast Types
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleSuccessToast}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Success Toast
            </button>
            <button
              onClick={handleErrorToast}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <AlertCircle className="h-4 w-4" />
              Error Toast
            </button>
            <button
              onClick={handleWarningToast}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              <AlertTriangle className="h-4 w-4" />
              Warning Toast
            </button>
            <button
              onClick={handleInfoToast}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Info className="h-4 w-4" />
              Info Toast
            </button>
          </div>
        </div>

        {/* Duration Testing */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Duration Testing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleQuickToast}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Quick (1s)
            </button>
            <button
              onClick={handleLongToast}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Long (10s)
            </button>
            <button
              onClick={handlePersistentToast}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Persistent (No Auto-dismiss)
            </button>
          </div>
        </div>

        {/* Position Testing */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Position Testing (Current: {currentPosition})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.values(ToastPosition).map((position) => (
              <button
                key={position}
                onClick={() => handlePositionChange(position)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentPosition === position
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {position.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Stacking Behavior Testing */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Stacking Behavior Testing (Current: {currentStacking})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(ToastStacking).map((stacking) => (
              <button
                key={stacking}
                onClick={() => handleStackingChange(stacking)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentStacking === stacking
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {stacking.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Stacking Behavior Explanation:</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• <strong>NONE:</strong> Toasts overlap at the same position</li>
              <li>• <strong>PUSH UP:</strong> New toasts push existing ones up (for top positions) or down (for bottom positions)</li>
              <li>• <strong>PUSH DOWN:</strong> New toasts push existing ones down (for top positions) or up (for bottom positions)</li>
            </ul>
            <div className="mt-4">
              <button
                onClick={handleStackingTest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Test Stacking (4 toasts)
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Testing */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Advanced Testing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleMultipleToasts}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Multiple Toasts (4 at once)
            </button>
            <button
              onClick={handleCustomToast}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              Custom Toast
            </button>
            <button
              onClick={handleStressTest}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
            >
              Stress Test (8 toasts)
            </button>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            How It Works:
          </h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>1. <strong>ToastContainer</strong> is mounted at the top of the page and manages all toasts</p>
            <p>2. <strong>useToast hook</strong> provides methods to show different types of toasts</p>
            <p>3. When you click a button, it calls the appropriate toast method</p>
            <p>4. The toast appears with the specified type, duration, and position</p>
            <p>5. <strong>Stacking behavior</strong> controls how multiple toasts are positioned relative to each other</p>
            <p>6. Toasts auto-dismiss after their duration, or can be manually closed</p>
            <p>7. Multiple toasts stack and respect the maxToasts limit (currently 5)</p>
          </div>
        </div>

      </div>
    </>
  )
} 