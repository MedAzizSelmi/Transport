import axios from "axios"
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("access_token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = Cookies.get("refresh_token")
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    })

                    const { access } = response.data
                    Cookies.set("access_token", access, { expires: 1 })

                    originalRequest.headers.Authorization = `Bearer ${access}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                Cookies.remove("access_token")
                Cookies.remove("refresh_token")
                window.location.href = "/login"
            }
        }

        return Promise.reject(error)
    },
)
