"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTrips } from "@/hooks/useApi"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, MapPin, Users, Clock, Star, Search, Filter, Plus } from "lucide-react"
import Link from "next/link"

export default function TripsPage() {
    const { user } = useAuth()
    const [searchFilters, setSearchFilters] = useState({
        departure: "",
        arrival: "",
        date: "",
        passengers: "1",
        maxPrice: "",
        available_only: "true",
    })
    const [showFilters, setShowFilters] = useState(false)

    const { data: trips, isLoading, error } = useTrips(searchFilters)

    const handleFilterChange = (key: string, value: string) => {
        setSearchFilters((prev) => ({ ...prev, [key]: value }))
    }

    const handleSearch = () => {
        // The query will automatically refetch when searchFilters change
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-TN", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("fr-TN", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Rechercher un trajet</h1>
                        <p className="text-gray-600 mt-1">Trouvez le trajet parfait pour votre destination</p>
                    </div>

                    {(user?.user_type === "driver" || user?.user_type === "both") && (
                        <Link href="/trips/create">
                            <Button className="bg-green-600 hover:bg-green-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Créer un trajet
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Search Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Recherche</span>
              </span>
                            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                                <Filter className="h-4 w-4 mr-2" />
                                Filtres
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Basic Search */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="departure">Départ</Label>
                                <Input
                                    id="departure"
                                    placeholder="Ville de départ"
                                    value={searchFilters.departure}
                                    onChange={(e) => handleFilterChange("departure", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="arrival">Arrivée</Label>
                                <Input
                                    id="arrival"
                                    placeholder="Ville d'arrivée"
                                    value={searchFilters.arrival}
                                    onChange={(e) => handleFilterChange("arrival", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={searchFilters.date}
                                    onChange={(e) => handleFilterChange("date", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="passengers">Passagers</Label>
                                <Select
                                    value={searchFilters.passengers}
                                    onValueChange={(value) => handleFilterChange("passengers", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 passager</SelectItem>
                                        <SelectItem value="2">2 passagers</SelectItem>
                                        <SelectItem value="3">3 passagers</SelectItem>
                                        <SelectItem value="4">4+ passagers</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="maxPrice">Prix maximum (TND)</Label>
                                    <Input
                                        id="maxPrice"
                                        type="number"
                                        placeholder="Ex: 50.000"
                                        value={searchFilters.maxPrice}
                                        onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="available_only">Disponibilité</Label>
                                    <Select
                                        value={searchFilters.available_only}
                                        onValueChange={(value) => handleFilterChange("available_only", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Seulement disponibles</SelectItem>
                                            <SelectItem value="false">Tous les trajets</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <Button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-700">
                            <Search className="h-4 w-4 mr-2" />
                            Rechercher
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            {isLoading
                                ? "Recherche..."
                                : `${trips?.length || 0} trajet${(trips?.length || 0) > 1 ? "s" : ""} trouvé${(trips?.length || 0) > 1 ? "s" : ""}`}
                        </h2>
                        <Select defaultValue="departure_time">
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Trier par" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="departure_time">Heure de départ</SelectItem>
                                <SelectItem value="price_asc">Prix croissant</SelectItem>
                                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                                <SelectItem value="rating">Note du conducteur</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Card key={i}>
                                    <CardContent className="p-6">
                                        <Skeleton className="h-32 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : error ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <div className="text-red-500 mb-4">
                                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                                    <h3 className="text-lg font-medium">Erreur de chargement</h3>
                                    <p className="text-sm">Impossible de charger les trajets. Veuillez réessayer.</p>
                                </div>
                                <Button onClick={() => window.location.reload()} variant="outline">
                                    Réessayer
                                </Button>
                            </CardContent>
                        </Card>
                    ) : !trips || trips.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun trajet trouvé</h3>
                                <p className="text-gray-600 mb-4">
                                    Essayez de modifier vos critères de recherche ou créez une alerte pour être notifié.
                                </p>
                                <Button variant="outline">Créer une alerte</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        trips.map((trip: any) => (
                            <Card key={trip.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                        {/* Trip Info */}
                                        <div className="flex-1 space-y-3">
                                            {/* Route */}
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    <span className="font-medium">{trip.departure_location}</span>
                                                </div>
                                                <div className="flex-1 border-t border-dashed border-gray-300"></div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                    <span className="font-medium">{trip.arrival_location}</span>
                                                </div>
                                            </div>

                                            {/* Time and Duration */}
                                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(trip.departure_time)}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>
                            {formatTime(trip.departure_time)} - {formatTime(trip.estimated_arrival_time)}
                          </span>
                                                </div>
                                            </div>

                                            {/* Driver and Vehicle */}
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {trip.driver?.first_name?.[0]}
                                {trip.driver?.last_name?.[0]}
                            </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {trip.driver?.first_name} {trip.driver?.last_name}
                                                        </p>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                                                            <div className="flex items-center space-x-1">
                                                                <Star className="h-3 w-3 text-yellow-500" />
                                                                <span>Nouveau</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {trip.vehicle && (
                                                    <div className="text-sm text-gray-600">
                                                        {trip.vehicle.brand} {trip.vehicle.model} • {trip.vehicle.color}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Community */}
                                            {trip.community && (
                                                <Badge variant="secondary" className="w-fit">
                                                    {trip.community.name}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Price and Booking */}
                                        <div className="flex flex-col items-end space-y-3 lg:ml-6">
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {Number(trip.price_per_seat).toFixed(3)} TND
                                                </p>
                                                <p className="text-sm text-gray-600">par personne</p>
                                            </div>

                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Users className="h-4 w-4" />
                                                <span>
                          {trip.remaining_seats} place{trip.remaining_seats > 1 ? "s" : ""} disponible
                                                    {trip.remaining_seats > 1 ? "s" : ""}
                        </span>
                                            </div>

                                            <div className="flex space-x-2">
                                                <Link href={`/trips/${trip.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        Détails
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    disabled={trip.remaining_seats === 0 || trip.is_driver}
                                                >
                                                    {trip.is_driver ? "Votre trajet" : trip.remaining_seats === 0 ? "Complet" : "Réserver"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
