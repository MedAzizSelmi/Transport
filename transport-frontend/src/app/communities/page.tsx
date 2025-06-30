"use client"

import { useState } from "react"
import { useCommunities, useJoinCommunity } from "@/hooks/useApi"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, MapPin, Search, Plus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function CommunitiesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState("all")
    const [selectedLocation, setSelectedLocation] = useState("")

    const { toast } = useToast()
    const joinCommunityMutation = useJoinCommunity()

    const { data: communitiesData, isLoading } = useCommunities({
        search: searchTerm,
        type: selectedType !== "all" ? selectedType : undefined,
        location: selectedLocation,
    })

    const communities = communitiesData?.results || []

    const handleJoinCommunity = async (communityId: number) => {
        try {
            await joinCommunityMutation.mutateAsync(communityId)
            toast({
                title: "Succès",
                description: "Vous avez rejoint la communauté avec succès !",
            })
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.error || "Erreur lors de l'adhésion",
                variant: "destructive",
            })
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Communautés</h1>
                        <p className="text-gray-600 mt-1">Rejoignez des groupes de covoiturage près de chez vous</p>
                    </div>
                    <Link href="/communities/create">
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Créer une communauté
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Rechercher des communautés</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Rechercher par nom..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type de communauté" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    <SelectItem value="work">Domicile-Travail</SelectItem>
                                    <SelectItem value="school">Trajets scolaires</SelectItem>
                                    <SelectItem value="events">Événements</SelectItem>
                                    <SelectItem value="shopping">Shopping</SelectItem>
                                    <SelectItem value="other">Autre</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Localisation..."
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Communities Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : communities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {communities.map((community: any) => (
                            <Card key={community.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{community.name}</CardTitle>
                                            <CardDescription className="flex items-center mt-1">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {community.location}
                                            </CardDescription>
                                        </div>
                                        <Badge className={getCommunityTypeBadgeColor(community.community_type)}>
                                            {getCommunityTypeLabel(community.community_type)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{community.description}</p>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Users className="h-4 w-4 mr-1" />
                                            {community.member_count} / {community.max_members} membres
                                        </div>
                                        {community.is_private && (
                                            <Badge variant="outline" className="text-xs">
                                                Privée
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex space-x-2">
                                        <Link href={`/communities/${community.id}`} className="flex-1">
                                            <Button variant="outline" className="w-full bg-transparent">
                                                Voir détails
                                            </Button>
                                        </Link>

                                        {!community.is_member ? (
                                            <Button
                                                onClick={() => handleJoinCommunity(community.id)}
                                                disabled={joinCommunityMutation.isPending || community.member_count >= community.max_members}
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                {joinCommunityMutation.isPending ? "..." : "Rejoindre"}
                                            </Button>
                                        ) : (
                                            <Button variant="secondary" disabled className="flex-1">
                                                Membre
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune communauté trouvée</h3>
                            <p className="text-gray-500 mb-4">
                                Essayez de modifier vos critères de recherche ou créez une nouvelle communauté.
                            </p>
                            <Link href="/communities/create">
                                <Button className="bg-green-600 hover:bg-green-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Créer une communauté
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
