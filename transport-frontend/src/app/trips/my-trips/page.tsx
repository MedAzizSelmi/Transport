"use client"

import { useState } from "react"
import { useMyTrips } from "@/hooks/useApi"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Calendar, Users, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function MyTripsPage() {
    const { user } = useAuth()
    const [tripType, setTripType] = useState("all")

    const { data: tripsData, isLoading } = useMyTrips(tripType !== "all" ? tripType : undefined)
    const trips = tripsData?.results || []

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            planned: { label: "Planifié", className: "bg-green-100 text-green-800" },
            active: { label: "En cours", className: "bg-blue-100 text-blue-800" },
            completed: { label: "Terminé", className: "bg-gray-100 text-gray-800" },
            cancelled: { label: "Annulé", className: "bg-red-100 text-red-800" },
        }
        return statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" }
    }

    const getFilterOptions = () => {
        const options = [{ value: "all", label: "Tous les trajets" }]

        if (user?.user_type === "driver" || user?.user_type === "both") {
            options.push({ value: "driver", label: "Mes trajets (conducteur)" })
        }

        if (user?.user_type === "passenger" || user?.user_type === "both") {
            options.push({ value: "passenger", label: "Mes réservations (passager)" })
        }

        return options
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mes trajets</h1>
                        <p className="text-gray-600 mt-1">Gérez vos trajets et réservations</p>
                    </div>
                    {(user?.user_type === "driver" || user?.user_type === "both") && (
                        <Link href="/trips/create">
                            <Button className="bg-green-600 hover:bg-green-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Nouveau trajet
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium">Filtrer par:</label>
                            <Select value={tripType} onValueChange={setTripType}>
                                <SelectTrigger className="w-64">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {getFilterOptions().map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Trips List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : trips.length > 0 ? (
                    <div className="space-y-4">
                        {trips.map((trip: any) => {
                            const statusBadge = getStatusBadge(trip.status)

                            return (
                                <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                {/* Route */}
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <div className="flex items-center space-x-2 text-lg font-semibold">
                                                        <span>{trip.departure_location}</span>
                                                        <span className="text-gray-400">→</span>
                                                        <span>{trip.arrival_location}</span>
                                                    </div>
                                                    <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            trip.is_driver ? "border-green-600 text-green-600" : "border-blue-600 text-blue-600"
                                                        }
                                                    >
                                                        {trip.is_driver ? "Conducteur" : "Passager"}
                                                    </Badge>
                                                </div>

                                                {/* Trip Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        {formatDate(trip.departure_time)}
                                                    </div>

                                                    {trip.is_driver ? (
                                                        <>
                                                            <div className="flex items-center">
                                                                <Users className="h-4 w-4 mr-2" />
                                                                {trip.remaining_seats} place{trip.remaining_seats > 1 ? "s" : ""} restante
                                                                {trip.remaining_seats > 1 ? "s" : ""}
                                                            </div>

                                                            <div className="flex items-center">
                                                                <Car className="h-4 w-4 mr-2" />
                                                                {trip.vehicle?.brand} {trip.vehicle?.model}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center">
                                                                <Car className="h-4 w-4 mr-2" />
                                                                Conducteur: {trip.driver?.first_name} {trip.driver?.last_name}
                                                            </div>

                                                            {trip.user_booking && (
                                                                <div className="flex items-center">
                                                                    <Users className="h-4 w-4 mr-2" />
                                                                    Statut: {trip.user_booking.status}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    <div className="flex items-center">
                            <span className="text-green-600 font-medium">
                              {Number(trip.price_per_seat).toFixed(2)}€ par place
                            </span>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                {trip.description && <p className="text-gray-600 mt-3 text-sm">{trip.description}</p>}

                                                {/* Community */}
                                                <div className="mt-3">
                                                    <Badge variant="outline" className="text-xs">
                                                        {trip.community?.name}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="ml-6 flex flex-col space-y-2">
                                                <Link href={`/trips/${trip.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Voir détails
                                                    </Button>
                                                </Link>

                                                {trip.is_driver && trip.status === "planned" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-orange-600 hover:text-orange-700 bg-transparent"
                                                    >
                                                        Modifier
                                                    </Button>
                                                )}

                                                {trip.status === "planned" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 bg-transparent"
                                                    >
                                                        Annuler
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun trajet trouvé</h3>
                            <p className="text-gray-500 mb-4">
                                {tripType === "driver"
                                    ? "Vous n'avez créé aucun trajet pour le moment."
                                    : tripType === "passenger"
                                        ? "Vous n'avez réservé aucun trajet pour le moment."
                                        : "Vous n'avez aucune activité de trajet pour le moment."}
                            </p>
                            {(user?.user_type === "driver" || user?.user_type === "both") && (
                                <Link href="/trips/create">
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Créer un trajet
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
