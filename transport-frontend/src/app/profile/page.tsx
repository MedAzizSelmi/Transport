"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Calendar, Star, Edit, Save, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

export default function ProfilePage() {
    const { user, loading } = useAuth()
    const { toast } = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
        user_type: user?.user_type || "passenger",
    })

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.patch("/auth/profile/", formData)
            toast({
                title: "Succès",
                description: "Profil mis à jour avec succès !",
            })
            setIsEditing(false)
            // Refresh user data
            window.location.reload()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.detail || "Erreur lors de la mise à jour",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            phone: user?.phone || "",
            bio: user?.bio || "",
            user_type: user?.user_type || "passenger",
        })
        setIsEditing(false)
    }

    if (loading || !user) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            </DashboardLayout>
        )
    }

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
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
                        <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700">
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                        </Button>
                    ) : (
                        <div className="flex space-x-2">
                            <Button onClick={handleCancel} variant="outline">
                                <X className="h-4 w-4 mr-2" />
                                Annuler
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? "Sauvegarde..." : "Sauvegarder"}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="lg:col-span-1">
                        <CardContent className="p-6 text-center">
                            <Avatar className="h-24 w-24 mx-auto mb-4">
                                <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.username} />
                                <AvatarFallback className="text-2xl">
                                    {user.first_name[0]}
                                    {user.last_name[0]}
                                </AvatarFallback>
                            </Avatar>

                            <h2 className="text-xl font-semibold mb-2">
                                {user.first_name} {user.last_name}
                            </h2>

                            <p className="text-gray-600 mb-3">@{user.username}</p>

                            <Badge className={userBadge.className}>{userBadge.text}</Badge>

                            {user.is_verified && (
                                <div className="mt-3">
                                    <Badge className="bg-green-100 text-green-800">✓ Vérifié</Badge>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                    Membre depuis{" "}
                                        {new Date(user.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Information Card */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Informations personnelles</CardTitle>
                            <CardDescription>Vos informations de base et préférences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">Prénom</Label>
                                            <Input
                                                id="first_name"
                                                value={formData.first_name}
                                                onChange={(e) => handleChange("first_name", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Nom</Label>
                                            <Input
                                                id="last_name"
                                                value={formData.last_name}
                                                onChange={(e) => handleChange("last_name", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Téléphone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                            placeholder="06 12 34 56 78"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="user_type">Type d'utilisateur</Label>
                                        <Select value={formData.user_type} onValueChange={(value) => handleChange("user_type", value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="passenger">Passager</SelectItem>
                                                <SelectItem value="driver">Conducteur</SelectItem>
                                                <SelectItem value="both">Les deux</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={formData.bio}
                                            onChange={(e) => handleChange("bio", e.target.value)}
                                            placeholder="Parlez-nous de vous..."
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center space-x-3">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Nom complet</p>
                                                <p className="font-medium">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Téléphone</p>
                                                <p className="font-medium">{user.phone || "Non renseigné"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Type d'utilisateur</p>
                                                <Badge className={userBadge.className}>{userBadge.text}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {user.bio && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">Bio</p>
                                            <p className="text-gray-700">{user.bio}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Statistiques</CardTitle>
                        <CardDescription>Votre activité sur la plateforme</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">0</div>
                                <p className="text-sm text-gray-500">Trajets créés</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">0</div>
                                <p className="text-sm text-gray-500">Trajets réservés</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">0</div>
                                <p className="text-sm text-gray-500">Communautés</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center space-x-1">
                                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                                    <span className="text-2xl font-bold text-yellow-600">4.5</span>
                                </div>
                                <p className="text-sm text-gray-500">Note moyenne</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
