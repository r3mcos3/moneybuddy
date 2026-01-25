import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './components/auth/Login'
import { Signup } from './components/auth/Signup'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Dashboard } from './components/Dashboard'

function AuthFlow() {
  const [isLogin, setIsLogin] = useState(true)
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return isLogin ? (
      <Login onToggleMode={() => setIsLogin(false)} />
    ) : (
      <Signup onToggleMode={() => setIsLogin(true)} />
    )
  }

  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthFlow />
    </AuthProvider>
  )
}

export default App
