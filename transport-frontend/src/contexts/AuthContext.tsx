"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { api } from "@/lib/api"
import Cookies from "js-cookie"

interface User {
    id: number
    email: string
    username: string
    first_name: string
    last_name: string
    phone: string
    user_type: "driver" | "passenger" | "both"
    profile_picture?: string
    bio: string
    is_verified: boolean
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<void>
    register: (userData: any) => Promise<void>
    logout: () => void
    loading: boolean
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const isAuthenticated = !!user

    useEffect(() => {
        const token = Cookies.get("access_token")
        if (token) {
            fetchUser()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchUser = async () => {
        try {
            const response = await api.get("/auth/profile/")
            setUser(response.data)
        } catch (error) {
            console.error("Error fetching user:", error)
            Cookies.remove("access_token")
            Cookies.remove("refresh_token")
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post("/auth/login/", { email, password })
            const { user, access, refresh } = response.data

            Cookies.set("access_token", access, { expires: 1 })
            Cookies.set("refresh_token", refresh, { expires: 7 })

            setUser(user)
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur de connexion")
        }
    }

    const register = async (userData: any) => {
        try {
            const response = await api.post("/auth/register/", userData)
            const { user, access, refresh } = response.data

            Cookies.set("access_token", access, { expires: 1 })
            Cookies.set("refresh_token", refresh, { expires: 7 })

            setUser(user)
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur d'inscription")
        }
    }

    const logout = () => {
        Cookies.remove("access_token")
        Cookies.remove("refresh_token")
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                loading,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
