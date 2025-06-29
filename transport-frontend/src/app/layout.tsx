import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { QueryProvider } from "@/providers/QueryProvider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "EcoMobility - Transport Collaboratif",
    description: "Plateforme de covoiturage et transport durable",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr">
        <body className={inter.className}>
        <QueryProvider>
            <AuthProvider>
                {children}
                <Toaster />
            </AuthProvider>
        </QueryProvider>
        </body>
        </html>
    )
}
