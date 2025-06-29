import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Car, MapPin, Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">EcoMobility</span>
              </div>
              <div className="flex space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button>S'inscrire</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Transport Collaboratif
              <span className="text-green-600 block">Durable et Communautaire</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Rejoignez des communautés locales, partagez vos trajets et contribuez à un transport plus écologique.
              Connectez-vous avec des conducteurs et passagers de confiance.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Commencer maintenant
                </Button>
              </Link>
              <Link href="/communities">
                <Button size="lg" variant="outline">
                  Découvrir les communautés
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir EcoMobility ?</h2>
              <p className="text-lg text-gray-600">
                Une plateforme complète pour tous vos besoins de transport collaboratif
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-green-600 mb-4" />
                  <CardTitle>Communautés</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Rejoignez des groupes thématiques : travail, école, événements, shopping
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <MapPin className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle>Trajets Optimisés</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Trouvez facilement des trajets correspondant à vos besoins et horaires
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Star className="h-12 w-12 text-yellow-600 mb-4" />
                  <CardTitle>Système de Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Évaluez et soyez évalué pour maintenir une communauté de confiance</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Car className="h-12 w-12 text-purple-600 mb-4" />
                  <CardTitle>Gestion Véhicules</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Gérez vos véhicules et optimisez vos trajets en tant que conducteur</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-green-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center text-white">
              <div>
                <div className="text-4xl font-bold mb-2">1000+</div>
                <div className="text-green-100">Utilisateurs actifs</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-green-100">Communautés</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5000+</div>
                <div className="text-green-100">Trajets partagés</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Car className="h-6 w-6 text-green-400 mr-2" />
                  <span className="text-xl font-bold">EcoMobility</span>
                </div>
                <p className="text-gray-400">Solution de transport durable pour des communautés connectées.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Produit</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/communities">Communautés</Link>
                  </li>
                  <li>
                    <Link href="/trips">Trajets</Link>
                  </li>
                  <li>
                    <Link href="/how-it-works">Comment ça marche</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/help">Aide</Link>
                  </li>
                  <li>
                    <Link href="/contact">Contact</Link>
                  </li>
                  <li>
                    <Link href="/faq">FAQ</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Légal</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/privacy">Confidentialité</Link>
                  </li>
                  <li>
                    <Link href="/terms">Conditions</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 EcoMobility. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
  )
}
