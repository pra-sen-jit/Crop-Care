"use client";

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
  Mail
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

// Disease class to user-friendly name mapping
const diseaseNameMap: Record<string, string> = {
  "Apple__Healthy": "Healthy Apple Leaf",
  "Apple___Apple_scab": "Apple Scab Disease",
  "Apple___Black_rot": "Apple Black Rot Disease",
  "Apple___Cedar_rust": "Apple Cedar Rust Disease",
  "Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot": "Corn Gray Leaf Spot (Cercospora Leaf Spot) Disease",
  "Corn_(maize)___Common_rust_": "Corn Common Rust Disease",
  "Corn_(maize)___Northern_Leaf_Blight": "Corn Northern Leaf Blight Disease ",
  "Corn_(maize)___healthy": "Healthy Corn Leaf",
  "Grape_Black_rot": "Grape Black Rot Disease",
  "Grape__Healthy": "Healthy Grape Leaf",
  "Grape___Esca_(Black_Measles)": "Grape Esca (Black Measles) Disease",
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "Grape Leaf Blight (Isariopsis Leaf Spot) Disease",
  "Rice_Bacterialblight": "Rice Bacterial Blight Disease",
  "Rice_BrownSpot": "Rice Brown Spot Disease",
  "Rice_Healthy": "Healthy Rice Leaf",
  "Rice_LeafBlast": "Rice Leaf Blast Disease",
  "Rice__Tungro__disease": "Rice Tungro Disease",
  "Tomato___Bacterial_spot": "Tomato Bacterial Spot Disease",
  "Tomato___Early_blight": "Tomato Early Blight Disease",
  "Tomato___Late_blight": "Tomato Late Blight Disease",
  "Tomato___Leaf_Mold": "Tomato Leaf Mold Disease",
  "Tomato___Septoria_leaf_spot": "Tomato Septoria Leaf Spot Disease",
  "Tomato___Spider_mites Two-spotted_spider_mite": "Tomato Spider Mites (Two-Spotted Spider Mite) Disease",
  "Tomato___Target_Spot": "Tomato Target Spot Disease",
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "Tomato Yellow Leaf Curl Virus",
  "Tomato___Tomato_mosaic_virus": "Tomato Mosaic Virus",
  "Tomato___healthy": "Healthy Tomato Leaf"
};

export default function DiseaseDetailsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [diseaseData, setDiseaseData] = useState<DiseaseDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)
  const [geminiInfo, setGeminiInfo] = useState<any>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    // Get data from URL parameters
    const disease = searchParams.get('disease')
    const confidence = searchParams.get('confidence')
    const severity = searchParams.get('severity')
    const treatment = searchParams.get('treatment')
    const prevention = searchParams.get('prevention')
    const imageUrl = searchParams.get('imageUrl')

    if (disease && confidence && severity && treatment && prevention && imageUrl) {
      setDiseaseData({
        disease,
        confidence: parseFloat(confidence),
        severity,
        treatment,
        prevention,
        imageUrl
      })
    }
    setIsLoading(false)
  }, [searchParams])

  useEffect(() => {
    if (diseaseData?.disease) {
      setGeminiLoading(true);
      setGeminiError(null);
      fetch("/api/gemini-disease-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disease: diseaseData.disease })
      })
        .then(res => res.json())
        .then(data => {
          setGeminiInfo(data);
          if (data.error) setGeminiError(data.error);
        })
        .catch(e => setGeminiError(e?.toString() || "Unknown error"))
        .finally(() => setGeminiLoading(false));
    }
  }, [diseaseData?.disease]);

  useEffect(() => {
    // Check authentication on mount
    if (typeof window !== 'undefined') {
      setIsAuthenticated(Boolean(localStorage.getItem('user')));
    }
  }, []);

  // Create shareable link when needed (not automatically)
  const createShareableLink = async () => {
    if (!diseaseData || shareUrl) return shareUrl

    try {
      const controller = new AbortController()
      // Increased timeout from 10 to 20 seconds to match server timeout
      const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 second timeout

      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diseaseData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        setShareUrl(data.shareUrl)
        return data.shareUrl
      } else {
        throw new Error('Failed to create shareable link')
      }
    } catch (error: any) {
      console.error('Failed to create shareable link:', error)
      setShareError('Failed to create shareable link')
      // Return deployment URL as fallback
      const fallbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/shared/${diseaseData ? diseaseData.disease : ''}`
      setShareUrl(fallbackUrl)
      return fallbackUrl
    }
  }

  const getDetailedTreatment = (disease: string, basicTreatment: string): string[] => {
    const treatments: Record<string, string[]> = {
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
    };
    if (treatments[disease]) {
      return treatments[disease];
    }
    return [basicTreatment];
  };

  const getDetailedPrevention = (disease: string, basicPrevention: string): string[] => {
    const preventions: Record<string, string[]> = {
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
    };
    if (preventions[disease]) {
      return preventions[disease];
    }
    return [basicPrevention];
  };

  const getDiseaseInfo = (disease: string) => {
    const diseaseInfo: Record<string, any> = {
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
    };
    return diseaseInfo[disease] || {
      scientificName: "Unknown",
      pathogenType: "Unknown",
      transmissionMode: "Unknown",
      hostRange: "Unknown",
      economicImpact: "Unknown",
      geographicalDistribution: "Unknown",
      symptoms: "Consult agricultural expert for detailed information",
      favorableConditions: "Variable"
    };
  };

  const handleNativeShare = async () => {
    const { title, text, url } = await createShareableContent();
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await handleCopyLink();
    }
  };

  const handleWhatsAppShare = async () => {
    const { text, url } = await createShareableContent();
    const whatsappText = encodeURIComponent(`${text}\n\n${url}`);
    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
  };

  const createShareableContent = async () => {
    if (!diseaseData) return { title: '', text: '', url: '' };
    const url = await createShareableLink();
    const isHealthy = diseaseData.disease === 'Healthy';
    const status = isHealthy ? '✅ Healthy Crop' : '⚠️ Disease Detected';
    const title = `🌾 Crop Analysis Report: ${diseaseData.disease}`;
    const text = `${status}\n\n🔬 Disease: ${diseaseData.disease}\n📊 Confidence: ${diseaseData.confidence}%\n⚡ Severity: ${diseaseData.severity}\n\n${isHealthy ? '✅ Your crop appears healthy! Continue with current management practices.' : `🚨 Treatment needed: ${diseaseData.treatment.substring(0, 100)}...`}\n\n📱 Analyzed with Crop Care AI - Advanced disease detection for farmers\n\n🔗 View full report:`;
    return { title, text, url: url || `${process.env.NEXT_PUBLIC_SITE_URL}/shared/${diseaseData.disease}` };
  };

  const handleCopyLink = async () => {
    try {
      const url = await createShareableLink();
      const textToCopy = url || `${process.env.NEXT_PUBLIC_SITE_URL}/shared/${diseaseData ? diseaseData.disease : ''}`;
      if (navigator.clipboard && window.isSecureContext) {
        window.focus();
        await navigator.clipboard.writeText(textToCopy);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
          alert(`Please copy this link manually: ${textToCopy}`);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      const url = await createShareableLink();
      alert(`Please copy this link manually: ${url || `${process.env.NEXT_PUBLIC_SITE_URL}/shared/${diseaseData ? diseaseData.disease : ''}`}`);
    }
  };

  const handleEmailShare = async () => {
    const { title, text, url } = await createShareableContent();
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${text}\n\n${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSMSShare = async () => {
    const { text, url } = await createShareableContent();
    const smsText = encodeURIComponent(`${text}\n\n${url}`);
    window.open(`sms:?body=${smsText}`, '_blank');
  };

  const handleDownloadReport = async () => {
    if (!diseaseData) return;
    setIsGeneratingPDF(true);
    try {
      const diseaseInfo = geminiInfo && !geminiInfo.error ? {
        scientificName: geminiInfo.scientificName || 'Unknown',
        pathogenType: geminiInfo.pathogenType || 'Unknown',
        transmissionMode: geminiInfo.transmission || 'Unknown',
        hostRange: geminiInfo.hostRange || 'Unknown',
        economicImpact: geminiInfo.economicImpact || 'Unknown',
        geographicalDistribution: geminiInfo.distribution || 'Unknown',
        symptoms: geminiInfo.symptoms || 'Unknown',
        favorableConditions: geminiInfo.favorableConditions || 'Unknown',
      } : getDiseaseInfo(diseaseData.disease);
      const detailedTreatment = getDetailedTreatment(diseaseData.disease, diseaseData.treatment);
      const detailedPrevention = getDetailedPrevention(diseaseData.disease, diseaseData.prevention);
      const pdfDiseaseData = {
        ...diseaseData,
        disease: displayDiseaseName
      };
      await generateDiseasePDF(pdfDiseaseData, diseaseInfo, detailedTreatment, detailedPrevention);
    } catch (error) {
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Helper for display name
  const displayDiseaseName = diseaseData ? (diseaseNameMap[diseaseData.disease] || diseaseData.disease) : '';

  // Helper for color
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Detailed treatment/prevention arrays
  const detailedTreatment: string[] = diseaseData ? getDetailedTreatment(diseaseData.disease, diseaseData.treatment) : [];
  const detailedPrevention: string[] = diseaseData ? getDetailedPrevention(diseaseData.disease, diseaseData.prevention) : [];

  if (!diseaseData) {
    return null;
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
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
                    <h3 className="font-semibold text-lg mb-2">{displayDiseaseName}</h3>
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
                        <p className="text-gray-600 dark:text-gray-300">
                          {geminiLoading ? 'Loading...' : geminiInfo?.scientificName || geminiError || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Pathogen Type:</span>
                        <p className="text-gray-600 dark:text-gray-300">
                          {geminiLoading ? 'Loading...' : geminiInfo?.pathogenType || geminiError || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Transmission:</span>
                        <p className="text-gray-600 dark:text-gray-300">
                          {geminiLoading ? 'Loading...' : geminiInfo?.transmission || geminiError || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Economic Impact:</span>
                        <p className="text-gray-600 dark:text-gray-300">
                          {geminiLoading ? 'Loading...' : geminiInfo?.economicImpact || geminiError || 'N/A'}
                        </p>
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
                    {geminiLoading ? 'Loading...' : geminiInfo?.symptoms || geminiError || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-600" />
                    Favorable Conditions
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {geminiLoading ? 'Loading...' : geminiInfo?.favorableConditions || geminiError || 'N/A'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Host Range:</span>
                    <p className="text-gray-600 dark:text-gray-300">
                      {geminiLoading ? 'Loading...' : geminiInfo?.hostRange || geminiError || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Distribution:</span>
                    <p className="text-gray-600 dark:text-gray-300">
                      {geminiLoading ? 'Loading...' : geminiInfo?.distribution || geminiError || 'N/A'}
                    </p>
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
          <Button onClick={() => router.push('/disease-prediction')} variant="outline" size="lg">
            Analyze Another Image
          </Button>
          <Button onClick={() => router.push('/recommendation')} size="lg">
            Get Crop Recommendations
          </Button>
        </div>
      </div>
    </div>
  )
} 