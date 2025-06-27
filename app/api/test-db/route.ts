import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    await connectDB()
    
    // Test database connection
    const userCount = await User.countDocuments()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}