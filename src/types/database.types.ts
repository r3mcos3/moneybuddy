// Database types will be generated from Supabase schema
// For now, we define basic types manually

export interface Transaction {
  id: string
  user_id: string
  amount: number
  description: string
  category_id: string
  account_id: string
  transaction_date: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon?: string
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'cash'
  balance: number
  currency: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  currency: string
  created_at: string
  updated_at: string
}

export interface RecurringTransaction {
  id: string
  user_id: string
  account_id: string
  category_id: string
  description: string
  amount: number
  frequency: 'weekly' | 'every_4_weeks' | 'monthly' | 'yearly'
  start_date: string
  last_processed_date?: string
  next_due_date: string
  active: boolean
  created_at: string
  updated_at: string
}
