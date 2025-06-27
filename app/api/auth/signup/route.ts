import { NextRequest, NextResponse } from 'next/server'
import { signupSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limit'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, 5, 15 * 60 * 1000) // 5 requests per 15 minutes
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
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
    const validatedData = signupSchema.parse(body)
    
    await connectDB()
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { username: validatedData.username }
      ]
    })
    
    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }
      if (existingUser.username === validatedData.username) {
        return NextResponse.json(
          { error: 'This username is already taken' },
          { status: 400 }
        )
      }
    }
    
    // Create user
    const user = new User({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password,
      isEmailVerified: true // Automatically verify user
    })
    
    await user.save()
    
    // Create session and set cookie
    const response = NextResponse.json({
      message: 'Account created successfully!',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    }, { status: 201 })
    
    await createSession(response, user._id.toString())

    return response
    
  } catch (error: any) {
    console.error('Signup error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json(
        { error: `This ${field} is already registered` },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}