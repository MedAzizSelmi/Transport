"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRatings, useUserRatingStats } from "@/hooks/useApi"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, User, Calendar, MapPin, MessageSquare, TrendingUp } from "lucide-react"

const criteriaLabels = {
    punctuality: "Ponctualité",
    communication: "Communication",
    cleanliness: "Propreté",
    safety: "Sécurité",
    respect: "Respect",
}

export default function RatingsPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState("received")

    const { data: receivedRatings, isLoading: loadingReceived } = useRatings({ type: "received" })
    const { data: givenRatings, isLoading: loadingGiven } = useRatings({ type: "given" })
    const { data: ratingStats, isLoading: loadingStats } = useUserRatingStats(user?.id || 0)

    const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
        const sizeClasses = {
            sm: "h-3 w-3",
            md: "h-4 w-4",
            lg: "h-5 w-5",
        }

        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClasses[size]} ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                ))}
            </div>
        )
    }

    const renderCriteriaRating = (criteria: any) => {
        return (
            <div className="grid grid-cols-2 gap-3 mt-3">
                {Object.entries(criteria).map(([key, value]) => {
                    if (!value || !criteriaLabels[key as keyof typeof criteriaLabels]) return null
                    return (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{criteriaLabels[key as keyof typeof criteriaLabels]}</span>
                            {renderStars(value as number, "sm")}
                        </div>
                    )
                })}
            </div>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-TN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    if (loadingStats) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mes évaluations</h1>
                        <p className="text-gray-600 mt-1">Consultez vos évaluations reçues et données</p>
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
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mes évaluations</h1>
                    <p className="text-gray-600 mt-1">Consultez vos évaluations reçues et données</p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Note moyenne reçue</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {ratingStats?.overall_average_rating?.toFixed(1) || "0.0"}/5
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Note conducteur</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {ratingStats?.driver_average_rating?.toFixed(1) || "0.0"}/5
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Note passager</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {ratingStats?.passenger_average_rating?.toFixed(1) || "0.0"}/5
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Total évaluations</p>
                                    <p className="text-2xl font-bold text-purple-600">{ratingStats?.total_ratings || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Ratings Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="received">Évaluations reçues ({receivedRatings?.length || 0})</TabsTrigger>
                        <TabsTrigger value="given">Évaluations données ({givenRatings?.length || 0})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="received" className="space-y-4">
                        {loadingReceived ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <Card key={i}>
                                        <CardContent className="p-6">
                                            <Skeleton className="h-32 w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : !receivedRatings || receivedRatings.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune évaluation reçue</h3>
                                    <p className="text-gray-600">Vous n'avez pas encore reçu d'évaluations de vos passagers.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            receivedRatings.map((rating: any) => (
                                <Card key={rating.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg flex items-center space-x-2">
                                                    <User className="h-5 w-5 text-blue-600" />
                                                    <span>
                            {rating.rater?.first_name} {rating.rater?.last_name}
                          </span>
                                                </CardTitle>
                                                <CardDescription className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {rating.trip?.departure_location} → {rating.trip?.arrival_location}
                            </span>
                          </span>
                                                    <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(rating.trip?.departure_time)}</span>
                          </span>
                                                </CardDescription>
                                            </div>

                                            <div className="text-right">
                                                {renderStars(rating.score, "lg")}
                                                <p className="text-sm text-gray-600 mt-1">{formatDate(rating.created_at)}</p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {rating.comment && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-gray-700 italic">"{rating.comment}"</p>
                                            </div>
                                        )}

                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <h4 className="font-medium text-blue-900 mb-2">Détail des critères</h4>
                                            {renderCriteriaRating({
                                                punctuality: rating.punctuality,
                                                communication: rating.communication,
                                                cleanliness: rating.cleanliness,
                                                safety: rating.safety,
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="given" className="space-y-4">
                        {loadingGiven ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <Card key={i}>
                                        <CardContent className="p-6">
                                            <Skeleton className="h-32 w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : !givenRatings || givenRatings.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune évaluation donnée</h3>
                                    <p className="text-gray-600">Vous n'avez pas encore évalué de conducteurs ou passagers.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            givenRatings.map((rating: any) => (
                                <Card key={rating.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg flex items-center space-x-2">
                                                    <User className="h-5 w-5 text-green-600" />
                                                    <span>
                            {rating.rated_user?.first_name} {rating.rated_user?.last_name}
                          </span>
                                                </CardTitle>
                                                <CardDescription className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {rating.trip?.departure_location} → {rating.trip?.arrival_location}
                            </span>
                          </span>
                                                    <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(rating.trip?.departure_time)}</span>
                          </span>
                                                </CardDescription>
                                            </div>

                                            <div className="text-right">
                                                {renderStars(rating.score, "lg")}
                                                <p className="text-sm text-gray-600 mt-1">{formatDate(rating.created_at)}</p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {rating.comment && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-gray-700 italic">"{rating.comment}"</p>
                                            </div>
                                        )}

                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <h4 className="font-medium text-green-900 mb-2">Détail des critères</h4>
                                            {renderCriteriaRating({
                                                punctuality: rating.punctuality,
                                                communication: rating.communication,
                                                cleanliness: rating.cleanliness,
                                                safety: rating.safety,
                                            })}
                                        </div>
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
