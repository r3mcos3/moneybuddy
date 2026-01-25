import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Account } from '../types/database.types'
import { useAuth } from '../contexts/AuthContext'

export function useAccounts() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setAccounts(data || [])
    }

    setLoading(false)
  }

  const createAccount = async (account: Partial<Account>) => {
    if (!user) throw new Error('User not authenticated')

    const { data, error: createError } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: account.name!,
        type: account.type!,
        balance: account.balance || 0,
        currency: account.currency || 'EUR',
      })
      .select()
      .single()

    if (createError) throw createError

    setAccounts((prev) => [data, ...prev])
    return data
  }

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const { data, error: updateError } = await supabase
      .from('accounts')
      .update({
        name: updates.name,
        type: updates.type,
        balance: updates.balance,
        currency: updates.currency,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    setAccounts((prev) => prev.map((acc) => (acc.id === id ? data : acc)))
    return data
  }

  const deleteAccount = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    setAccounts((prev) => prev.filter((acc) => acc.id !== id))
  }

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0)
  }

  useEffect(() => {
    fetchAccounts()
  }, [user])

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    getTotalBalance,
    refresh: fetchAccounts,
  }
}
