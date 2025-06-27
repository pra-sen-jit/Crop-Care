import { NextRequest, NextResponse } from 'next/server'
import CropRecommendation from '@/models/CropRecommendation'
import dbConnect from '@/lib/mongodb'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  await dbConnect()
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { crop, suitability, profit, expected_yield, best_season, why_recommended } = body
    if (!crop) {
      return NextResponse.json({ error: 'Missing crop name' }, { status: 400 })
    }
    const recommendation = await CropRecommendation.create({
      userId: user._id,
      crop,
      suitability,
      profit,
      expected_yield,
      best_season,
      why_recommended
    })
    // Add the recommendation to the user's cropsRecommended array
    await (await import('@/models/User')).default.findByIdAndUpdate(
      user._id,
      { $push: { cropsRecommended: recommendation._id } }
    )
    return NextResponse.json({ success: true, recommendation })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
} 