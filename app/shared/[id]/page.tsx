"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Leaf, 
  Calendar,
  Thermometer,
  Droplets,
  Sun,
  Bug,
  Microscope,
  BookOpen,
  Download,
  Share2,
  Loader2,
  Copy,
  MessageCircle,
  Mail,
  ExternalLink
} from "lucide-react"
import Image from "next/image"
import { generateDiseasePDF } from "@/lib/pdf-generator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DiseaseDetails {
  disease: string
  confidence: number
  severity: string
  treatment: string
  prevention: string
  imageUrl: string
}

export default function SharedReportPage() {
  const params = useParams()
  const router = useRouter()
  const [diseaseData, setDiseaseData] = useState<DiseaseDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const fetchSharedReport = async () => {
      try {
        const response = await fetch(`/api/share/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Report not found')
          } else if (response.status === 410) {
            setError('This report has expired')
          } else {
            setError('Failed to load report')
          }
          return
        }
        
        const data = await response.json()
        setDiseaseData({
          disease: data.disease,
          confidence: data.confidence,
          severity: data.severity,
          treatment: data.treatment,
          prevention: data.prevention,
          imageUrl: data.imageUrl
        })
      } catch (err) {
        setError('Failed to load report')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchSharedReport()
    }
  }, [params.id])

  const getDetailedTreatment = (disease: string, basicTreatment: string) => {
    // Enhanced treatment recommendations based on disease type
    const treatments = {
      "Tomato Curl Virus": [
        "Remove and destroy infected plants immediately to prevent spread",
        "Apply systemic insecticides to control whitefly vectors (Imidacloprid 17.8% SL @ 0.3ml/L)",
        "Use reflective mulches (silver/aluminum) to repel whiteflies",
        "Spray neem oil (1500 ppm) every 7-10 days as organic treatment",
        "Install yellow sticky traps around the field perimeter",
        "Apply micronutrient spray containing Zinc and Boron",
        "Maintain proper plant spacing for better air circulation",
        "Use resistant varieties like Arka Vikas or Pusa Ruby for future planting"
      ],
      "Apple Cedar Rust": [
        "Apply fungicide sprays during wet spring weather (Myclobutanil @ 1ml/L)",
        "Remove nearby juniper trees within 2-mile radius if possible",
        "Prune infected branches 6 inches below visible symptoms",
        "Apply copper-based fungicides during dormant season",
        "Use systemic fungicides like Propiconazole during active growth",
        "Improve air circulation by proper pruning and spacing",
        "Apply lime sulfur spray during dormant season",
        "Consider resistant apple varieties for replanting"
      ],
      "Healthy": [
        "Continue current management practices",
        "Maintain regular monitoring schedule",
        "Apply balanced fertilizer as per soil test recommendations",
        "Ensure adequate irrigation without waterlogging",
        "Practice crop rotation to maintain soil health",
        "Monitor for early signs of pest or disease pressure"
      ]
    }

    return treatments[disease as keyof typeof treatments] || [
      basicTreatment,
      "Consult with local agricultural extension officer",
      "Apply appropriate fungicide or pesticide as recommended",
      "Improve cultural practices and field sanitation",
      "Monitor weather conditions and adjust treatments accordingly"
    ]
  }

  const getDetailedPrevention = (disease: string, basicPrevention: string) => {
    // Enhanced prevention strategies
    const preventions = {
      "Tomato Curl Virus": [
        "Use virus-free certified seeds and seedlings",
        "Install fine mesh nets (40-50 mesh) in nurseries and greenhouses",
        "Maintain weed-free environment around crop fields",
        "Practice crop rotation with non-host crops like cereals",
        "Plant marigold or basil as companion crops to repel whiteflies",
        "Avoid planting near cotton, okra, or other whitefly host crops",
        "Use soil solarization during off-season to reduce soil-borne inoculum",
        "Implement integrated pest management (IPM) practices"
      ],
      "Apple Cedar Rust": [
        "Plant disease-resistant apple varieties",
        "Maintain proper orchard sanitation and remove fallen leaves",
        "Ensure adequate spacing between trees for air circulation",
        "Avoid overhead irrigation; use drip irrigation instead",
        "Remove alternate hosts (juniper species) from vicinity",
        "Apply preventive fungicide sprays before symptom appearance",
        "Monitor weather conditions and spray before rain events",
        "Practice balanced fertilization to avoid excessive nitrogen"
      ],
      "Healthy": [
        "Continue regular field monitoring and scouting",
        "Maintain optimal soil pH and nutrient levels",
        "Practice integrated pest and disease management",
        "Use certified disease-free planting material",
        "Implement proper crop rotation schedules",
        "Maintain field hygiene and sanitation practices"
      ]
    }

    return preventions[disease as keyof typeof preventions] || [
      basicPrevention,
      "Use resistant varieties when available",
      "Practice good field sanitation",
      "Monitor environmental conditions regularly",
      "Implement integrated management strategies"
    ]
  }

  const getDiseaseInfo = (disease: string) => {
    const diseaseInfo = {
      "Tomato Curl Virus": {
        scientificName: "Tomato leaf curl virus (ToLCV)",
        pathogenType: "Begomovirus",
        transmissionMode: "Whitefly (Bemisia tabaci)",
        hostRange: "Tomato, tobacco, chili, okra",
        economicImpact: "Can cause 20-100% yield loss",
        geographicalDistribution: "Tropical and subtropical regions worldwide",
        symptoms: "Upward curling of leaves, yellowing, stunted growth, reduced fruit size",
        favorableConditions: "High temperature (25-35°C), high humidity, whitefly presence"
      },
      "Apple Cedar Rust": {
        scientificName: "Gymnosporangium juniperi-virginianae",
        pathogenType: "Fungal pathogen",
        transmissionMode: "Wind-borne spores",
        hostRange: "Apple, crabapple, juniper species",
        economicImpact: "Moderate to severe defoliation, reduced fruit quality",
        geographicalDistribution: "Eastern North America, parts of Europe",
        symptoms: "Orange spots on leaves, premature defoliation, fruit lesions",
        favorableConditions: "Cool, wet spring weather, presence of alternate hosts"
      },
      "Healthy": {
        scientificName: "No pathogen detected",
        pathogenType: "N/A",
        transmissionMode: "N/A",
        hostRange: "N/A",
        economicImpact: "No economic loss",
        geographicalDistribution: "N/A",
        symptoms: "No disease symptoms observed",
        favorableConditions: "Optimal growing conditions maintained"
      }
    }

    return diseaseInfo[disease as keyof typeof diseaseInfo] || {
      scientificName: "Unknown",
      pathogenType: "Unknown",
      transmissionMode: "Unknown",
      hostRange: "Unknown",
      economicImpact: "Unknown",
      geographicalDistribution: "Unknown",
      symptoms: "Consult agricultural expert for detailed information",
      favorableConditions: "Variable"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const handleDownloadReport = async () => {
    if (!diseaseData) return

    setIsGeneratingPDF(true)
    try {
      const diseaseInfo = getDiseaseInfo(diseaseData.disease)
      const detailedTreatment = getDetailedTreatment(diseaseData.disease, diseaseData.treatment)
      const detailedPrevention = getDetailedPrevention(diseaseData.disease, diseaseData.prevention)

      await generateDiseasePDF(diseaseData, diseaseInfo, detailedTreatment, detailedPrevention)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF report. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const createShareableContent = () => {
    if (!diseaseData) return { title: '', text: '', url: '' }

    const isHealthy = diseaseData.disease === 'Healthy'
    const status = isHealthy ? '✅ Healthy Crop' : '⚠️ Disease Detected'
    
    const title = `🌾 Crop Analysis Report: ${diseaseData.disease}`
    
    const text = `${status}

🔬 Disease: ${diseaseData.disease}
📊 Confidence: ${diseaseData.confidence}%
⚡ Severity: ${diseaseData.severity}

${isHealthy ? 
  '✅ Your crop appears healthy! Continue with current management practices.' : 
  `🚨 Treatment needed: ${diseaseData.treatment.substring(0, 100)}...`
}

📱 Analyzed with Crop Care AI - Advanced disease detection for farmers

🔗 View full report:`

    return { title, text, url: `${process.env.NEXT_PUBLIC_SITE_URL}/shared/${params.id}` }
  }

  const handleNativeShare = async () => {
    const { title, text, url } = createShareableContent()
    
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      await handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SITE_URL}/shared/${params.id}`)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleWhatsAppShare = () => {
    const { text, url } = createShareableContent()
    const whatsappText = encodeURIComponent(`${text}\n\n${url}`)
    window.open(`https://wa.me/?text=${whatsappText}`, '_blank')
  }

  const handleEmailShare = () => {
    const { title, text, url } = createShareableContent()
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${text}\n\n${url}`)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  const handleSMSShare = () => {
    const { text, url } = createShareableContent()
    const smsText = encodeURIComponent(`${text}\n\n${url}`)
    window.open(`sms:?body=${smsText}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading shared report...</p>
        </div>
      </div>
    )
  }

  if (error || !diseaseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Report Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
              {error || 'This report could not be found or has expired.'}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                Go to Home
              </Button>
              <Button onClick={() => router.push('/disease-prediction')} className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Try Crop Care
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const diseaseInfo = getDiseaseInfo(diseaseData.disease)
  const detailedTreatment = getDetailedTreatment(diseaseData.disease, diseaseData.treatment)
  const detailedPrevention = getDetailedPrevention(diseaseData.disease, diseaseData.prevention)

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-green-700">Crop Care</span>
            </div>
            <Badge variant="outline">Shared Report</Badge>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleNativeShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share via System
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  {copySuccess ? 'Copied!' : 'Copy Link'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleWhatsAppShare}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Share on WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEmailShare}>
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSMSShare}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Share via SMS
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              onClick={handleDownloadReport}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="h-5 w-5" />
                  Analysis Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image */}
                <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={diseaseData.imageUrl}
                    alt="Analyzed crop image"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{diseaseData.disease}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getConfidenceColor(diseaseData.confidence)} border`}>
                        {diseaseData.confidence}% Confidence
                      </Badge>
                      <Badge className={`${getSeverityColor(diseaseData.severity)} border`}>
                        {diseaseData.severity} Severity
                      </Badge>
                      <Badge variant={diseaseData.disease === 'Healthy' ? 'default' : 'destructive'}>
                        {diseaseData.disease === 'Healthy' ? 'Healthy' : 'Disease Detected'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Disease Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Disease Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Scientific Name:</span>
                        <p className="text-gray-600 dark:text-gray-300">{diseaseInfo.scientificName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Pathogen Type:</span>
                        <p className="text-gray-600 dark:text-gray-300">{diseaseInfo.pathogenType}</p>
                      </div>
                      <div>
                        <span className="font-medium">Transmission:</span>
                        <p className="text-gray-600 dark:text-gray-300">{diseaseInfo.transmissionMode}</p>
                      </div>
                      <div>
                        <span className="font-medium">Economic Impact:</span>
                        <p className="text-gray-600 dark:text-gray-300">{diseaseInfo.economicImpact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Symptoms and Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Symptoms & Favorable Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    Symptoms
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {diseaseInfo.symptoms}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-600" />
                    Favorable Conditions
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {diseaseInfo.favorableConditions}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Host Range:</span>
                    <p className="text-gray-600 dark:text-gray-300">{diseaseInfo.hostRange}</p>
                  </div>
                  <div>
                    <span className="font-medium">Distribution:</span>
                    <p className="text-gray-600 dark:text-gray-300">{diseaseInfo.geographicalDistribution}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Detailed Treatment Recommendations
                </CardTitle>
                <CardDescription>
                  Step-by-step treatment protocol for effective disease management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedTreatment.map((treatment, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{treatment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prevention Strategies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Comprehensive Prevention Strategies
                </CardTitle>
                <CardDescription>
                  Proactive measures to prevent future disease outbreaks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedPrevention.map((prevention, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{prevention}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Environmental Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-600" />
                  Environmental Monitoring Guidelines
                </CardTitle>
                <CardDescription>
                  Key environmental factors to monitor for disease prevention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <Thermometer className="h-5 w-5 text-orange-600" />
                      <div>
                        <h4 className="font-medium">Temperature</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Monitor daily temperature fluctuations</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <Droplets className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Humidity</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Track relative humidity levels</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Seasonal Patterns</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Track disease occurrence patterns</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium">Early Warning</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Set up monitoring alerts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => router.push('/')} variant="outline" size="lg">
            Visit Crop Care
          </Button>
          <Button onClick={() => router.push('/disease-prediction')} size="lg">
            <ExternalLink className="h-4 w-4 mr-2" />
            Try Disease Detection
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 border-t pt-6">
          <p>This report was generated by <strong>Crop Care AI</strong> - Advanced agricultural disease detection platform</p>
          <p className="mt-1">Empowering farmers with AI-powered solutions for sustainable agriculture</p>
        </div>
      </div>
    </div>
  )
}