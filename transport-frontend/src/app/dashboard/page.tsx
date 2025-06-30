"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Car, Users, MapPin, Clock, Star, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"

interface StatCard {
    title: string
    value: string | number
    icon: React.ComponentType<any>
    color: string
    description?: string
}

export default function DashboardPage() {
    const { user } = useAuth()

    if (!user) {
        return null
    }

    const renderStats = (): StatCard[] => {
        const baseStats: StatCard[] = [
            {
                title: "Note moyenne",
                value: user.rating ? `${user.rating.toFixed(1)}/5` : "N/A",
                icon: Star,
                color: "text-yellow-600",
                description: "Votre réputation",
            },
        ]

        if (user.user_type === "driver" || user.user_type === "both") {
            return [
                ...baseStats,
                {
                    title: "Trajets créés",
                    value: 12,
                    icon: Car,
                    color: "text-blue-600",
                    description: "Ce mois-ci",
                },
                {
                    title: "Passagers transportés",
                    value: 45,
                    icon: Users,
                    color: "text-green-600",
                    description: "Total",
                },
                {
                    title: "Revenus",
                    value: "1,250.500 TND",
                    icon: TrendingUp,
                    color: "text-purple-600",
                    description: "Ce mois-ci",
                },
            ]
        } else {
            return [
                ...baseStats,
                {
                    title: "Trajets réservés",
                    value: 8,
                    icon: Calendar,
                    color: "text-blue-600",
                    description: "Ce mois-ci",
                },
                {
                    title: "Kilomètres parcourus",
                    value: "2,340 km",
                    icon: MapPin,
                    color: "text-green-600",
                    description: "Total",
                },
                {
                    title: "Économies",
                    value: "450.750 TND",
                    icon: TrendingUp,
                    color: "text-purple-600",
                    description: "Vs transport individuel",
                },
            ]
        }
    }

    const statsCards = renderStats()

    // Sample recent activities
    const recentActivities = [
        {
            id: 1,
            type: "booking",
            title: "Nouvelle réservation",
            description: "Ahmed Ben Ali a réservé votre trajet Tunis → Sousse",
            time: "Il y a 2 heures",
            icon: Calendar,
            color: "text-blue-600",
        },
        {
            id: 2,
            type: "rating",
            title: "Nouvelle évaluation",
            description: "Fatma Trabelsi vous a donné 5 étoiles",
            time: "Il y a 1 jour",
            icon: Star,
            color: "text-yellow-600",
        },
        {
            id: 3,
            type: "trip",
            title: "Trajet terminé",
            description: "Trajet Sfax → Tunis Aéroport complété",
            time: "Il y a 2 jours",
            icon: MapPin,
            color: "text-green-600",
        },
    ]

    // Sample upcoming trips
    const upcomingTrips = [
        {
            id: 1,
            departure: "Tunis Centre-Ville",
            arrival: "Sousse Médina",
            date: "2024-01-15",
            time: "08:00",
            passengers: 3,
            maxPassengers: 4,
            price: "25.000 TND",
            status: "confirmed",
        },
        {
            id: 2,
            departure: "Monastir Marina",
            arrival: "Kairouan Médina",
            date: "2024-01-18",
            time: "14:00",
            passengers: 1,
            maxPassengers: 3,
            price: "20.000 TND",
            status: "pending",
        },
    ]

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bonjour, {user.first_name} ! 👋</h1>
                        <p className="text-gray-600 mt-1">Voici un aperçu de votre activité récente</p>
                    </div>

                    <div className="mt-4 sm:mt-0">
                        {(user.user_type === "driver" || user.user_type === "both") && (
                            <Link href="/trips/create">
                                <Button className="bg-green-600 hover:bg-green-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Créer un trajet
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((stat, index) => {
                        const IconComponent = stat.icon
                        return (
                            <Card key={index}>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-2">
                                        <IconComponent className={`h-5 w-5 ${stat.color}`} />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600">{stat.title}</p>
                                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                            {stat.description && <p className="text-xs text-gray-500">{stat.description}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Clock className="h-5 w-5" />
                                <span>Activité récente</span>
                            </CardTitle>
                            <CardDescription>Vos dernières interactions sur la plateforme</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => {
                                    const ActivityIcon = activity.icon
                                    return (
                                        <div key={activity.id} className="flex items-start space-x-3">
                                            <div className={`p-2 rounded-full bg-gray-100`}>
                                                <ActivityIcon className={`h-4 w-4 ${activity.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900">{activity.title}</p>
                                                <p className="text-sm text-gray-600">{activity.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Trips */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5" />
                                <span>Prochains trajets</span>
                            </CardTitle>
                            <CardDescription>
                                {user.user_type === "driver" || user.user_type === "both"
                                    ? "Vos trajets programmés"
                                    : "Vos réservations à venir"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingTrips.map((trip) => (
                                    <div key={trip.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium text-sm">
                          {trip.departure} → {trip.arrival}
                        </span>
                                            </div>
                                            <Badge
                                                variant={trip.status === "confirmed" ? "default" : "secondary"}
                                                className={trip.status === "confirmed" ? "bg-green-100 text-green-800" : ""}
                                            >
                                                {trip.status === "confirmed" ? "Confirmé" : "En attente"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(trip.date).toLocaleDateString("fr-TN")}</span>
                        </span>
                                                <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{trip.time}</span>
                        </span>
                                                {(user.user_type === "driver" || user.user_type === "both") && (
                                                    <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {trip.passengers}/{trip.maxPassengers}
                            </span>
                          </span>
                                                )}
                                            </div>
                                            <span className="font-medium text-green-600">{trip.price}</span>
                                        </div>
                                    </div>
                                ))}

                                {upcomingTrips.length === 0 && (
                                    <div className="text-center py-6">
                                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600">Aucun trajet programmé</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions rapides</CardTitle>
                        <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(user.user_type === "driver" || user.user_type === "both") && (
                                <>
                                    <Link href="/trips/create">
                                        <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                                            <Plus className="h-6 w-6" />
                                            <span className="text-sm">Créer un trajet</span>
                                        </Button>
                                    </Link>
                                    <Link href="/vehicles">
                                        <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                                            <Car className="h-6 w-6" />
                                            <span className="text-sm">Mes véhicules</span>
                                        </Button>
                                    </Link>
                                </>
                            )}

                            <Link href="/trips">
                                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                                    <MapPin className="h-6 w-6" />
                                    <span className="text-sm">Rechercher</span>
                                </Button>
                            </Link>

                            <Link href="/communities">
                                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                                    <Users className="h-6 w-6" />
                                    <span className="text-sm">Communautés</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
