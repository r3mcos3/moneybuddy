import { useState } from 'react'
import { useBudgets } from '../../hooks/useBudgets'
import { BudgetCard } from './BudgetCard'
import { BudgetModal } from './BudgetModal'
import { Budget } from '../../types/database.types'

export function BudgetsPage() {
  const { budgets, loading, createBudget, updateBudget, deleteBudget } = useBudgets()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Budget | null>(null)

  const handleSaveBudget = async (budgetData: Partial<Budget>) => {
    if (editingBudget) {
      await updateBudget(editingBudget.id, budgetData)
    } else {
      await createBudget(budgetData)
    }
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setIsModalOpen(true)
  }

  const handleDeleteBudget = (budget: Budget) => {
    setDeleteConfirm(budget)
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteBudget(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleAddNew = () => {
    setEditingBudget(null)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Budgetten laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Budgetten</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Volg je uitgaven tegen je budgetten
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Budget Aanmaken
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nog geen budgetten
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Maak je eerste budget aan om uitgaven in specifieke categorieën bij te houden
          </p>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Maak Je Eerste Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBudget(null)
        }}
        onSave={handleSaveBudget}
        budget={editingBudget}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Budget Verwijderen?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Weet je zeker dat je dit budget wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
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
