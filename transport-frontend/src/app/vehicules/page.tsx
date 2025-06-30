"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "@/hooks/useApi"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Car, Plus, Edit, Trash2, Calendar, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function VehiclesPage() {
    const { user } = useAuth()
    const { toast } = useToast()

    const { data: vehicles, isLoading, error } = useVehicles()
    const createVehicleMutation = useCreateVehicle()
    const updateVehicleMutation = useUpdateVehicle()
    const deleteVehicleMutation = useDeleteVehicle()

    const [showAddForm, setShowAddForm] = useState(false)
    const [editingVehicle, setEditingVehicle] = useState<any>(null)

    const [formData, setFormData] = useState({
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        license_plate: "",
        seats: 5,
    })

    const handleInputChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const resetForm = () => {
        setFormData({
            brand: "",
            model: "",
            year: new Date().getFullYear(),
            color: "",
            license_plate: "",
            seats: 5,
        })
        setShowAddForm(false)
        setEditingVehicle(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingVehicle) {
                await updateVehicleMutation.mutateAsync({
                    id: editingVehicle.id,
                    data: formData,
                })
                toast({
                    title: "Véhicule modifié",
                    description: "Les informations du véhicule ont été mises à jour.",
                })
            } else {
                await createVehicleMutation.mutateAsync(formData)
                toast({
                    title: "Véhicule ajouté",
                    description: "Votre véhicule a été ajouté avec succès.",
                })
            }
            resetForm()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.detail || "Impossible de sauvegarder le véhicule.",
                variant: "destructive",
            })
        }
    }

    const handleEdit = (vehicle: any) => {
        setFormData({
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            license_plate: vehicle.license_plate,
            seats: vehicle.seats,
        })
        setEditingVehicle(vehicle)
        setShowAddForm(true)
    }

    const handleDelete = async (vehicleId: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
            try {
                await deleteVehicleMutation.mutateAsync(vehicleId)
                toast({
                    title: "Véhicule supprimé",
                    description: "Le véhicule a été supprimé avec succès.",
                })
            } catch (error: any) {
                toast({
                    title: "Erreur",
                    description: error.response?.data?.detail || "Impossible de supprimer le véhicule.",
                    variant: "destructive",
                })
            }
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-TN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    // Redirect if user is passenger only
    if (user?.user_type === "passenger") {
        return (
            <DashboardLayout>
                <Card>
                    <CardContent className="text-center py-12">
                        <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Accès non autorisé</h3>
                        <p className="text-gray-500">Cette page est réservée aux conducteurs.</p>
                    </CardContent>
                </Card>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mes véhicules</h1>
                        <p className="text-gray-600 mt-1">Gérez vos véhicules pour vos trajets</p>
                    </div>

                    <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un véhicule
                    </Button>
                </div>

                {/* Stats */}
                {!isLoading && vehicles && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Car className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Total véhicules</p>
                                        <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Car className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Actifs</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {vehicles.filter((v: any) => v.is_active).length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Places totales</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {vehicles.reduce((sum: number, v: any) => sum + v.seats, 0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Année moyenne</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {vehicles.length > 0
                                                ? Math.round(vehicles.reduce((sum: number, v: any) => sum + v.year, 0) / vehicles.length)
                                                : 0}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Add/Edit Form */}
                {showAddForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{editingVehicle ? "Modifier le véhicule" : "Ajouter un véhicule"}</CardTitle>
                            <CardDescription>
                                {editingVehicle
                                    ? "Modifiez les informations de votre véhicule"
                                    : "Ajoutez un nouveau véhicule à votre flotte"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="brand">Marque *</Label>
                                        <Input
                                            id="brand"
                                            value={formData.brand}
                                            onChange={(e) => handleInputChange("brand", e.target.value)}
                                            placeholder="Ex: Peugeot"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="model">Modèle *</Label>
                                        <Input
                                            id="model"
                                            value={formData.model}
                                            onChange={(e) => handleInputChange("model", e.target.value)}
                                            placeholder="Ex: 308"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Année *</Label>
                                        <Input
                                            id="year"
                                            type="number"
                                            min="1990"
                                            max={new Date().getFullYear() + 1}
                                            value={formData.year}
                                            onChange={(e) => handleInputChange("year", Number.parseInt(e.target.value))}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="color">Couleur *</Label>
                                        <Select value={formData.color} onValueChange={(value) => handleInputChange("color", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez une couleur" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Blanc">Blanc</SelectItem>
                                                <SelectItem value="Noir">Noir</SelectItem>
                                                <SelectItem value="Gris">Gris</SelectItem>
                                                <SelectItem value="Rouge">Rouge</SelectItem>
                                                <SelectItem value="Bleu">Bleu</SelectItem>
                                                <SelectItem value="Vert">Vert</SelectItem>
                                                <SelectItem value="Jaune">Jaune</SelectItem>
                                                <SelectItem value="Orange">Orange</SelectItem>
                                                <SelectItem value="Violet">Violet</SelectItem>
                                                <SelectItem value="Marron">Marron</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="seats">Nombre de places *</Label>
                                        <Select
                                            value={formData.seats.toString()}
                                            onValueChange={(value) => handleInputChange("seats", Number.parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2">2 places</SelectItem>
                                                <SelectItem value="4">4 places</SelectItem>
                                                <SelectItem value="5">5 places</SelectItem>
                                                <SelectItem value="7">7 places</SelectItem>
                                                <SelectItem value="9">9 places</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="license_plate">Plaque d'immatriculation *</Label>
                                    <Input
                                        id="license_plate"
                                        value={formData.license_plate}
                                        onChange={(e) => handleInputChange("license_plate", e.target.value)}
                                        placeholder="Ex: 123 TUN 456"
                                        required
                                    />
                                </div>

                                <div className="flex space-x-4 pt-4">
                                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {createVehicleMutation.isPending || updateVehicleMutation.isPending
                                            ? "Sauvegarde..."
                                            : editingVehicle
                                                ? "Modifier"
                                                : "Ajouter"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Vehicles List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <Car className="h-12 w-12 mx-auto mb-2" />
                                <h3 className="text-lg font-medium">Erreur de chargement</h3>
                                <p className="text-sm">Impossible de charger vos véhicules. Veuillez réessayer.</p>
                            </div>
                            <Button onClick={() => window.location.reload()} variant="outline">
                                Réessayer
                            </Button>
                        </CardContent>
                    </Card>
                ) : !vehicles || vehicles.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun véhicule</h3>
                            <p className="text-gray-600 mb-4">
                                Ajoutez votre premier véhicule pour commencer à proposer des trajets.
                            </p>
                            <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un véhicule
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vehicles.map((vehicle: any) => (
                            <Card key={vehicle.id} className={`${!vehicle.is_active ? "opacity-60" : ""}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center space-x-2">
                                                <Car className="h-5 w-5 text-blue-600" />
                                                <span>
                          {vehicle.brand} {vehicle.model}
                        </span>
                                            </CardTitle>
                                            <CardDescription>
                                                {vehicle.year} • {vehicle.color} • {vehicle.license_plate}
                                            </CardDescription>
                                        </div>

                                        <Badge
                                            variant={vehicle.is_active ? "default" : "secondary"}
                                            className={vehicle.is_active ? "bg-green-100 text-green-800" : ""}
                                        >
                                            {vehicle.is_active ? "Actif" : "Inactif"}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Vehicle Details */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4 text-gray-500" />
                                            <span>{vehicle.seats} places</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>Année {vehicle.year}</span>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500">Ajouté le {formatDate(vehicle.created_at)}</div>

                                    {/* Actions */}
                                    <div className="flex space-x-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(vehicle)}
                                            className="flex-1"
                                            disabled={updateVehicleMutation.isPending}
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(vehicle.id)}
                                            disabled={deleteVehicleMutation.isPending}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
