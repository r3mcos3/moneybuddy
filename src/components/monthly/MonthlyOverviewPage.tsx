import { useState, useMemo } from 'react'
import { useTransactions } from '../../hooks/useTransactions'
import { useRecurringTransactions } from '../../hooks/useRecurringTransactions'

export function MonthlyOverviewPage() {
  const { transactions } = useTransactions()
  const { recurringTransactions } = useRecurringTransactions()

  // Start met huidige maand
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Bereken beschikbare maanden (vanaf eerste transactie tot nu)
  const availableMonths = useMemo(() => {
    const months = new Set<string>()

    // Voeg maanden toe van transacties
    transactions.forEach(t => {
      const date = new Date(t.transaction_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.add(monthKey)
    })

    // Voeg huidige maand altijd toe
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    months.add(currentMonth)

    return Array.from(months).sort().reverse()
  }, [transactions])

  // Filter transacties voor geselecteerde maand
  const monthlyData = useMemo(() => {
    const [year, month] = selectedDate.split('-').map(Number)

    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date)
      return date.getFullYear() === year && date.getMonth() + 1 === month
    })

    const income = monthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = monthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const net = income - expenses

    // Bereken verwachte terugkerende uitgaven voor deze maand
    const activeRecurring = recurringTransactions.filter(rt => rt.active && rt.amount < 0)
    const expectedRecurringExpenses = activeRecurring.reduce((sum, rt) => {
      // Voor nu simpel: tel alle actieve terugkerende uitgaven op
      // In de toekomst kunnen we dit verfijnen op basis van frequentie
      return sum + Math.abs(rt.amount)
    }, 0)

    return {
      income,
      expenses,
      net,
      transactionCount: monthTransactions.length,
      expectedRecurringExpenses,
      remainingAfterRecurring: net - expectedRecurringExpenses
    }
  }, [selectedDate, transactions, recurringTransactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatMonthYear = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number)
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
  }

  const goToPreviousMonth = () => {
    const [year, month] = selectedDate.split('-').map(Number)
    const prevMonth = new Date(year, month - 2) // -2 omdat maanden 0-indexed zijn
    const newDate = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
    setSelectedDate(newDate)
  }

  const goToNextMonth = () => {
    const [year, month] = selectedDate.split('-').map(Number)
    const nextMonth = new Date(year, month) // month is al correct voor volgende maand
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const newDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`

    // Niet verder dan huidige maand
    if (newDate <= currentMonth) {
      setSelectedDate(newDate)
    }
  }

  const canGoNext = () => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return selectedDate < currentMonth
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Maandoverzicht
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Bekijk je inkomsten en uitgaven per maand
        </p>
      </div>

      {/* Month selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            ← Vorige
          </button>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {formatMonthYear(selectedDate)}
            </h3>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonthYear(month)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={goToNextMonth}
            disabled={!canGoNext()}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg font-semibold transition-colors"
          >
            Volgende →
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Inkomsten</h3>
          <p className="text-3xl font-bold">{formatCurrency(monthlyData.income)}</p>
          <p className="text-sm opacity-80 mt-2">Deze maand ontvangen</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Uitgaven</h3>
          <p className="text-3xl font-bold">{formatCurrency(monthlyData.expenses)}</p>
          <p className="text-sm opacity-80 mt-2">Deze maand uitgegeven</p>
        </div>

        <div className={`bg-gradient-to-br ${monthlyData.net >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl p-6 text-white shadow-lg`}>
          <h3 className="text-sm font-semibold mb-2 opacity-90">Netto</h3>
          <p className="text-3xl font-bold">{formatCurrency(monthlyData.net)}</p>
          <p className="text-sm opacity-80 mt-2">
            {monthlyData.net >= 0 ? 'Overschot' : 'Tekort'}
          </p>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Details
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Aantal transacties</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {monthlyData.transactionCount}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Gemiddelde uitgave</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {monthlyData.transactionCount > 0
                  ? formatCurrency(monthlyData.expenses / monthlyData.transactionCount)
                  : formatCurrency(0)
                }
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Spaarpercentage</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {monthlyData.income > 0
                  ? `${((monthlyData.net / monthlyData.income) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Right column - Recurring preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Vaste Lasten Overzicht
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                  Verwachte vaste lasten
                </span>
                <span className="font-bold text-orange-900 dark:text-orange-300">
                  {formatCurrency(monthlyData.expectedRecurringExpenses)}
                </span>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-400">
                Totaal aan actieve terugkerende uitgaven
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              monthlyData.remainingAfterRecurring >= 0
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-semibold ${
                  monthlyData.remainingAfterRecurring >= 0
                    ? 'text-green-900 dark:text-green-300'
                    : 'text-red-900 dark:text-red-300'
                }`}>
                  Na vaste lasten
                </span>
                <span className={`font-bold ${
                  monthlyData.remainingAfterRecurring >= 0
                    ? 'text-green-900 dark:text-green-300'
                    : 'text-red-900 dark:text-red-300'
                }`}>
                  {formatCurrency(monthlyData.remainingAfterRecurring)}
                </span>
              </div>
              <p className={`text-xs ${
                monthlyData.remainingAfterRecurring >= 0
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-red-700 dark:text-red-400'
              }`}>
                {monthlyData.remainingAfterRecurring >= 0
                  ? 'Je hebt genoeg over na vaste lasten'
                  : 'Let op: tekort na vaste lasten'
                }
              </p>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              💡 Tip: Dit is een schatting gebaseerd op je actieve terugkerende transacties
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Uitgaven vs Inkomsten
        </h3>
        <div className="relative">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>€0</span>
            <span>{formatCurrency(monthlyData.income)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                monthlyData.expenses > monthlyData.income
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : 'bg-gradient-to-r from-green-500 to-green-600'
              }`}
              style={{
                width: `${monthlyData.income > 0 ? Math.min((monthlyData.expenses / monthlyData.income) * 100, 100) : 0}%`
              }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            Je hebt {monthlyData.income > 0 ? ((monthlyData.expenses / monthlyData.income) * 100).toFixed(1) : 0}% van je inkomsten uitgegeven
          </p>
        </div>
      </div>
    </div>
  )
}
