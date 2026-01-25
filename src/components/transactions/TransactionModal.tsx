import { useState, useEffect } from 'react'
import { Transaction } from '../../types/database.types'
import { useAccounts } from '../../hooks/useAccounts'
import { useCategories } from '../../hooks/useCategories'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Partial<Transaction>) => Promise<void>
  transaction?: Transaction | null
}

export function TransactionModal({ isOpen, onClose, onSave, transaction }: TransactionModalProps) {
  const { accounts } = useAccounts()
  const { categories, getIncomeCategories, getExpenseCategories } = useCategories()

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [transactionDate, setTransactionDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (transaction) {
      const category = categories.find(c => c.id === transaction.category_id)
      setType(category?.type || 'expense')
      setAmount(Math.abs(transaction.amount).toString())
      setDescription(transaction.description)
      setAccountId(transaction.account_id)
      setCategoryId(transaction.category_id || '')
      setTransactionDate(transaction.transaction_date)
    } else {
      setType('expense')
      setAmount('')
      setDescription('')
      setAccountId(accounts[0]?.id || '')
      setCategoryId('')
      setTransactionDate(new Date().toISOString().split('T')[0])
    }
    setError(null)
  }, [transaction, isOpen, accounts, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const numAmount = parseFloat(amount)
      // Income is positive, expense is negative
      const finalAmount = type === 'income' ? numAmount : -numAmount

      await onSave({
        amount: finalAmount,
        description,
        account_id: accountId,
        category_id: categoryId,
        transaction_date: transactionDate,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan van transactie mislukt')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const availableCategories = type === 'income' ? getIncomeCategories() : getExpenseCategories()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {transaction ? 'Transactie bewerken' : 'Transactie toevoegen'}
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

          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  type === 'expense'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">💸</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Uitgave</div>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  type === 'income'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">💰</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Inkomen</div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bedrag
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Beschrijving
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Boodschappen"
            />
          </div>

          {/* Account */}
          <div>
            <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rekening
            </label>
            <select
              id="account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecteer rekening</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categorie
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecteer categorie</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Datum
            </label>
            <input
              id="date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              {loading ? 'Opslaan...' : transaction ? 'Bijwerken' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
