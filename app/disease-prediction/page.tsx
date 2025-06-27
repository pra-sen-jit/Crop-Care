"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Camera, AlertTriangle, CheckCircle, Loader2, Eye } from "lucide-react"
import Image from "next/image"
import { supabase } from '@/lib/supabase'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function DiseasePredictionPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast();

  // Disease name mapping
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
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setResult(null)
        setImageUrl(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setResult(null)

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(data)

      // Upload image to Supabase for the details page
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from('cropcare').upload(fileName, selectedFile)
      
      let uploadedImageUrl = selectedImage // fallback to base64
      if (!uploadError && uploadData) {
        uploadedImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cropcare/${fileName}`
        setImageUrl(uploadedImageUrl)
      }

      // Assuming the backend returns the top prediction and Gemini results
      const topPrediction = data.predictions[0]
      const resultData = {
        disease: topPrediction.class,
        confidence: topPrediction.confidence,
        severity: data.gemini_severity,
        treatment: data.gemini_treatment,
        prevention: data.gemini_prevention,
        imageUrl: uploadedImageUrl
      }
      
      setResult(resultData)
    } catch (error) {
      console.error("Error analyzing image:", error)
      setResult({
        disease: "Error",
        confidence: 0,
        severity: "Could not retrieve severity",
        treatment: "Could not retrieve treatment information.",
        prevention: "Could not retrieve prevention information.",
        imageUrl: selectedImage
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const isLoggedIn = () => {
    return Boolean(localStorage.getItem('user'))
  }

  const handleSaveToProfile = async () => {
    setSaveMessage(null)
    if (!isLoggedIn()) {
      toast({
        title: "You have to login to save the info",
        description: "You must be logged in to save the prediction to your profile.",
        duration: 4000,
        variant: "destructive"
      });
      return
    }
    if (!selectedFile || !result) return
    setIsSaving(true)
    try {
      let finalImageUrl = imageUrl
      // If we don't have a Supabase URL yet, upload now
      if (!finalImageUrl || finalImageUrl.startsWith('data:')) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage.from('cropcare').upload(fileName, selectedFile)
        if (uploadError) throw uploadError
        finalImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cropcare/${fileName}`
      }
      const response = await fetch('/api/save-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease: result.disease,
          confidence: result.confidence,
          severity: result.severity,
          treatment: result.treatment,
          prevention: result.prevention,
          imageUrl: finalImageUrl
        })
      })
      if (!response.ok) throw new Error('Failed to save prediction')
      setSaveMessage('Prediction saved to your profile!')
    } catch (err: any) {
      setSaveMessage(err.message || 'Error saving prediction')
    } finally {
      setIsSaving(false)
    }
  }

  const handleViewDetails = () => {
    if (!result) return
    if (!isLoggedIn()) {
      toast({
        title: "Signin to see the detailed report !!",
        description: "You must be logged in to view detailed disease analysis.",
        duration: 4000,
        variant: "destructive"
      });
      return;
    }
    const params = new URLSearchParams({
      disease: result.disease,
      confidence: result.confidence.toString(),
      severity: result.severity,
      treatment: result.treatment,
      prevention: result.prevention,
      imageUrl: result.imageUrl || selectedImage || ''
    })
    router.push(`/disease-details?${params.toString()}`)
  }

  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Disease Prediction</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload an image of your crop to detect diseases using our AI-powered CNN model
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Upload Crop Image
              </CardTitle>
              <CardDescription>Take a clear photo of the affected plant or upload an existing image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                {selectedImage ? (
                  <div className="space-y-4">
                    <Image
                      src={selectedImage || "/placeholder.svg"}
                      alt="Uploaded crop"
                      width={300}
                      height={200}
                      className="mx-auto rounded-lg object-cover"
                    />
                    <Button onClick={() => {
                      setSelectedImage(null)
                      setResult(null)
                      setSaveMessage(null)
                      setIsSaving(false)
                      setImageUrl(null)
                    }} variant="outline" size="sm">
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Click to upload or drag and drop</div>
                        <div className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</div>
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={analyzeImage} disabled={!selectedImage || isAnalyzing} className="w-full" size="lg">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  "Analyze for Diseases"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>AI-powered disease detection results</CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !isAnalyzing && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Upload an image to see analysis results
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
                  <p className="text-gray-600 dark:text-gray-300">Analyzing image with CNN model...</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Disease Detected:</span>
                    <Badge variant="destructive">{diseaseNameMap[result.disease] || result.disease}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Confidence:</span>
                    <Badge variant="secondary">{result.confidence}%</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Severity:</span>
                    <Badge variant="outline">{result.severity}</Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Treatment Recommendation:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                      {result.treatment}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Prevention Tips:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      {result.prevention}
                    </p>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <Button variant="secondary" className="flex-1" onClick={handleViewDetails}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="default" className="flex-1" onClick={handleSaveToProfile} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save to Profile'}
                    </Button>
                  </div>
                  {saveMessage && (
                    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                      <Alert variant="default">
                        <AlertDescription className="text-center">{saveMessage}</AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How it Works</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Our CNN model analyzes crop images to identify diseases with 95% accuracy, trained on thousands of plant
                disease images.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supported Crops</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Currently supports Apple, Grape, Corn, Tomato and Rice, a total of 5 crops crops with continuous model
                updates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                For best results, capture clear, well-lit images of affected leaves or plant parts from multiple angles.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}