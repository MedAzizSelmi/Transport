"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Car, Users, MapPin, Settings, LogOut, User, Home, Search, Plus, Star } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, logout } = useAuth()
    const pathname = usePathname()

    if (!user) return null

    // Dynamic navigation based on user type
    const getNavigation = () => {
        const baseNav = [
            { name: "Tableau de bord", href: "/dashboard", icon: Home },
            { name: "Communautés", href: "/communities", icon: Users },
        ]

        if (user.user_type === "driver" || user.user_type === "both") {
            baseNav.push(
                { name: "Créer un trajet", href: "/trips/create", icon: Plus },
                { name: "Mes trajets", href: "/trips/my-trips", icon: Car },
                { name: "Mes véhicules", href: "/vehicles", icon: Car },
            )
        }

        if (user.user_type === "passenger" || user.user_type === "both") {
            baseNav.push(
                { name: "Rechercher trajets", href: "/trips", icon: Search },
                { name: "Mes réservations", href: "/bookings", icon: MapPin },
            )
        }

        baseNav.push(
            { name: "Mes évaluations", href: "/ratings", icon: Star },
            { name: "Profil", href: "/profile", icon: User },
        )

        return baseNav
    }

    const navigation = getNavigation()

    // User type badge color
    const getUserTypeBadge = () => {
        switch (user.user_type) {
            case "driver":
                return { text: "🚗 Conducteur", className: "bg-green-100 text-green-800 border-green-200" }
            case "passenger":
                return { text: "🎒 Passager", className: "bg-blue-100 text-blue-800 border-blue-200" }
            case "both":
                return { text: "🚗🎒 Mixte", className: "bg-purple-100 text-purple-800 border-purple-200" }
            default:
                return { text: "Utilisateur", className: "bg-gray-100 text-gray-800 border-gray-200" }
        }
    }

    const userBadge = getUserTypeBadge()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <Link href="/dashboard" className="flex items-center">
                                <Car className="h-8 w-8 text-green-600 mr-2" />
                                <span className="text-2xl font-bold text-gray-900">EcoMobility</span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* User type indicator */}
                            <Badge className={userBadge.className}>{userBadge.text}</Badge>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.username} />
                                            <AvatarFallback>
                                                {user.first_name[0]}
                                                {user.last_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {user.first_name} {user.last_name}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                            <div className="mt-1">
                                                <Badge className={`${userBadge.className} text-xs`}>{userBadge.text}</Badge>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profil</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Paramètres</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Déconnexion</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Dynamic Sidebar based on user type */}
                <nav className="w-64 bg-white shadow-sm min-h-screen">
                    <div className="p-4">
                        <ul className="space-y-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                                isActive
                                                    ? user.user_type === "driver"
                                                        ? "bg-green-100 text-green-700"
                                                        : user.user_type === "passenger"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-purple-100 text-purple-700"
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                                            )}
                                        >
                                            <item.icon className="mr-3 h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>

                        {/* Role-specific quick actions */}
                        <div className="mt-8 p-3 bg-gray-50 rounded-lg">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Actions rapides</h3>
                            <div className="space-y-2">
                                {(user.user_type === "driver" || user.user_type === "both") && (
                                    <Link href="/trips/create">
                                        <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-sm h-8">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Nouveau trajet
                                        </Button>
                                    </Link>
                                )}
                                {(user.user_type === "passenger" || user.user_type === "both") && (
                                    <Link href="/trips">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent text-sm h-8"
                                        >
                                            <Search className="mr-2 h-4 w-4" />
                                            Chercher trajet
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    )
}
