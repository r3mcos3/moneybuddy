import { useState, useEffect } from 'react'
import { RecurringTransaction } from '../../types/database.types'
import { useAccounts } from '../../hooks/useAccounts'
import { useCategories } from '../../hooks/useCategories'

interface RecurringTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    accountId: string
    categoryId: string
    description: string
    amount: number
    frequency: 'weekly' | 'every_4_weeks' | 'monthly' | 'yearly'
    startDate: string
  }) => Promise<void>
  recurring?: RecurringTransaction
}

export function RecurringTransactionModal({
  isOpen,
  onClose,
  onSave,
  recurring,
}: RecurringTransactionModalProps) {
  const { accounts } = useAccounts()
  const { categories, getIncomeCategories, getExpenseCategories } = useCategories()

  const [formData, setFormData] = useState({
    accountId: '',
    categoryId: '',
    description: '',
    amount: '',
    frequency: 'monthly' as 'weekly' | 'every_4_weeks' | 'monthly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0],
    isIncome: false,
  })

  useEffect(() => {
    if (recurring) {
      const category = categories.find(c => c.id === recurring.category_id)
      setFormData({
        accountId: recurring.account_id,
        categoryId: recurring.category_id,
        description: recurring.description,
        amount: Math.abs(recurring.amount).toString(),
        frequency: recurring.frequency,
        startDate: recurring.start_date,
        isIncome: category?.type === 'income',
      })
    } else {
      setFormData({
        accountId: accounts[0]?.id || '',
        categoryId: '',
        description: '',
        amount: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        isIncome: false,
      })
    }
  }, [recurring, accounts, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Voer een geldig bedrag in')
      return
    }

    await onSave({
      accountId: formData.accountId,
      categoryId: formData.categoryId,
      description: formData.description,
      amount: formData.isIncome ? amount : -amount,
      frequency: formData.frequency,
      startDate: formData.startDate,
    })

    onClose()
  }

  if (!isOpen) return null

  const availableCategories = formData.isIncome ? getIncomeCategories() : getExpenseCategories()

  const frequencyLabels = {
    weekly: 'Wekelijks',
    every_4_weeks: 'Elke 4 weken',
    monthly: 'Maandelijks',
    yearly: 'Jaarlijks',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {recurring ? 'Bewerk' : 'Nieuwe'} Terugkerende Transactie
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isIncome: false, categoryId: '' })}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                !formData.isIncome
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Uitgave
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isIncome: true, categoryId: '' })}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                formData.isIncome
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Inkomen
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Beschrijving
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="bijv. Huur, Salaris, Netflix"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Bedrag (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0.00"
              required
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Interval
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.entries(frequencyLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Categorie
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Selecteer categorie</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Rekening
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Startdatum
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {recurring ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
