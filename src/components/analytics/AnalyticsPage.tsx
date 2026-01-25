import { useMemo } from 'react'
import { useTransactions } from '../../hooks/useTransactions'
import { useCategories } from '../../hooks/useCategories'
import { useAccounts } from '../../hooks/useAccounts'

export function AnalyticsPage() {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const { accounts } = useAccounts()

  const analytics = useMemo(() => {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Spending by category
    const categorySpending = transactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        const category = categories.find(c => c.id === t.category_id)
        const categoryName = category?.name || 'Zonder categorie'
        const categoryIcon = category?.icon || '📦'
        acc[categoryName] = {
          amount: (acc[categoryName]?.amount || 0) + Math.abs(t.amount),
          icon: categoryIcon,
          count: (acc[categoryName]?.count || 0) + 1
        }
        return acc
      }, {} as Record<string, { amount: number; icon: string; count: number }>)

    // Spending by account
    const accountSpending = transactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        const account = accounts.find(a => a.id === t.account_id)
        const accountName = account?.name || 'Onbekend'
        acc[accountName] = (acc[accountName] || 0) + Math.abs(t.amount)
        return acc
      }, {} as Record<string, number>)

    // Last 7 days spending
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayTransactions = transactions.filter(t => t.transaction_date === dateStr && t.amount < 0)
      const total = dayTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      return {
        date: dateStr,
        label: date.toLocaleDateString('nl-NL', { weekday: 'short' }),
        amount: total
      }
    }).reverse()

    const maxDailySpending = Math.max(...last7Days.map(d => d.amount), 1)

    return {
      income,
      expenses,
      categorySpending,
      accountSpending,
      last7Days,
      maxDailySpending,
      transactionCount: transactions.length
    }
  }, [transactions, categories, accounts])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const topCategories = Object.entries(analytics.categorySpending)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 5)

  const topAccounts = Object.entries(analytics.accountSpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analyse</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Inzicht in je uitgavenpatroon
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Totale Inkomsten</h3>
          <p className="text-3xl font-bold">{formatCurrency(analytics.income)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Totale Uitgaven</h3>
          <p className="text-3xl font-bold">{formatCurrency(analytics.expenses)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Transacties</h3>
          <p className="text-3xl font-bold">{analytics.transactionCount}</p>
        </div>
      </div>

      {/* Last 7 Days Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Uitgaven Afgelopen 7 Dagen</h3>
        <div className="flex items-end justify-between gap-2 h-48">
          {analytics.last7Days.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end flex-1">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                  style={{
                    height: `${(day.amount / analytics.maxDailySpending) * 100}%`,
                    minHeight: day.amount > 0 ? '10%' : '0%'
                  }}
                  title={formatCurrency(day.amount)}
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Meeste Uitgaven per Categorie</h3>
          {topCategories.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nog geen uitgaven geregistreerd</p>
          ) : (
            <div className="space-y-4">
              {topCategories.map(([category, data]) => {
                const percentage = analytics.expenses > 0 ? (data.amount / analytics.expenses) * 100 : 0
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-xl">{data.icon}</span>
                        {category}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(data.amount)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {data.count} transactie{data.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Accounts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Uitgaven per Rekening</h3>
          {topAccounts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nog geen uitgaven geregistreerd</p>
          ) : (
            <div className="space-y-4">
              {topAccounts.map(([account, amount]) => {
                const percentage = analytics.expenses > 0 ? (amount / analytics.expenses) * 100 : 0
                return (
                  <div key={account}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{account}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
