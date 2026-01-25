import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { RecurringTransaction } from '../types/database.types'
import { useAuth } from '../contexts/AuthContext'

export function useRecurringTransactions() {
  const { user } = useAuth()
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecurringTransactions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_due_date', { ascending: true })

      if (error) throw error
      setRecurringTransactions(data || [])
    } catch (error) {
      console.error('Error fetching recurring transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecurringTransactions()
  }, [user])

  const addRecurringTransaction = async (
    accountId: string,
    categoryId: string,
    description: string,
    amount: number,
    frequency: 'weekly' | 'every_4_weeks' | 'monthly' | 'yearly',
    startDate: string
  ) => {
    if (!user) return

    try {
      // Calculate next due date based on frequency
      const start = new Date(startDate)
      let nextDue = new Date(start)

      switch (frequency) {
        case 'weekly':
          nextDue.setDate(nextDue.getDate() + 7)
          break
        case 'every_4_weeks':
          nextDue.setDate(nextDue.getDate() + 28)
          break
        case 'monthly':
          nextDue.setMonth(nextDue.getMonth() + 1)
          break
        case 'yearly':
          nextDue.setFullYear(nextDue.getFullYear() + 1)
          break
      }

      const { error } = await supabase.from('recurring_transactions').insert({
        user_id: user.id,
        account_id: accountId,
        category_id: categoryId,
        description,
        amount,
        frequency,
        start_date: startDate,
        next_due_date: nextDue.toISOString().split('T')[0],
        active: true,
      })

      if (error) throw error
      await fetchRecurringTransactions()
    } catch (error) {
      console.error('Error adding recurring transaction:', error)
      throw error
    }
  }

  const updateRecurringTransaction = async (
    id: string,
    updates: {
      description?: string
      amount?: number
      frequency?: 'weekly' | 'every_4_weeks' | 'monthly' | 'yearly'
      active?: boolean
      account_id?: string
      category_id?: string
    }
  ) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchRecurringTransactions()
    } catch (error) {
      console.error('Error updating recurring transaction:', error)
      throw error
    }
  }

  const deleteRecurringTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchRecurringTransactions()
    } catch (error) {
      console.error('Error deleting recurring transaction:', error)
      throw error
    }
  }

  const processRecurringTransactions = async (processDate?: string) => {
    if (!user) return { success: false, count: 0, error: 'No user' }

    try {
      const { data, error } = await supabase.rpc('process_recurring_transactions', {
        p_user_id: user.id,
        p_process_date: processDate || new Date().toISOString().split('T')[0],
      })

      if (error) throw error

      await fetchRecurringTransactions()
      return { success: true, count: data?.length || 0, data }
    } catch (error) {
      console.error('Error processing recurring transactions:', error)
      return { success: false, count: 0, error }
    }
  }

  const getDueCount = () => {
    const today = new Date().toISOString().split('T')[0]
    return recurringTransactions.filter(
      (rt) => rt.active && rt.next_due_date <= today
    ).length
  }

  return {
    recurringTransactions,
    loading,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    processRecurringTransactions,
    getDueCount,
    refresh: fetchRecurringTransactions,
  }
}
