import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ShareableReport from '@/models/ShareableReport'

export async function POST(request: NextRequest) {
  try {
    // Set a timeout for the entire operation - increased from 8 to 15 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 15000) // 15 second timeout
    })

    const operationPromise = async () => {
      await connectDB()
      
      const body = await request.json()
      const { disease, confidence, severity, treatment, prevention, imageUrl } = body
      
      if (!disease || !confidence || !severity || !treatment || !prevention || !imageUrl) {
        throw new Error('Missing required fields')
      }
      
      // Create a shareable report
      const shareableReport = new ShareableReport({
        disease,
        confidence,
        severity,
        treatment,
        prevention,
        imageUrl,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      })
      
      await shareableReport.save()
      
      return {
        shareId: shareableReport._id,
        shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/shared/${shareableReport._id}`
      }
    }

    const result = await Promise.race([operationPromise(), timeoutPromise])
    
    return NextResponse.json(result)
    
  } catch (error: any) {
    console.error('Share creation error:', error)
    
    // Return a more specific error message
    if (error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'Request timeout - please try again' },
        { status: 408 }
      )
    }
    
    if (error.message === 'Missing required fields') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create shareable link' },
      { status: 500 }
    )
  }
}