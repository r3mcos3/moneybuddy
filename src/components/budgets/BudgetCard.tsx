import { useState, useEffect } from 'react'
import { Budget } from '../../types/database.types'
import { useCategories } from '../../hooks/useCategories'
import { useBudgets } from '../../hooks/useBudgets'

interface BudgetCardProps {
  budget: Budget
  onEdit: (budget: Budget) => void
  onDelete: (budget: Budget) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const { getCategoryById } = useCategories()
  const { getBudgetSpending } = useBudgets()
  const [spent, setSpent] = useState(0)
  const [loading, setLoading] = useState(true)

  const category = getCategoryById(budget.category_id)

  useEffect(() => {
    const loadSpending = async () => {
      setLoading(true)
      const total = await getBudgetSpending(budget.id)
      setSpent(total)
      setLoading(false)
    }
    loadSpending()
  }, [budget.id])

  const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0
  const isOverBudget = spent > budget.amount
  const remaining = budget.amount - spent

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500'
    if (percentage > 80) return 'bg-orange-500'
    if (percentage > 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category?.icon || '📊'}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category?.name || 'Onbekende Categorie'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {budget.period}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(budget)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Bewerken budget"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Verwijderen budget"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Uitgegeven</span>
          <span className={`font-semibold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {loading ? '...' : formatCurrency(spent)}
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-300 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Budget</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(budget.amount)}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Resterend</span>
            <span className={`font-bold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
          {isOverBudget && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              ⚠️ Boven budget met {formatCurrency(Math.abs(remaining))}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
