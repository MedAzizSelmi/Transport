"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

// Communities hooks
export function useCommunities(params?: any) {
    return useQuery({
        queryKey: ["communities", params],
        queryFn: async () => {
            const response = await api.get("/communities/", { params })
            return response.data
        },
    })
}

export function useCommunity(id: number) {
    return useQuery({
        queryKey: ["community", id],
        queryFn: async () => {
            const response = await api.get(`/communities/${id}/`)
            return response.data
        },
        enabled: !!id,
    })
}

export function useJoinCommunity() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (communityId: number) => {
            const response = await api.post(`/communities/${communityId}/join/`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["communities"] })
        },
    })
}

// Trips hooks
export function useTrips(params?: any) {
    return useQuery({
        queryKey: ["trips", params],
        queryFn: async () => {
            const response = await api.get("/trips/", { params })
            return response.data
        },
    })
}

export function useMyTrips(type?: string) {
    return useQuery({
        queryKey: ["my-trips", type],
        queryFn: async () => {
            const response = await api.get("/trips/my-trips/", {
                params: type ? { type } : {},
            })
            return response.data
        },
    })
}

export function useCreateTrip() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (tripData: any) => {
            const response = await api.post("/trips/", tripData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trips"] })
            queryClient.invalidateQueries({ queryKey: ["my-trips"] })
        },
    })
}

// Vehicles hooks
export function useVehicles() {
    return useQuery({
        queryKey: ["vehicles"],
        queryFn: async () => {
            const response = await api.get("/auth/vehicles/")
            return response.data
        },
    })
}

export function useCreateVehicle() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (vehicleData: any) => {
            const response = await api.post("/auth/vehicles/", vehicleData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] })
        },
    })
}

export function useUpdateVehicle() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            const response = await api.put(`/auth/vehicles/${id}/`, data)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] })
        },
    })
}

export function useDeleteVehicle() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await api.delete(`/auth/vehicles/${id}/`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] })
        },
    })
}

// Bookings hooks
export function useBookings(params?: any) {
    return useQuery({
        queryKey: ["bookings", params],
        queryFn: async () => {
            const response = await api.get("/bookings/", { params })
            return response.data
        },
    })
}

export function useCreateBooking() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ tripId, bookingData }: { tripId: number; bookingData: any }) => {
            const response = await api.post(`/trips/${tripId}/book/`, bookingData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] })
            queryClient.invalidateQueries({ queryKey: ["trips"] })
        },
    })
}

export function useCancelBooking() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (bookingId: number) => {
            const response = await api.post(`/bookings/${bookingId}/cancel/`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] })
            queryClient.invalidateQueries({ queryKey: ["trips"] })
        },
    })
}

// Ratings hooks
export function useRatings(params?: any) {
    return useQuery({
        queryKey: ["ratings", params],
        queryFn: async () => {
            const response = await api.get("/ratings/my-ratings/", { params })
            return response.data
        },
    })
}

export function useUserRatings(userId: number, params?: any) {
    return useQuery({
        queryKey: ["user-ratings", userId, params],
        queryFn: async () => {
            const response = await api.get(`/ratings/user/${userId}/`, { params })
            return response.data
        },
        enabled: !!userId,
    })
}

export function useUserRatingStats(userId: number) {
    return useQuery({
        queryKey: ["user-rating-stats", userId],
        queryFn: async () => {
            const response = await api.get(`/ratings/user/${userId}/stats/`)
            return response.data
        },
        enabled: !!userId,
    })
}

export function useCreateRating() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ tripId, userId, ratingData }: { tripId: number; userId: number; ratingData: any }) => {
            const response = await api.post(`/ratings/trip/${tripId}/user/${userId}/`, ratingData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ratings"] })
            queryClient.invalidateQueries({ queryKey: ["user-ratings"] })
            queryClient.invalidateQueries({ queryKey: ["user-rating-stats"] })
        },
    })
}
