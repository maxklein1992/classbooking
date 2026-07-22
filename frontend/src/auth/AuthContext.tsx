import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getMe, login as apiLogin, register as apiRegister } from '../api/auth'
import {
  updateAvatar as apiUpdateAvatar,
  removeAvatar as apiRemoveAvatar,
} from '../api/users'
import { clearToken, getToken, setToken } from '../api/client'
import type { LoginPayload, RegisterPayload, User } from '../api/types'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  isTrainer: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  updateAvatar: (avatarUrl: string) => Promise<User>
  removeAvatar: () => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(getToken())
  const [loading, setLoading] = useState<boolean>(!!getToken())

  // Load current user on mount if a token exists.
  useEffect(() => {
    let active = true
    const existing = getToken()
    if (!existing) {
      setLoading(false)
      return
    }
    getMe()
      .then((me) => {
        if (active) setUser(me)
      })
      .catch(() => {
        if (active) {
          clearToken()
          setTokenState(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function login(payload: LoginPayload): Promise<User> {
    const res = await apiLogin(payload)
    setToken(res.accessToken)
    setTokenState(res.accessToken)
    setUser(res.user)
    return res.user
  }

  async function register(payload: RegisterPayload): Promise<User> {
    const res = await apiRegister(payload)
    setToken(res.accessToken)
    setTokenState(res.accessToken)
    setUser(res.user)
    return res.user
  }

  async function updateAvatar(avatarUrl: string): Promise<User> {
    const updated = await apiUpdateAvatar(avatarUrl)
    setUser(updated)
    return updated
  }

  async function removeAvatar(): Promise<User> {
    const updated = await apiRemoveAvatar()
    setUser(updated)
    return updated
  }

  function logout(): void {
    clearToken()
    setTokenState(null)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      isTrainer: user?.role === 'TRAINER',
      login,
      register,
      updateAvatar,
      removeAvatar,
      logout,
    }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
