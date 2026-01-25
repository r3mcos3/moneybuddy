import { Transaction } from '../../types/database.types'
import { useCategories } from '../../hooks/useCategories'
import { useAccounts } from '../../hooks/useAccounts'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const { getCategoryById } = useCategories()
  const { accounts } = useAccounts()

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'Onbekend'
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-6xl mb-4">💸</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Nog geen transacties
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Voeg je eerste transactie toe om je financiën bij te houden
        </p>
      </div>
    )
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.transaction_date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
            {formatDate(date)}
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {dayTransactions.map((transaction) => {
              const category = getCategoryById(transaction.category_id || '')
              const isIncome = transaction.amount > 0

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">
                      {category?.icon || (isIncome ? '💰' : '💸')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {transaction.description}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category?.name || 'Ongecategoriseerd'} • {getAccountName(transaction.account_id)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(transaction)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        aria-label="Bewerken transactie"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(transaction)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        aria-label="Verwijderen transactie"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
