import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Category } from '../types/database.types'
import { useAuth } from '../contexts/AuthContext'

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('type', { ascending: false }) // income first
      .order('name', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCategories(data || [])
    }

    setLoading(false)
  }

  const getIncomeCategories = () => {
    return categories.filter((cat) => cat.type === 'income')
  }

  const getExpenseCategories = () => {
    return categories.filter((cat) => cat.type === 'expense')
  }

  const getCategoryById = (id: string) => {
    return categories.find((cat) => cat.id === id)
  }

  useEffect(() => {
    fetchCategories()
  }, [user])

  return {
    categories,
    loading,
    error,
    getIncomeCategories,
    getExpenseCategories,
    getCategoryById,
    refresh: fetchCategories,
  }
}
