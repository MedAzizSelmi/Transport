"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useCommunity } from "@/hooks/useApi"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users, MapPin, Settings, UserPlus, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

export default function CommunityDetailPage() {
    const params = useParams()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const communityId = Number(params.id)
    const { data: community, isLoading, refetch } = useCommunity(communityId)

    const handleJoinCommunity = async () => {
        setLoading(true)
        try {
            await api.post(`/communities/${communityId}/join/`)
            toast({
                title: "Succès",
                description: "Vous avez rejoint la communauté avec succès !",
            })
            refetch()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.error || "Erreur lors de l'adhésion",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleLeaveCommunity = async () => {
        setLoading(true)
        try {
            await api.post(`/communities/${communityId}/leave/`)
            toast({
                title: "Succès",
                description: "Vous avez quitté la communauté",
            })
            refetch()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.error || "Erreur lors de la sortie",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const getCommunityTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            work: "Domicile-Travail",
            school: "Trajets scolaires",
            events: "Événements",
            shopping: "Shopping",
            other: "Autre",
        }
        return types[type] || type
    }

    const getCommunityTypeBadgeColor = (type: string) => {
        const colors: Record<string, string> = {
            work: "bg-blue-100 text-blue-800",
            school: "bg-green-100 text-green-800",
            events: "bg-purple-100 text-purple-800",
            shopping: "bg-orange-100 text-orange-800",
            other: "bg-gray-100 text-gray-800",
        }
        return colors[type] || "bg-gray-100 text-gray-800"
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            </DashboardLayout>
        )
    }

    if (!community) {
        return (
            <DashboardLayout>
                <Card>
                    <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Communauté non trouvée</h3>
                        <p className="text-gray-500 mb-4">Cette communauté n'existe pas ou a été supprimée.</p>
                        <Link href="/communities">
                            <Button>Retour aux communautés</Button>
                        </Link>
                    </CardContent>
                </Card>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/communities">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                </div>

                {/* Community Header */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Users className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <MapPin className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">{community.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 mb-4">
                                    <Badge className={getCommunityTypeBadgeColor(community.community_type)}>
                                        {getCommunityTypeLabel(community.community_type)}
                                    </Badge>
                                    {community.is_private && <Badge variant="outline">Privée</Badge>}
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Users className="h-4 w-4 mr-1" />
                                        {community.member_count} / {community.max_members} membres
                                    </div>
                                </div>

                                <p className="text-gray-700">{community.description}</p>
                            </div>

                            <div className="ml-6 flex flex-col space-y-2">
                                {!community.is_member ? (
                                    <Button
                                        onClick={handleJoinCommunity}
                                        disabled={loading || community.member_count >= community.max_members}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        {loading ? "..." : "Rejoindre"}
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleLeaveCommunity}
                                            disabled={loading}
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700 bg-transparent"
                                        >
                                            Quitter
                                        </Button>
                                        {community.user_role === "admin" && (
                                            <Button variant="outline" size="sm">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Gérer
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Activité récente</CardTitle>
                            <CardDescription>Derniers trajets et événements de la communauté</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-gray-500">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p>Aucune activité récente</p>
                                <p className="text-sm">Les trajets et discussions apparaîtront ici</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Members */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Membres</CardTitle>
                            <CardDescription>{community.member_count} membres</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* Creator */}
                                <div className="flex items-center space-x-3 p-2 rounded-lg bg-green-50">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={community.creator?.profile_picture || "/placeholder.svg"} />
                                        <AvatarFallback>
                                            {community.creator?.first_name?.[0]}
                                            {community.creator?.last_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {community.creator?.first_name} {community.creator?.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500">Créateur</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800 text-xs">Admin</Badge>
                                </div>

                                {/* Placeholder for other members */}
                                <div className="text-center py-4 text-gray-500">
                                    <Users className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm">Autres membres</p>
                                    <p className="text-xs">La liste complète sera disponible bientôt</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-green-600">0</div>
                            <p className="text-sm text-gray-500">Trajets actifs</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-blue-600">0</div>
                            <p className="text-sm text-gray-500">Trajets ce mois</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-purple-600">{community.member_count}</div>
                            <p className="text-sm text-gray-500">Membres actifs</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-orange-600">0€</div>
                            <p className="text-sm text-gray-500">Économies totales</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
