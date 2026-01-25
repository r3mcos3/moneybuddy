import { useState, useEffect } from 'react'
import { Account } from '../../types/database.types'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (account: Partial<Account>) => Promise<void>
  account?: Account | null
}

const accountTypes: Array<{ value: Account['type']; label: string; icon: string }> = [
  { value: 'checking', label: 'Betaalrekening', icon: '💳' },
  { value: 'savings', label: 'Spaarrekening', icon: '🏦' },
  { value: 'credit', label: 'Creditcard', icon: '💎' },
  { value: 'cash', label: 'Contant', icon: '💵' },
]

export function AccountModal({ isOpen, onClose, onSave, account }: AccountModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<Account['type']>('checking')
  const [balance, setBalance] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (account) {
      setName(account.name)
      setType(account.type)
      setBalance(account.balance.toString())
      setCurrency(account.currency)
    } else {
      setName('')
      setType('checking')
      setBalance('0')
      setCurrency('EUR')
    }
    setError(null)
  }, [account, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSave({
        name,
        type,
        balance: parseFloat(balance),
        currency,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan van rekening mislukt')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {account ? 'Rekening bewerken' : 'Rekening toevoegen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Naam
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mijn betaalrekening"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {accountTypes.map((accountType) => (
                <button
                  key={accountType.value}
                  type="button"
                  onClick={() => setType(accountType.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    type === accountType.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{accountType.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {accountType.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Beginsaldo
            </label>
            <input
              id="balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valuta
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold transition-colors"
            >
              {loading ? 'Opslaan...' : account ? 'Bijwerken' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
