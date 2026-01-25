import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { seedMockData, clearAllData } from '../lib/seedData'

interface DevToolsProps {
  onDataSeeded: () => void
}

export function DevTools({ onDataSeeded }: DevToolsProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleSeedData = async () => {
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const result = await seedMockData(user.id)
      setMessage(`✅ Successfully created ${result.accounts} accounts, ${result.transactions} transactions, and ${result.budgets} budgets!`)

      // Refresh the page data
      setTimeout(() => {
        onDataSeeded()
      }, 1000)
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed to seed data'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClearData = async () => {
    if (!user) return
    if (!confirm('Are you sure you want to delete ALL your data? This cannot be undone!')) return

    setLoading(true)
    setMessage(null)

    try {
      await clearAllData(user.id)
      setMessage('✅ All data cleared successfully!')

      setTimeout(() => {
        onDataSeeded()
      }, 1000)
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed to clear data'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors z-50 text-sm font-semibold"
      >
        🛠️ Dev Tools
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 z-50 w-96 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">🛠️ Developer Tools</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleSeedData}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? '⏳ Bezig...' : '🌱 Voeg Testdata Toe'}
        </button>

        <button
          onClick={handleClearData}
          disabled={loading}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? '⏳ Bezig...' : '🗑️ Verwijder Alle Data'}
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message.startsWith('✅')
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong>Testdata Toevoegen:</strong> Maakt 4 rekeningen, ~100 transacties (afgelopen 30 dagen), en 6 budgetten aan.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <strong>Alle Data Verwijderen:</strong> Verwijdert alle rekeningen, transacties, en budgetten (behoudt profiel & categorieën).
        </p>
      </div>
    </div>
  )
}
