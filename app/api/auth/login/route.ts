import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limit'
import { createAuthResponse } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, 5, 15 * 60 * 1000) // 5 requests per 15 minutes
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toISOString()
          }
        }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    await connectDB()
    
    // Find user and include password for comparison
    const user = await User.findOne({ email: validatedData.email }).select('+password')
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return NextResponse.json(
        { error: 'Account is temporarily locked due to too many failed login attempts. Please try again later.' },
        { status: 423 }
      )
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(validatedData.password)
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts()
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts()
    }
    
    // Create auth response
    const authResponse = createAuthResponse(user)
    
    // Create response with cookie
    const response = NextResponse.json({
      message: 'Login successful',
      ...authResponse
    })
    
    // Set HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: validatedData.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
      path: '/'
    }
    
    response.cookies.set('auth-token', authResponse.token, cookieOptions)
    
    return response
    
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}