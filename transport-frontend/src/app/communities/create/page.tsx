"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

export default function CreateCommunityPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        community_type: "",
        location: "",
        is_private: false,
        max_members: 100,
    })

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await api.post("/communities/", formData)
            toast({
                title: "Succès",
                description: "Communauté créée avec succès !",
            })
            router.push("/communities")
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.detail || "Erreur lors de la création",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/communities">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Créer une communauté</h1>
                        <p className="text-gray-600 mt-1">Rassemblez des personnes autour de trajets communs</p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Users className="h-5 w-5 mr-2" />
                            Informations de la communauté
                        </CardTitle>
                        <CardDescription>Remplissez les détails de votre nouvelle communauté</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom de la communauté *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Ex: Covoiturage Paris-La Défense"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    placeholder="Décrivez l'objectif et les règles de votre communauté..."
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="community_type">Type de communauté *</Label>
                                    <Select
                                        value={formData.community_type}
                                        onValueChange={(value) => handleChange("community_type", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez un type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="work">Domicile-Travail</SelectItem>
                                            <SelectItem value="school">Trajets scolaires</SelectItem>
                                            <SelectItem value="events">Événements</SelectItem>
                                            <SelectItem value="shopping">Shopping</SelectItem>
                                            <SelectItem value="other">Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Localisation *</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => handleChange("location", e.target.value)}
                                        placeholder="Ex: Paris, Île-de-France"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_members">Nombre maximum de membres</Label>
                                <Input
                                    id="max_members"
                                    type="number"
                                    min="10"
                                    max="1000"
                                    value={formData.max_members}
                                    onChange={(e) => handleChange("max_members", Number.parseInt(e.target.value))}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_private"
                                    checked={formData.is_private}
                                    onCheckedChange={(checked: boolean) => handleChange("is_private", checked)}
                                />
                                <Label htmlFor="is_private">Communauté privée</Label>
                            </div>
                            <p className="text-sm text-gray-500">
                                Les communautés privées nécessitent une approbation pour rejoindre
                            </p>

                            <div className="flex space-x-4 pt-4">
                                <Link href="/communities" className="flex-1">
                                    <Button type="button" variant="outline" className="w-full bg-transparent">
                                        Annuler
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={
                                        loading || !formData.name || !formData.description || !formData.community_type || !formData.location
                                    }
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {loading ? "Création..." : "Créer la communauté"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
