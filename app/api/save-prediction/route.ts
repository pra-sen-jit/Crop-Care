import { NextRequest, NextResponse } from 'next/server'
import DiseasePrediction from '@/models/DiseasePrediction'
import dbConnect from '@/lib/mongodb'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  await dbConnect()
  try {
    // Use real auth helper
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { disease, confidence, severity, treatment, prevention, imageUrl } = body
    if (!disease || !confidence || !severity || !treatment || !prevention || !imageUrl) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const prediction = await DiseasePrediction.create({
      userId: user._id,
      disease,
      confidence,
      severity,
      treatment,
      prevention,
      imageUrl
    })
    // Add the prediction to the user's cropsScanned array
    await (await import('@/models/User')).default.findByIdAndUpdate(
      user._id,
      { $push: { cropsScanned: prediction._id } }
    )
    return NextResponse.json({ success: true, prediction })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
} 