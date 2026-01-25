import { Account } from '../../types/database.types'

interface AccountCardProps {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

const accountTypeIcons: Record<Account['type'], string> = {
  checking: '💳',
  savings: '🏦',
  credit: '💎',
  cash: '💵',
}

const accountTypeColors: Record<Account['type'], string> = {
  checking: 'from-blue-500 to-blue-600',
  savings: 'from-green-500 to-green-600',
  credit: 'from-purple-500 to-purple-600',
  cash: 'from-orange-500 to-orange-600',
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: account.currency,
    }).format(balance)
  }

  return (
    <div className={`bg-gradient-to-br ${accountTypeColors[account.type]} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{accountTypeIcons[account.type]}</span>
          <div>
            <h3 className="text-xl font-semibold">{account.name}</h3>
            <p className="text-white/80 text-sm capitalize">{account.type}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(account)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Edit account"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(account)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Delete account"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-white/80 text-sm mb-1">Saldo</p>
        <p className="text-3xl font-bold">{formatBalance(account.balance)}</p>
      </div>
    </div>
  )
}
