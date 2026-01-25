import { supabase } from './supabase'

export async function seedMockData(userId: string) {
  try {
    console.log('🌱 Starting to seed mock data...')

    // 1. Create mock accounts
    console.log('Creating accounts...')
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .insert([
        {
          user_id: userId,
          name: 'Main Checking',
          type: 'checking',
          balance: 2500.00,
          currency: 'EUR',
        },
        {
          user_id: userId,
          name: 'Savings Account',
          type: 'savings',
          balance: 8750.50,
          currency: 'EUR',
        },
        {
          user_id: userId,
          name: 'Credit Card',
          type: 'credit',
          balance: -450.25,
          currency: 'EUR',
        },
        {
          user_id: userId,
          name: 'Cash Wallet',
          type: 'cash',
          balance: 125.00,
          currency: 'EUR',
        },
      ])
      .select()

    if (accountsError) throw accountsError
    console.log(`✅ Created ${accounts.length} accounts`)

    // 2. Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)

    if (!categories || categories.length === 0) {
      throw new Error('No categories found. Please ensure default categories were created.')
    }

    const expenseCategories = categories.filter(c => c.type === 'expense')
    const incomeCategories = categories.filter(c => c.type === 'income')

    // 3. Create mock transactions
    console.log('Creating transactions...')
    const transactions = []
    const today = new Date()

    // Last 30 days of transactions
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      // 2-4 transactions per day
      const numTransactions = Math.floor(Math.random() * 3) + 2

      for (let j = 0; j < numTransactions; j++) {
        const isIncome = Math.random() < 0.2 // 20% chance of income

        if (isIncome && incomeCategories.length > 0) {
          // Income transaction
          const category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
          const amount = Math.random() * 2000 + 500 // 500-2500

          transactions.push({
            user_id: userId,
            account_id: accounts[0].id, // Main checking
            category_id: category.id,
            amount: parseFloat(amount.toFixed(2)),
            description: getIncomeDescription(category.name),
            transaction_date: dateStr,
          })
        } else if (expenseCategories.length > 0) {
          // Expense transaction
          const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
          const amount = getExpenseAmount(category.name)
          const accountIndex = Math.floor(Math.random() * accounts.length)

          transactions.push({
            user_id: userId,
            account_id: accounts[accountIndex].id,
            category_id: category.id,
            amount: -parseFloat(amount.toFixed(2)),
            description: getExpenseDescription(category.name),
            transaction_date: dateStr,
          })
        }
      }
    }

    const { data: createdTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .insert(transactions)
      .select()

    if (transactionsError) throw transactionsError
    console.log(`✅ Created ${createdTransactions.length} transactions`)

    // Update account balances based on transactions
    console.log('Updating account balances...')
    for (const account of accounts) {
      const accountTransactions = createdTransactions.filter(t => t.account_id === account.id)
      const totalChange = accountTransactions.reduce((sum, t) => sum + t.amount, 0)
      const newBalance = account.balance + totalChange

      await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', account.id)
    }
    console.log(`✅ Updated account balances`)

    // 4. Create mock budgets
    console.log('Creating budgets...')
    const budgets = []

    // Create budgets for major expense categories
    const budgetCategories = ['Boodschappen', 'Restaurants', 'Vervoer', 'Winkelen', 'Entertainment', 'Nutsvoorzieningen']

    for (const categoryName of budgetCategories) {
      const category = expenseCategories.find(c => c.name === categoryName)
      if (category) {
        budgets.push({
          user_id: userId,
          category_id: category.id,
          amount: getBudgetAmount(categoryName),
          period: 'monthly',
          start_date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
        })
      }
    }

    const { data: createdBudgets, error: budgetsError } = await supabase
      .from('budgets')
      .insert(budgets)
      .select()

    if (budgetsError) throw budgetsError
    console.log(`✅ Created ${createdBudgets.length} budgets`)

    console.log('🎉 Mock data seeding complete!')

    return {
      success: true,
      accounts: accounts.length,
      transactions: createdTransactions.length,
      budgets: createdBudgets.length,
    }
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  }
}

function getExpenseAmount(categoryName: string): number {
  const ranges: Record<string, [number, number]> = {
    'Boodschappen': [20, 150],
    'Restaurants': [15, 80],
    'Vervoer': [5, 50],
    'Winkelen': [20, 200],
    'Entertainment': [10, 100],
    'Nutsvoorzieningen': [50, 150],
    'Huisvesting': [500, 1500],
    'Gezondheidszorg': [30, 300],
    'Verzekeringen': [50, 200],
    'Overig': [10, 100],
    'Huur': [500, 1500],
    'Energie': [50, 150],
    'Internet & TV': [30, 80],
    'Abonnementen': [10, 50],
    'Brandstof': [40, 120],
  }

  const [min, max] = ranges[categoryName] || [10, 100]
  return Math.random() * (max - min) + min
}

function getBudgetAmount(categoryName: string): number {
  const amounts: Record<string, number> = {
    'Boodschappen': 500,
    'Restaurants': 300,
    'Vervoer': 200,
    'Winkelen': 250,
    'Entertainment': 150,
    'Nutsvoorzieningen': 200,
  }

  return amounts[categoryName] || 200
}

function getExpenseDescription(categoryName: string): string {
  const descriptions: Record<string, string[]> = {
    'Boodschappen': ['Albert Heijn', 'Jumbo', 'Lidl', 'Aldi', 'Plus Supermarkt', 'Weekboodschappen'],
    'Restaurants': ['Pizza bezorging', 'Lunch bij café', 'Diner centrum', 'Koffiebar', 'Sushi restaurant', 'Fastfood'],
    'Vervoer': ['Tankstation', 'OV', 'Parkeren', 'Uber rit', 'Treinkaartje', 'Fietsreparatie'],
    'Winkelen': ['Amazon bestelling', 'Bol.com', 'Kledingwinkel', 'Electronicawinkel', 'Boekhandel', 'Online shopping'],
    'Entertainment': ['Netflix', 'Spotify', 'Bioscoop', 'Concert', 'Gaming', 'Museum'],
    'Nutsvoorzieningen': ['Elektriciteit', 'Water', 'Internet', 'Telefoon', 'Gas'],
    'Huisvesting': ['Huur', 'Hypotheek', 'Onderhoud huis', 'Meubels'],
    'Gezondheidszorg': ['Apotheek', 'Huisarts', 'Tandarts', 'Vitamines', 'Medische hulpmiddelen'],
    'Verzekeringen': ['Zorgverzekering', 'Autoverzekering', 'Woonverzekering'],
    'Overig': ['Diverse', 'Overige uitgaven', 'Anders'],
    'Huur': ['Maandelijkse huur', 'Huur betaling'],
    'Energie': ['Energierekening', 'Gas en licht'],
    'Internet & TV': ['Ziggo', 'KPN', 'Internet abonnement'],
    'Abonnementen': ['Spotify', 'Netflix', 'Disney+', 'Gym abonnement'],
    'Brandstof': ['Shell', 'Esso', 'BP', 'Tanken'],
  }

  const options = descriptions[categoryName] || ['Uitgave']
  return options[Math.floor(Math.random() * options.length)]
}

function getIncomeDescription(categoryName: string): string {
  const descriptions: Record<string, string[]> = {
    'Salaris': ['Maandsalaris', 'Loonbetaling', 'Salaris storting'],
    'Freelance': ['Freelance project', 'Klant betaling', 'Adviesvergoeding'],
    'Investeringen': ['Dividend', 'Aandelen winst', 'Investering opbrengst'],
    'Overig Inkomen': ['Bonus', 'Cadeau', 'Terugbetaling', 'Bijverdienste'],
  }

  const options = descriptions[categoryName] || ['Inkomen']
  return options[Math.floor(Math.random() * options.length)]
}

export async function clearAllData(userId: string) {
  try {
    console.log('🗑️ Clearing all data...')

    // Delete in order due to foreign key constraints
    await supabase.from('budgets').delete().eq('user_id', userId)
    await supabase.from('transactions').delete().eq('user_id', userId)
    await supabase.from('accounts').delete().eq('user_id', userId)

    console.log('✅ All data cleared')
    return { success: true }
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    throw error
  }
}
