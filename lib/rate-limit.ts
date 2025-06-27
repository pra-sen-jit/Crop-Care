import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(
  request: NextRequest,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; limit: number; remaining: number; reset: Date } {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const key = `${ip}:${request.nextUrl.pathname}`
  const now = Date.now()

  // Clean up expired entries
  Object.keys(store).forEach(k => {
    if (store[k].resetTime < now) {
      delete store[k]
    }
  })

  if (!store[key]) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs
    }
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: new Date(store[key].resetTime)
    }
  }

  if (store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs
    }
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: new Date(store[key].resetTime)
    }
  }

  store[key].count++

  const success = store[key].count <= limit
  const remaining = Math.max(0, limit - store[key].count)

  return {
    success,
    limit,
    remaining,
    reset: new Date(store[key].resetTime)
  }
}