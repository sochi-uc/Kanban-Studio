import { useEffect, useState } from 'react'
import { api, setUnauthorizedHandler } from './api/client'
import AuthScreen from './features/auth/AuthScreen'
import Workspace from './features/shell/Workspace'
import { useTheme } from './hooks/useTheme'
import { Spinner } from './ui/Bits'

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = checking session, null = signed out
  const [theme, setTheme] = useTheme()

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null)) // any 401 (expired cookie, lockout) returns to sign-in
    api.me().then(setUser, () => setUser(null))
  }, [])

  if (user === undefined) {
    return (
      <div className="splash">
        <div className="wallpaper" aria-hidden="true" />
        <Spinner label="Checking session" />
      </div>
    )
  }

  if (!user) return <AuthScreen onAuthenticated={setUser} />

  return (
    <Workspace
      user={user}
      theme={theme}
      onTheme={setTheme}
      onSignOut={async () => {
        await api.logout().catch(() => {})
        setUser(null)
      }}
    />
  )
}
