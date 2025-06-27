import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Brain, CloudRain, TrendingUp, Shield, Users, Target, Lightbulb, Heart, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
              Smart Agriculture with <span className="text-green-600 dark:text-green-400">AI Technology</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Predicting crop diseases and providing intelligent recommendations on which crops to harvest using
              advanced Convolutional Neural Networks
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/disease-prediction">Start Disease Detection</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/recommendation">Get Crop Recommendations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Agricultural Solutions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need for modern farming
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Disease Prediction</CardTitle>
                <CardDescription>Upload crop images to detect diseases using our advanced CNN models</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href="/disease-prediction">Try Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Crop Recommendation</CardTitle>
                <CardDescription>Get personalized crop recommendations based on soil and climate data</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href="/recommendation">Get Recommendations</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <CloudRain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Weather Forecasting</CardTitle>
                <CardDescription>Access accurate weather predictions to plan your farming activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href="/weather">Check Weather</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Empowering farmers worldwide with cutting-edge AI technology for sustainable agriculture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* What's Our Motive */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>What's Our Motive</CardTitle>
                <CardDescription>
                  To empower farmers with cutting-edge AI technology that helps them identify crop diseases early, 
                  reduce agricultural losses, and increase productivity for sustainable farming practices.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* What's our Future Plans */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>What's our Future Plans</CardTitle>
                <CardDescription>
                  Expanding our AI models to cover more crop varieties, integrating IoT sensors for real-time monitoring, 
                  and developing mobile applications for farmers in remote areas worldwide.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* What We Provide */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>What We Provide</CardTitle>
                <CardDescription>
                  Advanced disease detection, intelligent crop recommendations, accurate weather forecasting, 
                  and comprehensive agricultural insights powered by machine learning and data analytics.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">95%</h3>
              <p className="text-gray-600 dark:text-gray-300">Disease Detection Accuracy</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">22+</h3>
              <p className="text-gray-600 dark:text-gray-300">Crop Diseases Detected</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">100+</h3>
              <p className="text-gray-600 dark:text-gray-300">Farmers Helped</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join hundreds of farmers who are already using our AI-powered solutions to improve their crop yields and
              reduce losses.
            </p>
            <Button size="lg" asChild>
              <Link href="/disease-prediction">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}