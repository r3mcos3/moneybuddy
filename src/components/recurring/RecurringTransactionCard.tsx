import { RecurringTransaction } from '../../types/database.types'

interface RecurringTransactionCardProps {
  recurring: RecurringTransaction
  accountName: string
  categoryName: string
  categoryIcon: string
  onEdit: (recurring: RecurringTransaction) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, active: boolean) => void
  onProcess?: (id: string) => Promise<void>
  isProcessing?: boolean
}

export function RecurringTransactionCard({
  recurring,
  accountName,
  categoryName,
  categoryIcon,
  onEdit,
  onDelete,
  onToggleActive,
  onProcess,
  isProcessing = false,
}: RecurringTransactionCardProps) {
  const isIncome = recurring.amount > 0

  // Check if due (not processed this month yet)
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  let isDue = false
  if (!recurring.last_processed_date) {
    isDue = true
  } else {
    const lastProcessed = new Date(recurring.last_processed_date)
    const lastProcessedMonth = `${lastProcessed.getFullYear()}-${String(lastProcessed.getMonth() + 1).padStart(2, '0')}`
    isDue = lastProcessedMonth < currentMonth
  }

  const frequencyLabels = {
    weekly: 'Wekelijks',
    every_4_weeks: 'Elke 4 weken',
    monthly: 'Maandelijks',
    yearly: 'Jaarlijks',
  }

  const getDayLabel = (day: number) => {
    if (day === 1) return '1ste'
    if (day === 2) return '2de'
    if (day === 3) return '3de'
    return `${day}ste`
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border-l-4 transition-all ${
      !recurring.active
        ? 'border-gray-400 opacity-60'
        : isDue
        ? 'border-orange-500'
        : isIncome
        ? 'border-green-500'
        : 'border-red-500'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{categoryIcon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {recurring.description}
              {!recurring.active && (
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                  Inactief
                </span>
              )}
              {isDue && recurring.active && (
                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded">
                  Te verwerken
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {categoryName} • {accountName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {frequencyLabels[recurring.frequency]}
              {recurring.day_of_month && ` • ${getDayLabel(recurring.day_of_month)} van de maand`}
            </p>
            {recurring.last_processed_date && (
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                Laatste keer: {new Date(recurring.last_processed_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className={`text-xl font-bold ${
            isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isIncome ? '+' : '-'}€{Math.abs(recurring.amount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        {isDue && recurring.active && onProcess && (
          <button
            onClick={() => onProcess(recurring.id)}
            disabled={isProcessing}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-md text-sm font-semibold transition-colors flex items-center gap-1"
          >
            {isProcessing ? '⏳' : '✓'} Verwerk
          </button>
        )}
        <button
          onClick={() => onToggleActive(recurring.id, !recurring.active)}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
            recurring.active
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
          }`}
        >
          {recurring.active ? 'Deactiveren' : 'Activeren'}
        </button>
        <button
          onClick={() => onEdit(recurring)}
          className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-md text-sm font-semibold transition-colors"
        >
          Bewerken
        </button>
        <button
          onClick={() => {
            if (confirm(`Weet je zeker dat je "${recurring.description}" wilt verwijderen?`)) {
              onDelete(recurring.id)
            }
          }}
          className="px-4 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-md text-sm font-semibold transition-colors"
        >
          Verwijderen
        </button>
      </div>
    </div>
  )
}
