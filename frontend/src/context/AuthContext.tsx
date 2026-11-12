import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "@/services/api"
import { IUser } from "@/types"

interface AuthContextType {
  user: IUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>
  register: (data: any) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  updateUser: (updatedUser: IUser) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    try {
      const savedUser = localStorage.getItem("retech_user")
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("retech_token")
  })
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // If token and user already exist in local cache, do not block or reset session
    const savedToken = localStorage.getItem("retech_token")
    const savedUser = localStorage.getItem("retech_user")
    return !savedToken || !savedUser
  })

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem("retech_token")
    if (!savedToken) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const res = await api.get("/auth/me")
      const userData = res.data?.user || res.data?.data?.user
      if (res.data?.success && userData) {
        setUser(userData)
        localStorage.setItem("retech_user", JSON.stringify(userData))
      }
    } catch (err: any) {
      // ONLY clear session if server explicitly rejects with 401 Unauthorized
      if (err?.response?.status === 401) {
        console.warn("Session expired or rejected (401). Clearing auth session.")
        localStorage.removeItem("retech_token")
        localStorage.removeItem("retech_user")
        setUser(null)
        setToken(null)
      } else {
        console.warn("Network latency or server delay during user sync. Preserving local session:", err?.message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const res = await api.post("/auth/login", { email, password, rememberMe })
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data
        setToken(receivedToken)
        setUser(receivedUser)
        localStorage.setItem("retech_token", receivedToken)
        localStorage.setItem("retech_user", JSON.stringify(receivedUser))
        return { success: true, user: receivedUser }
      }
      return { success: false, message: res.data.message || "Login failed" }
    } catch (err: any) {
      if (err.code === "ERR_NETWORK" || !err.response) {
        return {
          success: false,
          message: "Cannot connect to ReTech backend server. Please check your network connection, CORS configuration, or backend status.",
        }
      }
      const message = err.response?.data?.message || err.response?.data?.error || "Invalid credentials"
      return { success: false, message }
    }
  }

  const register = async (data: any) => {
    try {
      const res = await api.post("/auth/register", data)
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data
        setToken(receivedToken)
        setUser(receivedUser)
        localStorage.setItem("retech_token", receivedToken)
        localStorage.setItem("retech_user", JSON.stringify(receivedUser))
        return { success: true, user: receivedUser }
      }
      return { success: false, message: res.data.message || "Registration failed" }
    } catch (err: any) {
      if (err.code === "ERR_NETWORK" || !err.response) {
        return {
          success: false,
          message: "Cannot connect to ReTech backend server. Please check your network connection, CORS configuration, or backend status.",
        }
      }
      const message = err.response?.data?.message || err.response?.data?.error || "Registration failed. Please check your information."
      return { success: false, message }
    }
  }

  const logout = () => {
    try {
      api.post("/auth/logout").catch(() => {})
    } finally {
      localStorage.removeItem("retech_token")
      localStorage.removeItem("retech_user")
      setToken(null)
      setUser(null)
      window.location.href = "/"
    }
  }

  const updateUser = (updatedUser: IUser) => {
    setUser(updatedUser)
    localStorage.setItem("retech_user", JSON.stringify(updatedUser))
  }

  const isAuthenticated = !!token && !!user
  const isAdmin = user?.role === "ADMIN"

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

