import { useState } from 'react'
import { api } from '../../api/client'
import Icon, { BrandMark } from '../../ui/Icon'

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const isRegister = mode === 'register'

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const user = isRegister
        ? await api.register(form.email, form.password, form.displayName)
        : await api.login(form.email, form.password)
      onAuthenticated(user)
    } catch (err) {
      setError(err.message)
      setForm((f) => ({ ...f, password: '' })) // never keep a rejected password around
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="wallpaper" aria-hidden="true" />
      <main className="auth-card glass">
        <div className="auth-mark">
          <BrandMark size={56} />
        </div>
        <h1 className="auth-title">Kanban Studio</h1>
        <p className="auth-sub">{isRegister ? 'Create your workspace' : 'Sign in to your board'}</p>

        <form className="auth-form" onSubmit={submit} noValidate={false}>
          {isRegister && (
            <label className="field">
              <span className="field-label">Name</span>
              <input
                className="input"
                autoComplete="name"
                required
                maxLength={60}
                value={form.displayName}
                onChange={set('displayName')}
              />
            </label>
          )}
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={form.email}
              onChange={set('email')}
            />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={isRegister ? 12 : undefined}
              maxLength={128}
              value={form.password}
              onChange={set('password')}
              aria-describedby={isRegister ? 'pw-hint' : undefined}
            />
            {isRegister && (
              <span id="pw-hint" className="field-hint">
                At least 12 characters. A passphrase works well.
              </span>
            )}
          </label>

          {error && (
            <p className="form-error" role="alert">
              <Icon name="alert" size={14} /> {error}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block btn--lg" aria-busy={busy}>
            {isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode(isRegister ? 'login' : 'register')
              setError(null)
            }}
          >
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </main>
    </div>
  )
}
