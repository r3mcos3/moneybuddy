import { useState } from 'react'
import { useTransactions } from '../../hooks/useTransactions'
import { useCategories } from '../../hooks/useCategories'
import { useAccounts } from '../../hooks/useAccounts'
import { TransactionList } from './TransactionList'
import { TransactionModal } from './TransactionModal'
import { Transaction } from '../../types/database.types'

export function TransactionsPage() {
  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction } = useTransactions()
  const { categories } = useCategories()
  const { accounts } = useAccounts()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Transaction | null>(null)
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')

  const handleSaveTransaction = async (transactionData: Partial<Transaction>) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transactionData)
    } else {
      await createTransaction(transactionData)
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleDeleteTransaction = (transaction: Transaction) => {
    setDeleteConfirm(transaction)
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteTransaction(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleAddNew = () => {
    setEditingTransaction(null)
    setIsModalOpen(true)
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (filterAccount !== 'all' && transaction.account_id !== filterAccount) return false
    if (filterCategory !== 'all' && transaction.category_id !== filterCategory) return false
    if (filterType === 'income' && transaction.amount <= 0) return false
    if (filterType === 'expense' && transaction.amount >= 0) return false
    return true
  })

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const netAmount = totalIncome - totalExpenses

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Transacties laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Transacties</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Volg je inkomsten en uitgaven
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Transactie Toevoegen
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Inkomsten</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Uitgaven</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className={`bg-gradient-to-br ${netAmount >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl p-6 text-white shadow-lg`}>
          <h3 className="text-sm font-semibold mb-2 opacity-90">Netto</h3>
          <p className="text-3xl font-bold">{formatCurrency(netAmount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rekening
            </label>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Rekeningen</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categorie
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Categorieën</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Types</option>
              <option value="income">Inkomsten</option>
              <option value="expense">Uitgaven</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={filteredTransactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTransaction(null)
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Transactie Verwijderen?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Weet je zeker dat je deze transactie wilt verwijderen: <strong>{deleteConfirm.description}</strong>? Dit zal je rekeningsaldo bijwerken. Deze actie kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                Annuleren
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
