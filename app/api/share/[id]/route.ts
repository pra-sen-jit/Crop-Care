import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ShareableReport from '@/models/ShareableReport'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Set a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 8000) // 8 second timeout
    })

    const operationPromise = async () => {
      await connectDB()
      
      const shareableReport = await ShareableReport.findById(params.id)
      
      if (!shareableReport) {
        throw new Error('Report not found')
      }
      
      // Check if expired
      if (shareableReport.expiresAt < new Date()) {
        throw new Error('Report has expired')
      }
      
      return shareableReport
    }

    const result = await Promise.race([operationPromise(), timeoutPromise])
    
    return NextResponse.json(result)
    
  } catch (error: any) {
    console.error('Share retrieval error:', error)
    
    if (error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'Request timeout - please try again' },
        { status: 408 }
      )
    }
    
    if (error.message === 'Report not found') {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    
    if (error.message === 'Report has expired') {
      return NextResponse.json({ error: 'Report has expired' }, { status: 410 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}