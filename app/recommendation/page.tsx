"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Leaf, MapPin, Thermometer, Droplets, Loader2 } from "lucide-react"
import { supabase } from '@/lib/supabase' // (if needed in future)

export default function RecommendationPage() {
  const [formData, setFormData] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<{ [key: number]: 'success' | 'error' | null }>({})
  const [saveMessage, setSaveMessage] = useState<{ [key: number]: string | null }>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateRecommendations = async () => {
    setIsAnalyzing(true)
    setRecommendations([])
    setError(null)
    setSaveStatus({})
    setSaveMessage({})
    try {
      const res = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          N: Number(formData.N),
          P: Number(formData.P),
          K: Number(formData.K),
          temperature: Number(formData.temperature),
          humidity: Number(formData.humidity),
          ph: Number(formData.ph),
          rainfall: Number(formData.rainfall),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "An unknown error occurred.")
      }

      const data = await res.json()
      setRecommendations(data.crops || [])
    } catch (err: any) {
      setError(err.message)
    }
    setIsAnalyzing(false)
  }

  const isLoggedIn = () => {
    return Boolean(localStorage.getItem('user'))
  }

  const handleSaveToProfile = async (rec: any, index: number) => {
    setSaveStatus((prev) => ({ ...prev, [index]: null }))
    setSaveMessage((prev) => ({ ...prev, [index]: null }))
    if (!isLoggedIn()) {
      setSaveStatus((prev) => ({ ...prev, [index]: 'error' }))
      setSaveMessage((prev) => ({ ...prev, [index]: 'You have to login to save the info' }))
      return
    }
    try {
      const response = await fetch('/api/save-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: rec.crop,
          suitability: rec.suitability,
          profit: rec.profit,
          expected_yield: rec.expected_yield,
          best_season: rec.best_season,
          why_recommended: rec.why_recommended
        })
      })
      if (!response.ok) throw new Error('Failed to save recommendation')
      setSaveStatus((prev) => ({ ...prev, [index]: 'success' }))
      setSaveMessage((prev) => ({ ...prev, [index]: 'Recommendation saved to your profile!' }))
    } catch (err: any) {
      setSaveStatus((prev) => ({ ...prev, [index]: 'error' }))
      setSaveMessage((prev) => ({ ...prev, [index]: err.message || 'Error saving recommendation' }))
    }
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Crop Recommendation</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get personalized crop recommendations based on your location, soil, and climate conditions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Farm Details
                </CardTitle>
                <CardDescription>Provide information about your farm conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="N">Nitrogen (kg/ha)</Label>
                  <Input id="N" type="number" placeholder="e.g., 90" value={formData.N} onChange={e => handleInputChange("N", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="P">Phosphorous (kg/ha)</Label>
                  <Input id="P" type="number" placeholder="e.g., 45" value={formData.P} onChange={e => handleInputChange("P", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="K">Potassium (kg/ha)</Label>
                  <Input id="K" type="number" placeholder="e.g., 40" value={formData.K} onChange={e => handleInputChange("K", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input id="temperature" type="number" placeholder="e.g., 25.5" value={formData.temperature} onChange={e => handleInputChange("temperature", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input id="humidity" type="number" placeholder="e.g., 80.2" value={formData.humidity} onChange={e => handleInputChange("humidity", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ph">Soil pH</Label>
                  <Input id="ph" type="number" placeholder="e.g., 6.5" value={formData.ph} onChange={e => handleInputChange("ph", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rainfall">Rainfall (mm)</Label>
                  <Input id="rainfall" type="number" placeholder="e.g., 200" value={formData.rainfall} onChange={e => handleInputChange("rainfall", e.target.value)} />
                </div>
                <Button onClick={generateRecommendations} disabled={isAnalyzing} className="w-full" size="lg">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Get Recommendations"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Recommended Crops
                </CardTitle>
                <CardDescription>AI-powered crop recommendations based on your farm conditions</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-center py-12 text-red-500 dark:text-red-400">
                    <p className="font-semibold">An error occurred</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                )}

                {!recommendations.length && !isAnalyzing && !error && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Fill in your farm details to get personalized crop recommendations
                  </div>
                )}

                {isAnalyzing && (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
                    <p className="text-gray-600 dark:text-gray-300">Analyzing your farm conditions...</p>
                  </div>
                )}

                {recommendations.length > 0 && (
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{rec.crop}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {rec.suitability && <Badge variant="secondary">{rec.suitability}% Suitable</Badge>}
                                {rec.profit && (
                                  <Badge variant={rec.profit === "High Profit" ? "default" : "outline"}>
                                    {rec.profit}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-300">Expected Yield</p>
                              <p className="font-semibold">{rec.expected_yield}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Best Season:</p>
                              <Badge variant="outline">{rec.best_season}</Badge>
                              <div className="flex items-center mt-2">
                                <Button
                                  className="text-xs px-4 py-1 rounded-md h-7"
                                  size="sm"
                                  onClick={() => handleSaveToProfile(rec, index)}
                                >
                                  SAVE TO PROFILE
                                </Button>
                              </div>
                              {saveMessage[index] && (
                                <div
                                  className={
                                    saveStatus[index] === 'success'
                                      ? 'mt-2 text-xs text-left text-green-700 bg-green-100 border border-green-200 rounded px-3 py-1'
                                      : 'mt-2 text-xs text-left text-red-600 bg-red-100 border border-red-200 rounded px-3 py-1'
                                  }
                                >
                                  {saveMessage[index]}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Why Recommended:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {rec.why_recommended && rec.why_recommended.map((reason: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {reason}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Climate Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Our AI considers temperature, humidity, rainfall patterns, and seasonal variations to recommend the most
                suitable crops.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Soil Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Soil type, pH levels, nutrient content, and drainage capabilities are analyzed to match crops with
                optimal growing conditions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Recommendations include market demand, pricing trends, and profitability analysis to maximize your
                farming returns.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
