"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Bell, Shield, Globe, Trash2, User, Phone, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
    const { user } = useAuth()
    const { toast } = useToast()

    // Notification settings
    const [notifications, setNotifications] = useState({
        email_bookings: true,
        email_messages: true,
        email_promotions: false,
        push_bookings: true,
        push_messages: true,
        push_promotions: false,
        sms_bookings: false,
        sms_messages: false,
    })

    // Privacy settings
    const [privacy, setPrivacy] = useState({
        profile_visibility: "public",
        phone_visibility: "members",
        show_rating: true,
        show_trip_history: false,
    })

    // Preferences
    const [preferences, setPreferences] = useState({
        language: "fr",
        currency: "TND",
        timezone: "Africa/Tunis",
        distance_unit: "km",
    })

    // Security settings
    const [security, setSecurity] = useState({
        two_factor_enabled: false,
        login_notifications: true,
        session_timeout: "30",
    })

    const handleNotificationChange = (key: string, value: boolean) => {
        setNotifications((prev) => ({ ...prev, [key]: value }))
    }

    const handlePrivacyChange = (key: string, value: string | boolean) => {
        setPrivacy((prev) => ({ ...prev, [key]: value }))
    }

    const handlePreferenceChange = (key: string, value: string) => {
        setPreferences((prev) => ({ ...prev, [key]: value }))
    }

    const handleSecurityChange = (key: string, value: boolean | string) => {
        setSecurity((prev) => ({ ...prev, [key]: value }))
    }

    const handleSaveSettings = async () => {
        try {
            // API call would go here
            toast({
                title: "Paramètres sauvegardés",
                description: "Vos paramètres ont été mis à jour avec succès.",
            })
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de sauvegarder les paramètres.",
                variant: "destructive",
            })
        }
    }

    const handleChangePassword = async () => {
        try {
            // API call would go here
            toast({
                title: "Mot de passe modifié",
                description: "Votre mot de passe a été modifié avec succès.",
            })
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de modifier le mot de passe.",
                variant: "destructive",
            })
        }
    }

    const handleDeleteAccount = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
            try {
                // API call would go here
                toast({
                    title: "Compte supprimé",
                    description: "Votre compte a été supprimé avec succès.",
                })
            } catch (error) {
                toast({
                    title: "Erreur",
                    description: "Impossible de supprimer le compte.",
                    variant: "destructive",
                })
            }
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
                    <p className="text-gray-600 mt-1">Gérez vos préférences et paramètres de compte</p>
                </div>

                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>Informations du profil</span>
                        </CardTitle>
                        <CardDescription>Vos informations personnelles et de contact</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">Prénom</Label>
                                <Input id="first_name" defaultValue={user?.first_name || ""} placeholder="Votre prénom" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Nom</Label>
                                <Input id="last_name" defaultValue={user?.last_name || ""} placeholder="Votre nom" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <Input id="email" type="email" defaultValue={user?.email || ""} placeholder="votre@email.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <Input id="phone" type="tel" defaultValue={user?.phone || ""} placeholder="+216 XX XXX XXX" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Bell className="h-5 w-5" />
                            <span>Notifications</span>
                        </CardTitle>
                        <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h4 className="font-medium mb-3">Notifications par email</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Réservations</p>
                                        <p className="text-sm text-gray-600">Nouvelles réservations et confirmations</p>
                                    </div>
                                    <Switch
                                        checked={notifications.email_bookings}
                                        onCheckedChange={(checked) => handleNotificationChange("email_bookings", checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Messages</p>
                                        <p className="text-sm text-gray-600">Nouveaux messages des autres utilisateurs</p>
                                    </div>
                                    <Switch
                                        checked={notifications.email_messages}
                                        onCheckedChange={(checked) => handleNotificationChange("email_messages", checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Promotions</p>
                                        <p className="text-sm text-gray-600">Offres spéciales et nouveautés</p>
                                    </div>
                                    <Switch
                                        checked={notifications.email_promotions}
                                        onCheckedChange={(checked) => handleNotificationChange("email_promotions", checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-medium mb-3">Notifications push</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Réservations</p>
                                        <p className="text-sm text-gray-600">Notifications instantanées sur votre appareil</p>
                                    </div>
                                    <Switch
                                        checked={notifications.push_bookings}
                                        onCheckedChange={(checked) => handleNotificationChange("push_bookings", checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Messages</p>
                                        <p className="text-sm text-gray-600">Nouveaux messages en temps réel</p>
                                    </div>
                                    <Switch
                                        checked={notifications.push_messages}
                                        onCheckedChange={(checked) => handleNotificationChange("push_messages", checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-medium mb-3">Notifications SMS</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Réservations importantes</p>
                                        <p className="text-sm text-gray-600">Confirmations et annulations</p>
                                    </div>
                                    <Switch
                                        checked={notifications.sms_bookings}
                                        onCheckedChange={(checked) => handleNotificationChange("sms_bookings", checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Shield className="h-5 w-5" />
                            <span>Confidentialité</span>
                        </CardTitle>
                        <CardDescription>Contrôlez qui peut voir vos informations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="profile_visibility">Visibilité du profil</Label>
                            <Select
                                value={privacy.profile_visibility}
                                onValueChange={(value) => handlePrivacyChange("profile_visibility", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="members">Membres uniquement</SelectItem>
                                    <SelectItem value="private">Privé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_visibility">Visibilité du téléphone</Label>
                            <Select
                                value={privacy.phone_visibility}
                                onValueChange={(value) => handlePrivacyChange("phone_visibility", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="members">Membres uniquement</SelectItem>
                                    <SelectItem value="bookings">Réservations uniquement</SelectItem>
                                    <SelectItem value="private">Privé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Afficher ma note</p>
                                <p className="text-sm text-gray-600">Permettre aux autres de voir votre note moyenne</p>
                            </div>
                            <Switch
                                checked={privacy.show_rating}
                                onCheckedChange={(checked) => handlePrivacyChange("show_rating", checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Historique des trajets</p>
                                <p className="text-sm text-gray-600">Afficher vos trajets précédents sur votre profil</p>
                            </div>
                            <Switch
                                checked={privacy.show_trip_history}
                                onCheckedChange={(checked) => handlePrivacyChange("show_trip_history", checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Globe className="h-5 w-5" />
                            <span>Préférences</span>
                        </CardTitle>
                        <CardDescription>Personnalisez votre expérience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="language">Langue</Label>
                                <Select
                                    value={preferences.language}
                                    onValueChange={(value) => handlePreferenceChange("language", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fr">Français</SelectItem>
                                        <SelectItem value="ar">العربية</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency">Devise</Label>
                                <Select
                                    value={preferences.currency}
                                    onValueChange={(value) => handlePreferenceChange("currency", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TND">Dinar Tunisien (TND)</SelectItem>
                                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                        <SelectItem value="USD">Dollar US (USD)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Fuseau horaire</Label>
                                <Select
                                    value={preferences.timezone}
                                    onValueChange={(value) => handlePreferenceChange("timezone", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Africa/Tunis">Tunis (GMT+1)</SelectItem>
                                        <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="distance_unit">Unité de distance</Label>
                                <Select
                                    value={preferences.distance_unit}
                                    onValueChange={(value) => handlePreferenceChange("distance_unit", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="km">Kilomètres</SelectItem>
                                        <SelectItem value="mi">Miles</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Shield className="h-5 w-5" />
                            <span>Sécurité</span>
                        </CardTitle>
                        <CardDescription>Protégez votre compte</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Authentification à deux facteurs</p>
                                <p className="text-sm text-gray-600">Sécurisez votre compte avec un code SMS</p>
                            </div>
                            <Switch
                                checked={security.two_factor_enabled}
                                onCheckedChange={(checked) => handleSecurityChange("two_factor_enabled", checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Notifications de connexion</p>
                                <p className="text-sm text-gray-600">Être notifié des nouvelles connexions</p>
                            </div>
                            <Switch
                                checked={security.login_notifications}
                                onCheckedChange={(checked) => handleSecurityChange("login_notifications", checked)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="session_timeout">Expiration de session (minutes)</Label>
                            <Select
                                value={security.session_timeout}
                                onValueChange={(value) => handleSecurityChange("session_timeout", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="60">1 heure</SelectItem>
                                    <SelectItem value="120">2 heures</SelectItem>
                                    <SelectItem value="0">Jamais</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <Button onClick={handleChangePassword} variant="outline" className="w-full bg-transparent">
                                Changer le mot de passe
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            <span>Zone de danger</span>
                        </CardTitle>
                        <CardDescription>Actions irréversibles sur votre compte</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-red-50 rounded-lg">
                            <h4 className="font-medium text-red-900 mb-2">Supprimer le compte</h4>
                            <p className="text-sm text-red-700 mb-4">
                                Cette action supprimera définitivement votre compte et toutes vos données. Cette action ne peut pas être
                                annulée.
                            </p>
                            <Button onClick={handleDeleteAccount} variant="destructive" className="flex items-center space-x-2">
                                <Trash2 className="h-4 w-4" />
                                <span>Supprimer mon compte</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700">
                        Sauvegarder les paramètres
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    )
}
