import { useState } from 'react'
import { useRecurringTransactions } from '../../hooks/useRecurringTransactions'
import { useAccounts } from '../../hooks/useAccounts'
import { useCategories } from '../../hooks/useCategories'
import { useTransactions } from '../../hooks/useTransactions'
import { RecurringTransactionModal } from './RecurringTransactionModal'
import { RecurringTransactionCard } from './RecurringTransactionCard'

export function RecurringTransactionsPage() {
  const {
    recurringTransactions,
    loading,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    processRecurringTransactions,
    processSingleRecurring,
    getDueCount,
  } = useRecurringTransactions()
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const { refresh: refreshTransactions } = useTransactions()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [processingSingle, setProcessingSingle] = useState<string | null>(null)

  const handleAddRecurring = async (data: any) => {
    await addRecurringTransaction(
      data.accountId,
      data.categoryId,
      data.description,
      data.amount,
      data.frequency,
      data.dayOfMonth
    )
  }

  const handleEditRecurring = async (data: any) => {
    if (!editingRecurring) return

    await updateRecurringTransaction(editingRecurring.id, {
      description: data.description,
      amount: data.amount,
      frequency: data.frequency,
      account_id: data.accountId,
      category_id: data.categoryId,
    })
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    await updateRecurringTransaction(id, { active })
  }

  const handleProcessSingle = async (id: string) => {
    setProcessingSingle(id)
    try {
      const result = await processSingleRecurring(id)
      if (result.success) {
        refreshTransactions()
        // Optioneel: success feedback
      } else {
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : '❌ Fout bij verwerken van transactie'
        alert(errorMessage)
      }
    } finally {
      setProcessingSingle(null)
    }
  }

  const handleProcess = async () => {
    if (processing) return

    const dueCount = getDueCount()
    if (dueCount === 0) {
      alert('Er zijn geen terugkerende transacties te verwerken.')
      return
    }

    if (!confirm(`${dueCount} terugkerende transactie(s) verwerken?`)) return

    setProcessing(true)
    try {
      const result = await processRecurringTransactions()
      if (result.success) {
        alert(`✅ ${result.count} transactie(s) verwerkt!`)
        refreshTransactions()
      } else {
        alert('❌ Fout bij verwerken van transacties')
      }
    } finally {
      setProcessing(false)
    }
  }

  const openModal = () => {
    setEditingRecurring(null)
    setIsModalOpen(true)
  }

  const openEditModal = (recurring: any) => {
    setEditingRecurring(recurring)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingRecurring(null)
  }

  const activeRecurring = recurringTransactions.filter((r) => r.active)
  const inactiveRecurring = recurringTransactions.filter((r) => !r.active)
  const dueCount = getDueCount()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Laden...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Terugkerende Transacties
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Vaste lasten en regelmatige inkomsten
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={openModal}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          + Nieuwe Terugkerende Transactie
        </button>

        <button
          onClick={handleProcess}
          disabled={processing || dueCount === 0}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2"
        >
          {processing ? (
            <>⏳ Verwerken...</>
          ) : (
            <>
              🔄 Verwerk Transacties
              {dueCount > 0 && (
                <span className="bg-white text-green-600 px-2 py-0.5 rounded-full text-sm font-bold">
                  {dueCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          💡 Hoe werkt het?
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Maak terugkerende transacties aan voor vaste lasten en regelmatig inkomen</li>
          <li>• Klik op "Verwerk Transacties" om alle terugkerende transacties toe te voegen</li>
          <li>• Transacties met een oranje label zijn klaar om verwerkt te worden</li>
          <li>• Je kunt terugkerende transacties bewerken, deactiveren of verwijderen</li>
        </ul>
      </div>

      {/* Active recurring transactions */}
      {activeRecurring.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Nog geen terugkerende transacties
          </p>
          <button
            onClick={openModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
          >
            + Voeg je eerste toe
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Actief ({activeRecurring.length})
          </h3>
          {activeRecurring.map((recurring) => {
            const account = accounts.find((a) => a.id === recurring.account_id)
            const category = categories.find((c) => c.id === recurring.category_id)

            return (
              <RecurringTransactionCard
                key={recurring.id}
                recurring={recurring}
                accountName={account?.name || 'Onbekend'}
                categoryName={category?.name || 'Onbekend'}
                categoryIcon={category?.icon || '📦'}
                onEdit={openEditModal}
                onDelete={deleteRecurringTransaction}
                onToggleActive={handleToggleActive}
                onProcess={handleProcessSingle}
              />
            )
          })}
        </div>
      )}

      {/* Inactive recurring transactions */}
      {inactiveRecurring.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
            Inactief ({inactiveRecurring.length})
          </h3>
          {inactiveRecurring.map((recurring) => {
            const account = accounts.find((a) => a.id === recurring.account_id)
            const category = categories.find((c) => c.id === recurring.category_id)

            return (
              <RecurringTransactionCard
                key={recurring.id}
                recurring={recurring}
                accountName={account?.name || 'Onbekend'}
                categoryName={category?.name || 'Onbekend'}
                categoryIcon={category?.icon || '📦'}
                onEdit={openEditModal}
                onDelete={deleteRecurringTransaction}
                onToggleActive={handleToggleActive}
                onProcess={handleProcessSingle}
              />
            )
          })}
        </div>
      )}

      {/* Modal */}
      <RecurringTransactionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={editingRecurring ? handleEditRecurring : handleAddRecurring}
        recurring={editingRecurring}
      />
    </div>
  )
}
