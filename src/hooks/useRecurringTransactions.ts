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
    dayOfMonth: number
  ) => {
    if (!user) return

    try {
      // Use current date as start_date for reference
      const now = new Date()
      const startDate = now.toISOString().split('T')[0]

      // Calculate next due date based on day of month
      let nextDue = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)

      // If the day has passed this month, move to next month
      if (nextDue <= now) {
        nextDue.setMonth(nextDue.getMonth() + 1)
      }

      const { error } = await supabase.from('recurring_transactions').insert({
        user_id: user.id,
        account_id: accountId,
        category_id: categoryId,
        description,
        amount,
        frequency,
        day_of_month: dayOfMonth,
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

  const processSingleRecurring = async (recurringId: string) => {
    if (!user) return { success: false, error: 'No user' }

    try {
      // Find the recurring transaction
      const recurring = recurringTransactions.find(rt => rt.id === recurringId)
      if (!recurring) {
        return { success: false, error: 'Transaction not found' }
      }

      // Check if day_of_month exists
      if (!recurring.day_of_month) {
        return {
          success: false,
          error: 'Deze transactie heeft geen dag van de maand ingesteld. Bewerk de transactie om een dag in te stellen.'
        }
      }

      // Calculate transaction date based on day_of_month
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()

      // Get the last day of the current month
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate()

      // Use the day_of_month or the last day if day_of_month doesn't exist
      const dayToUse = Math.min(recurring.day_of_month, lastDayOfMonth)
      const transactionDate = new Date(year, month, dayToUse)

      // Create the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: recurring.account_id,
          category_id: recurring.category_id,
          description: recurring.description,
          amount: recurring.amount,
          transaction_date: transactionDate.toISOString().split('T')[0],
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Update the recurring transaction
      const nextDueDate = new Date(transactionDate)
      switch (recurring.frequency) {
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 7)
          break
        case 'every_4_weeks':
          nextDueDate.setDate(nextDueDate.getDate() + 28)
          break
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1)
          break
        case 'yearly':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
          break
      }

      const { error: updateError } = await supabase
        .from('recurring_transactions')
        .update({
          last_processed_date: transactionDate.toISOString().split('T')[0],
          next_due_date: nextDueDate.toISOString().split('T')[0],
        })
        .eq('id', recurringId)

      if (updateError) throw updateError

      await fetchRecurringTransactions()
      return { success: true, transaction }
    } catch (error) {
      console.error('Error processing single recurring transaction:', error)
      return { success: false, error }
    }
  }

  const getDueCount = () => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    return recurringTransactions.filter((rt) => {
      if (!rt.active) return false

      // Check if not processed yet this month
      if (!rt.last_processed_date) return true

      const lastProcessed = new Date(rt.last_processed_date)
      const lastProcessedMonth = `${lastProcessed.getFullYear()}-${String(lastProcessed.getMonth() + 1).padStart(2, '0')}`

      // Due if not processed this month yet
      return lastProcessedMonth < currentMonth
    }).length
  }

  return {
    recurringTransactions,
    loading,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    processRecurringTransactions,
    processSingleRecurring,
    getDueCount,
    refresh: fetchRecurringTransactions,
  }
}
