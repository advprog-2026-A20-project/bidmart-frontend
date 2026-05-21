import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth.js'
import useAuth from '../hooks/useAuth.js'
import { routes } from '../router/routes.js'

const EMAIL_NOT_REGISTERED_MESSAGE = 'Email tidak terdaftar.'
const INVALID_CREDENTIALS_MESSAGE = 'Email atau password salah.'
const LOGIN_FAILED_MESSAGE = 'Login gagal. Silakan coba lagi.'

const extractBackendMessage = (payload) => {
  if (!payload) {
    return ''
  }
  if (typeof payload === 'string') {
    return payload
  }
  if (typeof payload.message === 'string') {
    return payload.message
  }
  return ''
}

const resolveLoginErrorMessage = (err) => {
  const status = err?.response?.status
  const rawMessage = extractBackendMessage(err?.response?.data).toLowerCase()

  if (status === 404 || rawMessage.includes('email not registered')) {
    return EMAIL_NOT_REGISTERED_MESSAGE
  }

  if (
    status === 401
    || rawMessage.includes('invalid credentials')
    || rawMessage.includes('bad credentials')
  ) {
    return INVALID_CREDENTIALS_MESSAGE
  }

  return LOGIN_FAILED_MESSAGE
}

const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const data = await login(email, password)
      setAuth(data.accessToken, data.user)
      navigate(routes.listings)
    } catch (err) {
      setError(resolveLoginErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  )
}

export default LoginPage
