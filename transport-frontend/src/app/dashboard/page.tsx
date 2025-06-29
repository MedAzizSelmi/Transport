"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useCommunities, useMyTrips } from "@/hooks/useApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Car, MapPin, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

interface DashboardStats {
    my_communities: number
    my_trips_as_driver: number
    my_trips_as_passenger: number
    upcoming_trips: number
}

interface RecentTrip {
    id: number
    departure_location: string
    arrival_location: string
    departure_time: string
    status: string
    is_driver: boolean
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">
                        Bonjour, {user.first_name} {user.last_name} !
                    </h1>
                    <p className="text-green-100">Bienvenue sur votre tableau de bord EcoMobility</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Mes Communautés</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.my_communities || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Trajets Conduits</CardTitle>
                            <Car className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.my_trips_as_driver || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Trajets Passager</CardTitle>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.my_trips_as_passenger || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Trajets à Venir</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.upcoming_trips || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions Rapides</CardTitle>
                        <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/trips/create">
                                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                                    <Plus className="h-6 w-6" />
                                    <span>Créer un trajet</span>
                                </Button>
                            </Link>

                            <Link href="/trips">
                                <Button
                                    variant="outline"
                                    className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                                >
                                    <MapPin className="h-6 w-6" />
                                    <span>Rechercher trajets</span>
                                </Button>
                            </Link>

                            <Link href="/communities">
                                <Button
                                    variant="outline"
                                    className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                                >
                                    <Users className="h-6 w-6" />
                                    <span>Rejoindre communauté</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Trips */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trajets Récents</CardTitle>
                        <CardDescription>Vos derniers trajets et réservations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentTrips.length > 0 ? (
                            <div className="space-y-4">
                                {recentTrips.map((trip: RecentTrip) => (
                                    <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                {trip.is_driver ? (
                                                    <Car className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <MapPin className="h-5 w-5 text-blue-600" />
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
                                            <Badge variant="outline">{trip.is_driver ? "Conducteur" : "Passager"}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>Aucun trajet récent</p>
                                <p className="text-sm">Créez votre premier trajet ou rejoignez une communauté</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
