"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useBookings, useCancelBooking } from "@/hooks/useApi"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    Phone,
    MessageCircle,
    X,
    CheckCircle,
    AlertCircle,
    Car,
    CreditCard,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const statusConfig = {
    pending: {
        label: "En attente",
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertCircle,
    },
    confirmed: {
        label: "Confirmé",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
    },
    cancelled: {
        label: "Annulé",
        color: "bg-red-100 text-red-800",
        icon: X,
    },
    completed: {
        label: "Terminé",
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
    },
}

export default function BookingsPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [statusFilter, setStatusFilter] = useState("all")
    const [activeTab, setActiveTab] = useState("passenger")

    const {
        data: bookings,
        isLoading,
        error,
    } = useBookings({
        status: statusFilter !== "all" ? statusFilter : undefined,
    })
    const cancelBookingMutation = useCancelBooking()

    const handleCancelBooking = async (bookingId: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
            try {
                await cancelBookingMutation.mutateAsync(bookingId)
                toast({
                    title: "Réservation annulée",
                    description: "Votre réservation a été annulée avec succès.",
                })
            } catch (error: any) {
                toast({
                    title: "Erreur",
                    description: error.response?.data?.detail || "Impossible d'annuler la réservation.",
                    variant: "destructive",
                })
            }
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-TN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("fr-TN", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const calculateTotalSpent = (bookings: any[]) => {
        return (
            bookings
                ?.filter((booking) => booking.status === "completed")
                ?.reduce((total, booking) => total + (booking.seats_booked * booking.trip?.price_per_seat || 0), 0) || 0
        )
    }

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig]
        if (!config) return null

        const Icon = config.icon
        return (
            <Badge className={config.color}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        )
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mes réservations</h1>
                        <p className="text-gray-600 mt-1">Gérez vos réservations de trajets</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-4">
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <Skeleton className="h-32 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="text-red-500 mb-4">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                            <h3 className="text-lg font-medium">Erreur de chargement</h3>
                            <p className="text-sm">Impossible de charger vos réservations. Veuillez réessayer.</p>
                        </div>
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Réessayer
                        </Button>
                    </CardContent>
                </Card>
            </DashboardLayout>
        )
    }

    const passengerBookings = bookings?.filter((booking: any) => booking.passenger?.id === user?.id) || []
    const driverBookings = bookings?.filter((booking: any) => booking.trip?.driver?.id === user?.id) || []

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mes réservations</h1>
                    <p className="text-gray-600 mt-1">Gérez vos réservations de trajets</p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Total réservations</p>
                                    <p className="text-2xl font-bold text-blue-600">{passengerBookings.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Confirmées</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {passengerBookings.filter((b: any) => b.status === "confirmed").length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="text-sm text-gray-600">En attente</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {passengerBookings.filter((b: any) => b.status === "pending").length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Total dépensé</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {calculateTotalSpent(passengerBookings).toFixed(3)} TND
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium">Filtrer par statut:</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="pending">En attente</SelectItem>
                                    <SelectItem value="confirmed">Confirmé</SelectItem>
                                    <SelectItem value="cancelled">Annulé</SelectItem>
                                    <SelectItem value="completed">Terminé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="passenger">Mes réservations ({passengerBookings.length})</TabsTrigger>
                        <TabsTrigger value="driver">Réservations reçues ({driverBookings.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="passenger" className="space-y-4">
                        {passengerBookings.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
                                    <p className="text-gray-600 mb-4">Vous n'avez pas encore effectué de réservation.</p>
                                    <Button className="bg-blue-600 hover:bg-blue-700">Rechercher un trajet</Button>
                                </CardContent>
                            </Card>
                        ) : (
                            passengerBookings.map((booking: any) => (
                                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg flex items-center space-x-2">
                                                    <Car className="h-5 w-5 text-blue-600" />
                                                    <span>
                            {booking.trip?.departure_location} → {booking.trip?.arrival_location}
                          </span>
                                                </CardTitle>
                                                <CardDescription className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.trip?.departure_time)}</span>
                          </span>
                                                    <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(booking.trip?.departure_time)}</span>
                          </span>
                                                </CardDescription>
                                            </div>

                                            <div className="text-right space-y-2">
                                                {getStatusBadge(booking.status)}
                                                <p className="text-sm text-gray-600">Réservé le {formatDate(booking.created_at)}</p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Driver Info */}
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {booking.trip?.driver?.first_name?.[0]}
                            {booking.trip?.driver?.last_name?.[0]}
                        </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {booking.trip?.driver?.first_name} {booking.trip?.driver?.last_name}
                                                </p>
                                                <p className="text-sm text-gray-600">Conducteur</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm">
                                                    <Phone className="h-3 w-3 mr-1" />
                                                    Appeler
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <MessageCircle className="h-3 w-3 mr-1" />
                                                    Message
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Places réservées</p>
                                                <p className="font-medium flex items-center">
                                                    <Users className="h-4 w-4 mr-1" />
                                                    {booking.seats_booked}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Prix total</p>
                                                <p className="font-medium text-green-600">
                                                    {(booking.seats_booked * booking.trip?.price_per_seat).toFixed(3)} TND
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Véhicule</p>
                                                <p className="font-medium">
                                                    {booking.trip?.vehicle?.brand} {booking.trip?.vehicle?.model}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Couleur</p>
                                                <p className="font-medium">{booking.trip?.vehicle?.color}</p>
                                            </div>
                                        </div>

                                        {/* Pickup/Dropoff Locations */}
                                        {(booking.pickup_location || booking.dropoff_location) && (
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <h4 className="font-medium text-blue-900 mb-2">Lieux de prise en charge</h4>
                                                <div className="space-y-1 text-sm">
                                                    {booking.pickup_location && (
                                                        <p>
                                                            <span className="text-blue-700">Montée:</span> {booking.pickup_location}
                                                        </p>
                                                    )}
                                                    {booking.dropoff_location && (
                                                        <p>
                                                            <span className="text-blue-700">Descente:</span> {booking.dropoff_location}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Message */}
                                        {booking.message && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Message</h4>
                                                <p className="text-sm text-gray-700">"{booking.message}"</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex space-x-2 pt-2">
                                            {booking.status === "pending" && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    disabled={cancelBookingMutation.isPending}
                                                >
                                                    <X className="h-3 w-3 mr-1" />
                                                    Annuler
                                                </Button>
                                            )}
                                            {booking.status === "confirmed" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    disabled={cancelBookingMutation.isPending}
                                                >
                                                    <X className="h-3 w-3 mr-1" />
                                                    Annuler
                                                </Button>
                                            )}
                                            {booking.status === "completed" && (
                                                <Button variant="outline" size="sm">
                                                    Évaluer le conducteur
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="driver" className="space-y-4">
                        {driverBookings.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation reçue</h3>
                                    <p className="text-gray-600 mb-4">Vous n'avez pas encore reçu de réservations pour vos trajets.</p>
                                    <Button className="bg-green-600 hover:bg-green-700">Créer un trajet</Button>
                                </CardContent>
                            </Card>
                        ) : (
                            driverBookings.map((booking: any) => (
                                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg flex items-center space-x-2">
                                                    <Users className="h-5 w-5 text-green-600" />
                                                    <span>
                            Réservation de {booking.passenger?.first_name} {booking.passenger?.last_name}
                          </span>
                                                </CardTitle>
                                                <CardDescription className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {booking.trip?.departure_location} → {booking.trip?.arrival_location}
                            </span>
                          </span>
                                                    <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.trip?.departure_time)}</span>
                          </span>
                                                </CardDescription>
                                            </div>

                                            <div className="text-right space-y-2">
                                                {getStatusBadge(booking.status)}
                                                <p className="text-sm text-gray-600">Réservé le {formatDate(booking.created_at)}</p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Passenger Info */}
                                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {booking.passenger?.first_name?.[0]}
                            {booking.passenger?.last_name?.[0]}
                        </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {booking.passenger?.first_name} {booking.passenger?.last_name}
                                                </p>
                                                <p className="text-sm text-gray-600">Passager</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm">
                                                    <Phone className="h-3 w-3 mr-1" />
                                                    Appeler
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <MessageCircle className="h-3 w-3 mr-1" />
                                                    Message
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Places réservées</p>
                                                <p className="font-medium flex items-center">
                                                    <Users className="h-4 w-4 mr-1" />
                                                    {booking.seats_booked}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Montant</p>
                                                <p className="font-medium text-green-600">
                                                    {(booking.seats_booked * booking.trip?.price_per_seat).toFixed(3)} TND
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions for Driver */}
                                        {booking.status === "pending" && (
                                            <div className="flex space-x-2 pt-2">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Confirmer
                                                </Button>
                                                <Button variant="destructive" size="sm">
                                                    <X className="h-3 w-3 mr-1" />
                                                    Refuser
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
