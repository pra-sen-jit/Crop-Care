import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface DiseaseData {
  disease: string
  confidence: number
  severity: string
  treatment: string
  prevention: string
  imageUrl: string
}

interface DiseaseInfo {
  scientificName: string
  pathogenType: string
  transmissionMode: string
  hostRange: string
  economicImpact: string
  geographicalDistribution: string
  symptoms: string
  favorableConditions: string
}

export async function generateDiseasePDF(
  diseaseData: DiseaseData,
  diseaseInfo: DiseaseInfo,
  detailedTreatment: string[],
  detailedPrevention: string[]
) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  
  let yPosition = margin

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    pdf.setFontSize(fontSize)
    return pdf.splitTextToSize(text, maxWidth)
  }

  // Helper function to get severity color
  const getSeverityColor = (severity: string): [number, number, number] => {
    switch (severity.toLowerCase()) {
      case 'low':
      case 'mild':
        return [34, 197, 94] // green
      case 'medium':
      case 'moderate':
        return [234, 179, 8] // yellow
      case 'high':
      case 'severe':
        return [239, 68, 68] // red
      default:
        return [107, 114, 128] // gray
    }
  }

  // Helper function to get confidence color
  const getConfidenceColor = (confidence: number): [number, number, number] => {
    if (confidence >= 90) return [34, 197, 94] // green
    if (confidence >= 70) return [234, 179, 8] // yellow
    return [239, 68, 68] // red
  }

  try {
    // Header
    pdf.setFillColor(22, 163, 74) // green-600
    pdf.rect(0, 0, pageWidth, 40, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CROP DISEASE ANALYSIS REPORT', pageWidth / 2, 20, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' })
    
    yPosition = 50

    // Disease Overview Section
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Disease Overview', margin, yPosition)
    yPosition += 15

    // Disease name and badges
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Disease: ${diseaseData.disease}`, margin, yPosition)
    yPosition += 10

    // Confidence badge
    const confidenceColor = getConfidenceColor(diseaseData.confidence)
    pdf.setFillColor(...confidenceColor)
    pdf.roundedRect(margin, yPosition, 40, 8, 2, 2, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${diseaseData.confidence}% Confidence`, margin + 20, yPosition + 5, { align: 'center' })

    // Severity badge
    const severityColor = getSeverityColor(diseaseData.severity)
    pdf.setFillColor(...severityColor)
    pdf.roundedRect(margin + 45, yPosition, 35, 8, 2, 2, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.text(`${diseaseData.severity} Severity`, margin + 62.5, yPosition + 5, { align: 'center' })

    // Status badge
    const isHealthy = diseaseData.disease === 'Healthy'
    pdf.setFillColor(isHealthy ? 34 : 239, isHealthy ? 197 : 68, isHealthy ? 94 : 68)
    pdf.roundedRect(margin + 85, yPosition, 35, 8, 2, 2, 'F')
    pdf.text(isHealthy ? 'Healthy' : 'Disease Detected', margin + 102.5, yPosition + 5, { align: 'center' })

    yPosition += 20

    // Add image if available
    if (diseaseData.imageUrl && !diseaseData.imageUrl.startsWith('data:')) {
      try {
        // Create a temporary image element to load the image
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = diseaseData.imageUrl
        })

        // Create canvas to convert image
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        const imgData = canvas.toDataURL('image/jpeg', 0.8)
        
        checkPageBreak(60)
        pdf.addImage(imgData, 'JPEG', margin, yPosition, 60, 60)
        yPosition += 70
      } catch (error) {
        console.log('Could not load image for PDF:', error)
        // Continue without image
      }
    }

    // Disease Information Section
    checkPageBreak(80)
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Disease Information', margin, yPosition)
    yPosition += 15

    const diseaseInfoItems = [
      ['Scientific Name:', diseaseInfo.scientificName],
      ['Pathogen Type:', diseaseInfo.pathogenType],
      ['Transmission Mode:', diseaseInfo.transmissionMode],
      ['Host Range:', diseaseInfo.hostRange],
      ['Economic Impact:', diseaseInfo.economicImpact],
      ['Geographical Distribution:', diseaseInfo.geographicalDistribution]
    ]

    pdf.setFontSize(11)
    diseaseInfoItems.forEach(([label, value]) => {
      checkPageBreak(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text(label, margin, yPosition)
      pdf.setFont('helvetica', 'normal')
      const wrappedText = wrapText(value, contentWidth - 50, 11)
      pdf.text(wrappedText, margin + 50, yPosition)
      yPosition += wrappedText.length * 5 + 2
    })

    yPosition += 10

    // Symptoms Section
    checkPageBreak(30)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Symptoms', margin, yPosition)
    yPosition += 10

    pdf.setFillColor(249, 250, 251) // light gray background
    pdf.rect(margin, yPosition, contentWidth, 20, 'F')
    pdf.setTextColor(75, 85, 99) // gray-600
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const symptomsText = wrapText(diseaseInfo.symptoms, contentWidth - 10, 10)
    pdf.text(symptomsText, margin + 5, yPosition + 5)
    yPosition += Math.max(20, symptomsText.length * 4 + 10)

    yPosition += 10

    // Favorable Conditions Section
    checkPageBreak(30)
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Favorable Conditions', margin, yPosition)
    yPosition += 10

    pdf.setFillColor(249, 250, 251) // light gray background
    pdf.rect(margin, yPosition, contentWidth, 20, 'F')
    pdf.setTextColor(75, 85, 99) // gray-600
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const conditionsText = wrapText(diseaseInfo.favorableConditions, contentWidth - 10, 10)
    pdf.text(conditionsText, margin + 5, yPosition + 5)
    yPosition += Math.max(20, conditionsText.length * 4 + 10)

    yPosition += 15

    // Treatment Recommendations Section
    checkPageBreak(40)
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Detailed Treatment Recommendations', margin, yPosition)
    yPosition += 15

    detailedTreatment.forEach((treatment, index) => {
      const requiredHeight = Math.ceil(treatment.length / 80) * 6 + 15
      checkPageBreak(requiredHeight)

      // Light green background for treatment item
      pdf.setFillColor(240, 253, 244) // green-50
      const itemHeight = Math.max(12, Math.ceil(treatment.length / 80) * 4 + 8)
      pdf.rect(margin, yPosition, contentWidth, itemHeight, 'F')

      // Number circle
      pdf.setFillColor(22, 163, 74) // green-600
      pdf.circle(margin + 8, yPosition + 6, 3, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text((index + 1).toString(), margin + 8, yPosition + 8, { align: 'center' })

      // Treatment text
      pdf.setTextColor(55, 65, 81) // gray-700
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const treatmentText = wrapText(treatment, contentWidth - 25, 10)
      pdf.text(treatmentText, margin + 15, yPosition + 5)
      
      yPosition += itemHeight + 3
    })

    yPosition += 15

    // Prevention Strategies Section
    checkPageBreak(40)
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Comprehensive Prevention Strategies', margin, yPosition)
    yPosition += 15

    detailedPrevention.forEach((prevention, index) => {
      const requiredHeight = Math.ceil(prevention.length / 80) * 6 + 15
      checkPageBreak(requiredHeight)

      // Light blue background for prevention item
      pdf.setFillColor(239, 246, 255) // blue-50
      const itemHeight = Math.max(12, Math.ceil(prevention.length / 80) * 4 + 8)
      pdf.rect(margin, yPosition, contentWidth, itemHeight, 'F')

      // Number circle
      pdf.setFillColor(37, 99, 235) // blue-600
      pdf.circle(margin + 8, yPosition + 6, 3, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text((index + 1).toString(), margin + 8, yPosition + 8, { align: 'center' })

      // Prevention text
      pdf.setTextColor(55, 65, 81) // gray-700
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const preventionText = wrapText(prevention, contentWidth - 25, 10)
      pdf.text(preventionText, margin + 15, yPosition + 5)
      
      yPosition += itemHeight + 3
    })

    // Environmental Monitoring Section
    checkPageBreak(80)
    yPosition += 15
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Environmental Monitoring Guidelines', margin, yPosition)
    yPosition += 15

    const monitoringItems = [
      { title: 'Temperature', desc: 'Monitor daily temperature fluctuations', color: [255, 237, 213] }, // orange-100
      { title: 'Humidity', desc: 'Track relative humidity levels', color: [219, 234, 254] }, // blue-100
      { title: 'Seasonal Patterns', desc: 'Track disease occurrence patterns', color: [220, 252, 231] }, // green-100
      { title: 'Early Warning', desc: 'Set up monitoring alerts', color: [237, 233, 254] } // purple-100
    ]

    monitoringItems.forEach((item, index) => {
      const x = margin + (index % 2) * (contentWidth / 2)
      const y = yPosition + Math.floor(index / 2) * 25

      checkPageBreak(25)

      // Light background with good contrast
      pdf.setFillColor(item.color[0], item.color[1], item.color[2])
      pdf.rect(x, y, contentWidth / 2 - 5, 20, 'F')

      // Title and description with dark text for good readability
      pdf.setTextColor(0, 0, 0) // black text
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(item.title, x + 3, y + 8)
      
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(75, 85, 99) // gray-600
      pdf.text(item.desc, x + 3, y + 15)
    })

    yPosition += 60

    // Footer
    checkPageBreak(30)
    pdf.setFillColor(22, 163, 74) // green-600
    pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Generated by Crop Care AI Platform', pageWidth / 2, pageHeight - 15, { align: 'center' })
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Empowering farmers with AI-powered agricultural solutions', pageWidth / 2, pageHeight - 8, { align: 'center' })

    // Save the PDF
    const fileName = `disease-report-${diseaseData.disease.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`
    pdf.save(fileName)

  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF report')
  }
}