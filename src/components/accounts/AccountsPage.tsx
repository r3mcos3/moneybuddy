import { useState } from 'react'
import { useAccounts } from '../../hooks/useAccounts'
import { AccountCard } from './AccountCard'
import { AccountModal } from './AccountModal'
import { Account } from '../../types/database.types'

export function AccountsPage() {
  const { accounts, loading, createAccount, updateAccount, deleteAccount, getTotalBalance } = useAccounts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null)

  const handleSaveAccount = async (accountData: Partial<Account>) => {
    if (editingAccount) {
      await updateAccount(editingAccount.id, accountData)
    } else {
      await createAccount(accountData)
    }
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setIsModalOpen(true)
  }

  const handleDeleteAccount = async (account: Account) => {
    setDeleteConfirm(account)
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteAccount(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleAddNew = () => {
    setEditingAccount(null)
    setIsModalOpen(true)
  }

  const totalBalance = getTotalBalance()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Rekeningen laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Rekeningen</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Beheer je bankrekeningen en portemonnees
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Rekening Toevoegen
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 mb-6 text-white shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Totaal Saldo</h3>
        <p className="text-4xl font-bold">
          {new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: 'EUR',
          }).format(totalBalance)}
        </p>
        <p className="text-indigo-100 mt-2">Over {accounts.length} rekening{accounts.length !== 1 ? 'en' : ''}</p>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nog geen rekeningen
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Voeg je eerste rekening toe om je financiën te kunnen volgen
          </p>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Voeg Je Eerste Rekening Toe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEditAccount}
              onDelete={handleDeleteAccount}
            />
          ))}
        </div>
      )}

      {/* Account Modal */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAccount(null)
        }}
        onSave={handleSaveAccount}
        account={editingAccount}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Rekening Verwijderen?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Weet je zeker dat je <strong>{deleteConfirm.name}</strong> wilt verwijderen? Dit verwijdert ook alle bijbehorende transacties. Deze actie kan niet ongedaan worden gemaakt.
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
