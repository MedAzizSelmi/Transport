"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useCommunities, useVehicles, useCreateTrip } from "@/hooks/useApi"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Car, Users } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function CreateTripPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const { data: communitiesData } = useCommunities()
    const { data: vehiclesData } = useVehicles()
    const createTripMutation = useCreateTrip()

    const [formData, setFormData] = useState({
        community_id: "",
        vehicle_id: "",
        departure_location: "",
        departure_latitude: "",
        departure_longitude: "",
        arrival_location: "",
        arrival_latitude: "",
        arrival_longitude: "",
        departure_time: "",
        estimated_arrival_time: "",
        available_seats: 1,
        price_per_seat: 0,
        description: "",
        recurring: false,
        recurring_days: "",
    })

    // Redirect if user is not a driver
    useEffect(() => {
        if (user && user.user_type === "passenger") {
            router.push("/trips")
        }
    }, [user, router])

    const communities = communitiesData?.results?.filter((c: any) => c.is_member) || []
    const vehicles = vehiclesData || []

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const submitData = {
                ...formData,
                community_id: Number.parseInt(formData.community_id),
                vehicle_id: Number.parseInt(formData.vehicle_id),
                available_seats: Number.parseInt(formData.available_seats.toString()),
                price_per_seat: Number.parseFloat(formData.price_per_seat.toString()),
                departure_latitude: formData.departure_latitude ? Number.parseFloat(formData.departure_latitude) : null,
                departure_longitude: formData.departure_longitude ? Number.parseFloat(formData.departure_longitude) : null,
                arrival_latitude: formData.arrival_latitude ? Number.parseFloat(formData.arrival_latitude) : null,
                arrival_longitude: formData.arrival_longitude ? Number.parseFloat(formData.arrival_longitude) : null,
            }

            await createTripMutation.mutateAsync(submitData)
            toast({
                title: "Succès",
                description: "Trajet créé avec succès !",
            })
            router.push("/trips/my-trips")
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.detail || "Erreur lors de la création",
                variant: "destructive",
            })
        }
    }

    if (user?.user_type === "passenger") {
        return null
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/trips">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Créer un trajet</h1>
                        <p className="text-gray-600 mt-1">Proposez un trajet à votre communauté</p>
                    </div>
                </div>

                {/* Check if user has vehicles and communities */}
                {vehicles.length === 0 ? (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <Car className="h-8 w-8 text-orange-600" />
                                <div>
                                    <h3 className="font-medium text-orange-900">Aucun véhicule enregistré</h3>
                                    <p className="text-orange-700 text-sm">
                                        Vous devez d'abord ajouter un véhicule pour créer un trajet.
                                    </p>
                                </div>
                            </div>
                            <Link href="/vehicles" className="mt-4 inline-block">
                                <Button className="bg-orange-600 hover:bg-orange-700">Ajouter un véhicule</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : communities.length === 0 ? (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <Users className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h3 className="font-medium text-blue-900">Aucune communauté</h3>
                                    <p className="text-blue-700 text-sm">Vous devez rejoindre une communauté pour créer un trajet.</p>
                                </div>
                            </div>
                            <Link href="/communities" className="mt-4 inline-block">
                                <Button className="bg-blue-600 hover:bg-blue-700">Rejoindre une communauté</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Car className="h-5 w-5 mr-2" />
                                Détails du trajet
                            </CardTitle>
                            <CardDescription>Remplissez les informations de votre trajet</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Community and Vehicle */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="community_id">Communauté *</Label>
                                        <Select
                                            value={formData.community_id}
                                            onValueChange={(value) => handleChange("community_id", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez une communauté" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {communities.map((community: any) => (
                                                    <SelectItem key={community.id} value={community.id.toString()}>
                                                        {community.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle_id">Véhicule *</Label>
                                        <Select value={formData.vehicle_id} onValueChange={(value) => handleChange("vehicle_id", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez un véhicule" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vehicles.map((vehicle: any) => (
                                                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                                        {vehicle.brand} {vehicle.model} - {vehicle.license_plate}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Locations */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="departure_location">Lieu de départ *</Label>
                                        <Input
                                            id="departure_location"
                                            value={formData.departure_location}
                                            onChange={(e) => handleChange("departure_location", e.target.value)}
                                            placeholder="Ex: Gare de Lyon, Paris"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="arrival_location">Lieu d'arrivée *</Label>
                                        <Input
                                            id="arrival_location"
                                            value={formData.arrival_location}
                                            onChange={(e) => handleChange("arrival_location", e.target.value)}
                                            placeholder="Ex: La Défense, Paris"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Times */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="departure_time">Heure de départ *</Label>
                                        <Input
                                            id="departure_time"
                                            type="datetime-local"
                                            value={formData.departure_time}
                                            onChange={(e) => handleChange("departure_time", e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="estimated_arrival_time">Heure d'arrivée estimée *</Label>
                                        <Input
                                            id="estimated_arrival_time"
                                            type="datetime-local"
                                            value={formData.estimated_arrival_time}
                                            onChange={(e) => handleChange("estimated_arrival_time", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Seats and Price */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="available_seats">Places disponibles *</Label>
                                        <Input
                                            id="available_seats"
                                            type="number"
                                            min="1"
                                            max="8"
                                            value={formData.available_seats}
                                            onChange={(e) => handleChange("available_seats", Number.parseInt(e.target.value))}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price_per_seat">Prix par place (TND)</Label>
                                        <Input
                                            id="price_per_seat"
                                            type="number"
                                            min="0"
                                            step="0.001"
                                            value={formData.price_per_seat}
                                            onChange={(e) => handleChange("price_per_seat", Number.parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (optionnel)</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        placeholder="Informations supplémentaires sur le trajet..."
                                        rows={3}
                                    />
                                </div>

                                {/* Recurring */}
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="recurring"
                                        checked={formData.recurring}
                                        onCheckedChange={(checked: boolean) => handleChange("recurring", checked)}
                                    />
                                    <Label htmlFor="recurring">Trajet récurrent</Label>
                                </div>

                                <div className="flex space-x-4 pt-4">
                                    <Link href="/trips" className="flex-1">
                                        <Button type="button" variant="outline" className="w-full bg-transparent">
                                            Annuler
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={createTripMutation.isPending}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {createTripMutation.isPending ? "Création..." : "Créer le trajet"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
