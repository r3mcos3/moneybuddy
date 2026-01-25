import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Budget } from '../types/database.types'
import { useAuth } from '../contexts/AuthContext'

export function useBudgets() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setBudgets(data || [])
    }

    setLoading(false)
  }

  const createBudget = async (budget: Partial<Budget>) => {
    if (!user) throw new Error('User not authenticated')

    const { data, error: createError } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id: budget.category_id!,
        amount: budget.amount!,
        period: budget.period || 'monthly',
        start_date: budget.start_date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (createError) throw createError

    setBudgets((prev) => [data, ...prev])
    return data
  }

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const { data, error: updateError } = await supabase
      .from('budgets')
      .update({
        category_id: updates.category_id,
        amount: updates.amount,
        period: updates.period,
        start_date: updates.start_date,
        end_date: updates.end_date,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    setBudgets((prev) => prev.map((b) => (b.id === id ? data : b)))
    return data
  }

  const deleteBudget = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  const getBudgetSpending = async (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId)
    if (!budget || !user) return 0

    const endDate = budget.end_date ? new Date(budget.end_date) : new Date()

    const { data } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('category_id', budget.category_id)
      .gte('transaction_date', budget.start_date)
      .lte('transaction_date', endDate.toISOString().split('T')[0])
      .lt('amount', 0) // Only expenses

    const total = data?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
    return total
  }

  useEffect(() => {
    fetchBudgets()
  }, [user])

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetSpending,
    refresh: fetchBudgets,
  }
}
