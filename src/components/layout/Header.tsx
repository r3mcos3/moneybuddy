import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

export function Header({ darkMode, onToggleDarkMode }: HeaderProps) {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">MoneyBuddy</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Welkom terug, {user?.user_metadata?.full_name || user?.email}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleDarkMode}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors font-semibold"
        >
          Uitloggen
        </button>
      </div>
    </header>
  )
}
