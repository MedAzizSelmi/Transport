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
