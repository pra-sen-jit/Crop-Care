import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  username: string
}

export interface UserData {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  isEmailVerified: boolean
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export async function getUserFromToken(token: string): Promise<any | null> {
  try {
    const decoded = verifyToken(token)
    
    // Dynamic import to avoid circular dependencies
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: User } = await import('@/models/User')
    
    await connectDB()
    const user = await User.findById(decoded.userId).select('-password')
    return user
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<any | null> {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) return null
    
    return await getUserFromToken(token)
  } catch (error) {
    console.error('Error getting auth user:', error)
    return null
  }
}

export async function createSession(response: any, userId: string) {
  const user = await (await import('@/models/User')).default.findById(userId);
  if (user) {
    const { token } = createAuthResponse(user);
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
  }
}

export function createAuthResponse(user: any) {
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    username: user.username
  })

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      isEmailVerified: user.isEmailVerified
    },
    token
  }
}