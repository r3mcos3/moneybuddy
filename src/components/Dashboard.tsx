import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { Header } from './layout/Header'
import { StatCard } from './layout/StatCard'
import { AccountsPage } from './accounts/AccountsPage'
import { TransactionsPage } from './transactions/TransactionsPage'
import { RecurringTransactionsPage } from './recurring/RecurringTransactionsPage'
import { AnalyticsPage } from './analytics/AnalyticsPage'
import { MonthlyOverviewPage } from './monthly/MonthlyOverviewPage'
import { DevTools } from './DevTools'

type Page = 'dashboard' | 'accounts' | 'transactions' | 'recurring' | 'analytics' | 'monthly'

export function Dashboard() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const { getTotalBalance, accounts, refresh: refreshAccounts } = useAccounts()
  const { transactions, refresh: refreshTransactions } = useTransactions()

  const totalBalance = getTotalBalance()
  const recentTransactions = transactions.slice(0, 5)

  const handleDataSeeded = () => {
    // Refresh all data
    refreshAccounts()
    refreshTransactions()
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'accounts':
        return <AccountsPage />
      case 'transactions':
        return <TransactionsPage />
      case 'recurring':
        return <RecurringTransactionsPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'monthly':
        return <MonthlyOverviewPage />
      case 'dashboard':
      default:
        return (
          <div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-6 text-white shadow-lg">
              <h2 className="text-2xl font-semibold mb-2">Totaal Saldo</h2>
              <p className="text-4xl font-bold">
                {new Intl.NumberFormat('nl-NL', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(totalBalance)}
              </p>
              <p className="text-blue-100 mt-2">
                {totalBalance === 0 ? 'Voeg je eerste rekening toe om te beginnen' : 'Over al je rekeningen'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Rekeningen"
                emoji="🏦"
                description="Beheer je rekeningen"
                color="orange"
                onClick={() => setCurrentPage('accounts')}
              />
              <StatCard
                title="Maandoverzicht"
                emoji="📅"
                description="Bekijk per maand"
                color="blue"
                onClick={() => setCurrentPage('monthly')}
              />
              <StatCard
                title="Terugkerend"
                emoji="🔄"
                description="Vaste lasten en inkomsten"
                color="green"
                onClick={() => setCurrentPage('recurring')}
              />
              <StatCard
                title="Transacties"
                emoji="💰"
                description="Bekijk alle transacties"
                color="purple"
                onClick={() => setCurrentPage('transactions')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Analytics"
                emoji="📈"
                description="Inzicht in je uitgaven"
                color="orange"
                onClick={() => setCurrentPage('analytics')}
              />
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Recente Transacties</h3>
                {recentTransactions.length > 0 && (
                  <button
                    onClick={() => setCurrentPage('transactions')}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold"
                  >
                    Bekijk Alles
                  </button>
                )}
              </div>

              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="mb-4">Nog geen transacties</p>
                  <button
                    onClick={() => setCurrentPage('transactions')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
                  >
                    Voeg Je Eerste Transactie Toe
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => {
                    const account = accounts.find(a => a.id === transaction.account_id)
                    const isIncome = transaction.amount > 0
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {transaction.description}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {account?.name} • {new Date(transaction.transaction_date).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                        <span className={`font-bold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isIncome ? '+' : '-'}€{Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 py-8">
          <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />

          {/* Navigation */}
          {currentPage !== 'dashboard' && (
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="mb-6 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
            >
              ← Terug naar Dashboard
            </button>
          )}

          <main>{renderPage()}</main>

          {/* Dev Tools - alleen in development mode */}
          {import.meta.env.DEV && <DevTools onDataSeeded={handleDataSeeded} />}
        </div>
      </div>
    </div>
  )
}
