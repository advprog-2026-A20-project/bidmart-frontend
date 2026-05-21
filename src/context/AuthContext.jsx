import { createContext, useCallback, useMemo, useState } from 'react'
import client from '../api/client.js'

export const AuthContext = createContext(null)

const readStoredToken = () => {
  return localStorage.getItem('accessToken') || ''
}

const readStoredUser = () => {
  const raw = localStorage.getItem('user')
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(readStoredToken)
  const [user, setUser] = useState(readStoredUser)

  const applyToken = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)

    if (nextToken) {
      localStorage.setItem('accessToken', nextToken)
      client.defaults.headers.common.Authorization = `Bearer ${nextToken}`
    } else {
      localStorage.removeItem('accessToken')
      delete client.defaults.headers.common.Authorization
    }

    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser))
    } else {
      localStorage.removeItem('user')
    }
  }, [])

  const updateUser = useCallback((nextUserOrUpdater) => {
    setUser((currentUser) => {
      const nextUser = typeof nextUserOrUpdater === 'function'
        ? nextUserOrUpdater(currentUser)
        : nextUserOrUpdater

      if (nextUser) {
        localStorage.setItem('user', JSON.stringify(nextUser))
      } else {
        localStorage.removeItem('user')
      }

      return nextUser
    })
  }, [])

  const logout = useCallback(() => {
    applyToken('', null)
  }, [applyToken])

  const value = useMemo(() => ({
    token,
    user,
    setAuth: applyToken,
    updateUser,
    logout,
  }), [token, user, applyToken, updateUser, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
