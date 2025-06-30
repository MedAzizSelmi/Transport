"use client"

import React from "react"

import { useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MapPin, Calendar, Users, Car, Euro, Phone, MessageSquare, Star } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function TripDetailPage() {
    const params = useParams()
    const { user } = useAuth()
    const { toast } = useToast()
    const [trip, setTrip] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [bookingLoading, setBookingLoading] = useState(false)

    const tripId = Number(params.id)

    // Fetch trip details
    React.useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await api.get(`/trips/${tripId}/`)
                setTrip(response.data)
            } catch (error) {
                console.error("Error fetching trip:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchTrip()
    }, [tripId])

    const handleBookTrip = async () => {
        setBookingLoading(true)
        try {
            await api.post(`/trips/${tripId}/book/`, {
                seats_booked: 1,
                message: "Bonjour, je souhaiterais réserver une place pour ce trajet.",
            })
            toast({
                title: "Succès",
                description: "Demande de réservation envoyée !",
            })
            // Refresh trip data
            const response = await api.get(`/trips/${tripId}/`)
            setTrip(response.data)
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.error || "Erreur lors de la réservation",
                variant: "destructive",
            })
        } finally {
            setBookingLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
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

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            </DashboardLayout>
        )
    }

    if (!trip) {
        return (
            <DashboardLayout>
                <Card>
                    <CardContent className="text-center py-12">
                        <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Trajet non trouvé</h3>
                        <p className="text-gray-500 mb-4">Ce trajet n'existe pas ou a été supprimé.</p>
                        <Link href="/trips">
                            <Button>Retour aux trajets</Button>
                        </Link>
                    </CardContent>
                </Card>
            </DashboardLayout>
        )
    }

    const statusBadge = getStatusBadge(trip.status)
    const canBook = !trip.is_driver && trip.remaining_seats > 0 && trip.status === "planned" && !trip.user_booking

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/trips">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                </div>

                {/* Trip Header */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-4">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {trip.departure_location} → {trip.arrival_location}
                                    </h1>
                                    <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="font-medium">Départ</p>
                                            <p className="text-gray-600">{formatDate(trip.departure_time)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="font-medium">Arrivée estimée</p>
                                            <p className="text-gray-600">{formatDate(trip.estimated_arrival_time)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="font-medium">Places disponibles</p>
                                            <p className="text-gray-600">
                                                {trip.remaining_seats} / {trip.available_seats}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Euro className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="font-medium">Prix par place</p>
                                            <p className="text-green-600 font-semibold">{Number(trip.price_per_seat).toFixed(2)}€</p>
                                        </div>
                                    </div>
                                </div>

                                {trip.description && (
                                    <div className="mt-4">
                                        <h3 className="font-medium mb-2">Description</h3>
                                        <p className="text-gray-700">{trip.description}</p>
                                    </div>
                                )}
                            </div>

                            <div className="ml-6 flex flex-col space-y-2">
                                {trip.is_driver ? (
                                    <Badge className="bg-green-100 text-green-800">Votre trajet</Badge>
                                ) : trip.user_booking ? (
                                    <Badge className="bg-blue-100 text-blue-800">Réservé ({trip.user_booking.status})</Badge>
                                ) : canBook ? (
                                    <Button
                                        onClick={handleBookTrip}
                                        disabled={bookingLoading}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {bookingLoading ? "..." : "Réserver"}
                                    </Button>
                                ) : (
                                    <Button disabled variant="outline">
                                        {trip.remaining_seats === 0 ? "Complet" : "Indisponible"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Driver Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Conducteur</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-3 mb-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={trip.driver?.profile_picture || "/placeholder.svg"} />
                                    <AvatarFallback>
                                        {trip.driver?.first_name?.[0]}
                                        {trip.driver?.last_name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">
                                        {trip.driver?.first_name} {trip.driver?.last_name}
                                    </p>
                                    <div className="flex items-center space-x-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        <span className="text-sm text-gray-600">4.5 (12 avis)</span>
                                    </div>
                                </div>
                            </div>

                            {trip.driver?.bio && <p className="text-gray-600 text-sm mb-4">{trip.driver.bio}</p>}

                            <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full bg-transparent">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Contacter
                                </Button>
                                <Button variant="outline" size="sm" className="w-full bg-transparent">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Appeler
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vehicle Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Véhicule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Car className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {trip.vehicle?.brand} {trip.vehicle?.model}
                                    </p>
                                    <p className="text-sm text-gray-600">{trip.vehicle?.year}</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Couleur:</span>
                                    <span>{trip.vehicle?.color}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Immatriculation:</span>
                                    <span className="font-mono">{trip.vehicle?.license_plate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Places totales:</span>
                                    <span>{trip.vehicle?.seats} places</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Community Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Communauté</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-full">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-medium">{trip.community?.name}</p>
                                    <p className="text-sm text-gray-600">{trip.community?.member_count} membres</p>
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4">{trip.community?.description}</p>

                            <Link href={`/communities/${trip.community?.id}`}>
                                <Button variant="outline" size="sm" className="w-full bg-transparent">
                                    Voir la communauté
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Route Map Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Itinéraire</CardTitle>
                        <CardDescription>Carte du trajet (à venir)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <MapPin className="h-8 w-8 mx-auto mb-2" />
                                <p>Carte interactive bientôt disponible</p>
                                <p className="text-sm">
                                    {trip.departure_location} → {trip.arrival_location}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
