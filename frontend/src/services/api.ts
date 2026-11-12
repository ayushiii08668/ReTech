import axios from "axios"

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
})

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("retech_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response
      // Only redirect on genuine 401 Unauthorized if not already on an auth page
      if (
        status === 401 &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/admin/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        let isAdmin = false
        try {
          const savedUser = localStorage.getItem("retech_user")
          if (savedUser) isAdmin = JSON.parse(savedUser)?.role === "ADMIN"
        } catch {}
        localStorage.removeItem("retech_token")
        localStorage.removeItem("retech_user")
        window.location.href = isAdmin || window.location.pathname.startsWith("/admin") ? "/admin/login" : "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api
