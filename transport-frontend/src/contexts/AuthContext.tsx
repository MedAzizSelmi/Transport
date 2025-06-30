"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    phone: string
    user_type: "driver" | "passenger" | "both"
    is_verified: boolean
    rating: number
    created_at: string
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<void>
    register: (userData: any) => Promise<void>
    logout: () => void
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem("token")
        if (token) {
            // Validate token and get user data
            fetchUser(token)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchUser = async (token: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                localStorage.removeItem("token")
            }
        } catch (error) {
            console.error("Error fetching user:", error)
            localStorage.removeItem("token")
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || "Login failed")
        }

        const data = await response.json()
        localStorage.setItem("token", data.access)
        setUser(data.user)
    }

    const register = async (userData: any) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || "Registration failed")
        }

        const data = await response.json()
        localStorage.setItem("token", data.access)
        setUser(data.user)
    }

    const logout = () => {
        localStorage.removeItem("token")
        setUser(null)
        router.push("/")
    }

    return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
