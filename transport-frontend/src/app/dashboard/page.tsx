"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useCommunities, useMyTrips } from "@/hooks/useApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Car, MapPin, Calendar, Plus, Search, Star } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

interface DashboardStats {
    my_communities: number
    my_trips_as_driver: number
    my_trips_as_passenger: number
    upcoming_trips: number
    total_earnings?: number
    total_spent?: number
    average_rating?: number
}

interface RecentTrip {
    id: number
    departure_location: string
    arrival_location: string
    departure_time: string
    status: string
    is_driver: boolean
    price_per_seat?: number
    available_seats?: number
    remaining_seats?: number
}

interface StatCard {
    title: string
    value: string | number
    icon: React.ComponentType<{ className?: string }>
    color: string
}

export default function DashboardPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)

    // Use the new hooks
    const { data: communitiesData } = useCommunities()
    const { data: tripsData } = useMyTrips()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [user, loading, router])

    useEffect(() => {
        if (communitiesData && tripsData) {
            const communities = communitiesData.results || []
            const trips = tripsData.results || []

            const dashboardStats: DashboardStats = {
                my_communities: communities.filter((c: any) => c.is_member).length,
                my_trips_as_driver: trips.filter((t: any) => t.is_driver).length,
                my_trips_as_passenger: trips.filter((t: any) => !t.is_driver).length,
                upcoming_trips: trips.filter((t: any) => new Date(t.departure_time) > new Date() && t.status === "planned")
                    .length,
                // Calculate earnings for drivers
                total_earnings: trips
                    .filter((t: any) => t.is_driver && t.status === "completed")
                    .reduce(
                        (sum: number, trip: any) =>
                            sum + (Number(trip.price_per_seat) || 0) * ((trip.available_seats || 0) - (trip.remaining_seats || 0)),
                        0,
                    ),
                // Calculate spending for passengers
                total_spent: trips
                    .filter((t: any) => !t.is_driver && t.status === "completed")
                    .reduce((sum: number, trip: any) => sum + (Number(trip.price_per_seat) || 0), 0),
                average_rating: 4.5, // This would come from ratings API
            }

            setStats(dashboardStats)
        }
    }, [communitiesData, tripsData])

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            </DashboardLayout>
        )
    }

    if (!user) return null

    const recentTrips = tripsData?.results?.slice(0, 5) || []

    // Different welcome messages based on user type
    const getWelcomeMessage = () => {
        switch (user.user_type) {
            case "driver":
                return {
                    title: `Bonjour ${user.first_name}, conducteur EcoMobility !`,
                    subtitle: "Gérez vos trajets et gagnez de l'argent en partageant vos déplacements",
                }
            case "passenger":
                return {
                    title: `Bonjour ${user.first_name}, voyageur EcoMobility !`,
                    subtitle: "Trouvez des trajets économiques et écologiques près de chez vous",
                }
            case "both":
                return {
                    title: `Bonjour ${user.first_name}, membre EcoMobility !`,
                    subtitle: "Conduisez ou voyagez selon vos besoins",
                }
            default:
                return {
                    title: `Bonjour ${user.first_name} !`,
                    subtitle: "Bienvenue sur votre tableau de bord EcoMobility",
                }
        }
    }

    const welcomeMessage = getWelcomeMessage()

    // Different stats based on user type
    const renderStats = (): StatCard[] => {
        const baseStats: StatCard[] = [
            {
                title: "Mes Communautés",
                value: stats?.my_communities || 0,
                icon: Users,
                color: "text-blue-600",
            },
        ]

        if (user.user_type === "driver" || user.user_type === "both") {
            baseStats.push(
                {
                    title: "Trajets Conduits",
                    value: stats?.my_trips_as_driver || 0,
                    icon: Car,
                    color: "text-green-600",
                },
                {
                    title: "Gains Totaux",
                    value: `${(stats?.total_earnings || 0).toFixed(2)}€`,
                    icon: Calendar,
                    color: "text-emerald-600",
                },
                {
                    title: "Note Moyenne",
                    value: `${(stats?.average_rating || 0).toFixed(1)}/5`,
                    icon: Star,
                    color: "text-yellow-600",
                },
            )
        }

        if (user.user_type === "passenger" || user.user_type === "both") {
            baseStats.push({
                title: "Trajets Réservés",
                value: stats?.my_trips_as_passenger || 0,
                icon: MapPin,
                color: "text-purple-600",
            })

            if (user.user_type === "passenger") {
                baseStats.push(
                    {
                        title: "Dépenses Totales",
                        value: `${(stats?.total_spent || 0).toFixed(2)}€`,
                        icon: Calendar,
                        color: "text-red-600",
                    },
                    {
                        title: "Trajets à Venir",
                        value: stats?.upcoming_trips || 0,
                        icon: Calendar,
                        color: "text-indigo-600",
                    },
                )
            }
        }

        return baseStats
    }

    // Different quick actions based on user type
    const renderQuickActions = () => {
        const actions = []

        if (user.user_type === "driver" || user.user_type === "both") {
            actions.push(
                <Link key="create-trip" href="/trips/create">
                    <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700">
                        <Plus className="h-6 w-6" />
                        <span>Créer un trajet</span>
                    </Button>
                </Link>,
            )

            actions.push(
                <Link key="manage-vehicles" href="/vehicles">
                    <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                    >
                        <Car className="h-6 w-6" />
                        <span>Gérer mes véhicules</span>
                    </Button>
                </Link>,
            )
        }

        if (user.user_type === "passenger" || user.user_type === "both") {
            actions.push(
                <Link key="search-trips" href="/trips">
                    <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                    >
                        <Search className="h-6 w-6" />
                        <span>Rechercher trajets</span>
                    </Button>
                </Link>,
            )
        }

        actions.push(
            <Link key="communities" href="/communities">
                <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center space-y-2 border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
                >
                    <Users className="h-6 w-6" />
                    <span>Rejoindre communauté</span>
                </Button>
            </Link>,
        )

        return actions
    }

    const statsCards = renderStats()

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section - Different based on user type */}
                <div
                    className={`rounded-lg p-6 text-white ${
                        user.user_type === "driver"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600"
                            : user.user_type === "passenger"
                                ? "bg-gradient-to-r from-blue-600 to-purple-600"
                                : "bg-gradient-to-r from-green-600 to-blue-600"
                    }`}
                >
                    <h1 className="text-2xl font-bold mb-2">{welcomeMessage.title}</h1>
                    <p className="text-white/90">{welcomeMessage.subtitle}</p>

                    {/* User type badge */}
                    <div className="mt-3">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            {user.user_type === "driver" && "🚗 Conducteur"}
                            {user.user_type === "passenger" && "🎒 Passager"}
                            {user.user_type === "both" && "🚗🎒 Conducteur & Passager"}
                        </Badge>
                    </div>
                </div>

                {/* Dynamic Stats based on user type */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions - Different based on user type */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions Rapides</CardTitle>
                        <CardDescription>
                            {user.user_type === "driver" && "Gérez vos trajets et véhicules"}
                            {user.user_type === "passenger" && "Trouvez et réservez des trajets"}
                            {user.user_type === "both" && "Accédez à toutes les fonctionnalités"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{renderQuickActions()}</div>
                    </CardContent>
                </Card>

                {/* Recent Trips - Enhanced display */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {user.user_type === "driver" && "Mes Trajets Récents"}
                            {user.user_type === "passenger" && "Mes Réservations Récentes"}
                            {user.user_type === "both" && "Activité Récente"}
                        </CardTitle>
                        <CardDescription>
                            {user.user_type === "driver" && "Trajets que vous avez créés"}
                            {user.user_type === "passenger" && "Trajets que vous avez réservés"}
                            {user.user_type === "both" && "Vos trajets en tant que conducteur et passager"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentTrips.length > 0 ? (
                            <div className="space-y-4">
                                {recentTrips.map((trip: RecentTrip) => (
                                    <div
                                        key={trip.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                {trip.is_driver ? (
                                                    <div className="p-2 bg-green-100 rounded-full">
                                                        <Car className="h-5 w-5 text-green-600" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 bg-blue-100 rounded-full">
                                                        <MapPin className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {trip.departure_location} → {trip.arrival_location}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(trip.departure_time).toLocaleDateString("fr-FR", {
                                                        day: "numeric",
                                                        month: "long",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                                {trip.is_driver && trip.price_per_seat && (
                                                    <p className="text-sm text-green-600 font-medium">
                                                        {Number(trip.price_per_seat).toFixed(2)}€ par place
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={trip.status === "planned" ? "default" : "secondary"}>
                                                {trip.status === "planned"
                                                    ? "Planifié"
                                                    : trip.status === "completed"
                                                        ? "Terminé"
                                                        : trip.status === "cancelled"
                                                            ? "Annulé"
                                                            : trip.status}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={trip.is_driver ? "border-green-600 text-green-600" : "border-blue-600 text-blue-600"}
                                            >
                                                {trip.is_driver ? "Conducteur" : "Passager"}
                                            </Badge>
                                            {trip.is_driver && trip.remaining_seats !== undefined && (
                                                <Badge variant="secondary">{trip.remaining_seats} places restantes</Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    {user.user_type === "driver" ? (
                                        <Car className="h-8 w-8 text-gray-400" />
                                    ) : (
                                        <MapPin className="h-8 w-8 text-gray-400" />
                                    )}
                                </div>
                                <p className="font-medium">
                                    {user.user_type === "driver" && "Aucun trajet créé"}
                                    {user.user_type === "passenger" && "Aucune réservation"}
                                    {user.user_type === "both" && "Aucune activité récente"}
                                </p>
                                <p className="text-sm mt-1">
                                    {user.user_type === "driver" && "Créez votre premier trajet pour commencer"}
                                    {user.user_type === "passenger" && "Recherchez et réservez votre premier trajet"}
                                    {user.user_type === "both" && "Créez un trajet ou rejoignez une communauté"}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Role-specific tips */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="text-lg">💡 Conseils pour vous</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.user_type === "driver" && (
                            <div className="space-y-2">
                                <p className="text-sm">• Ajoutez vos véhicules pour créer des trajets</p>
                                <p className="text-sm">• Rejoignez des communautés pour trouver des passagers réguliers</p>
                                <p className="text-sm">• Maintenez une bonne note en étant ponctuel et courtois</p>
                            </div>
                        )}
                        {user.user_type === "passenger" && (
                            <div className="space-y-2">
                                <p className="text-sm">• Rejoignez des communautés pour accéder à plus de trajets</p>
                                <p className="text-sm">• Réservez à l'avance pour garantir votre place</p>
                                <p className="text-sm">• Évaluez vos conducteurs pour aider la communauté</p>
                            </div>
                        )}
                        {user.user_type === "both" && (
                            <div className="space-y-2">
                                <p className="text-sm">• Alternez entre conduire et voyager selon vos besoins</p>
                                <p className="text-sm">• Créez des trajets réguliers pour optimiser vos déplacements</p>
                                <p className="text-sm">• Utilisez les communautés pour organiser des trajets de groupe</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
