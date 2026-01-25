import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Transaction } from '../types/database.types'
import { useAuth } from '../contexts/AuthContext'

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTransactions(data || [])
    }

    setLoading(false)
  }

  const createTransaction = async (transaction: Partial<Transaction>) => {
    if (!user) throw new Error('User not authenticated')

    const { data, error: createError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        account_id: transaction.account_id!,
        category_id: transaction.category_id!,
        amount: transaction.amount!,
        description: transaction.description!,
        transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (createError) throw createError

    // Update account balance
    if (transaction.account_id) {
      await updateAccountBalance(transaction.account_id, transaction.amount!)
    }

    setTransactions((prev) => [data, ...prev])
    return data
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    // Get old transaction to calculate balance change
    const oldTransaction = transactions.find(t => t.id === id)

    const { data, error: updateError } = await supabase
      .from('transactions')
      .update({
        account_id: updates.account_id,
        category_id: updates.category_id,
        amount: updates.amount,
        description: updates.description,
        transaction_date: updates.transaction_date,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Update account balance if amount or account changed
    if (oldTransaction && updates.amount !== undefined) {
      // Reverse old amount
      await updateAccountBalance(oldTransaction.account_id, -oldTransaction.amount)
      // Add new amount
      await updateAccountBalance(updates.account_id || oldTransaction.account_id, updates.amount)
    }

    setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)))
    return data
  }

  const deleteTransaction = async (id: string) => {
    const transaction = transactions.find(t => t.id === id)

    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    // Reverse the transaction amount from account
    if (transaction) {
      await updateAccountBalance(transaction.account_id, -transaction.amount)
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const updateAccountBalance = async (accountId: string, amountChange: number) => {
    // Get current balance
    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single()

    if (account) {
      await supabase
        .from('accounts')
        .update({ balance: account.balance + amountChange })
        .eq('id', accountId)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [user])

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: fetchTransactions,
  }
}
