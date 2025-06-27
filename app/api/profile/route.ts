import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import dbConnect from '@/lib/mongodb'
import { getAuthUser } from '@/lib/auth'
import '@/models/DiseasePrediction'
import '@/models/CropRecommendation'

export async function GET(req: NextRequest) {
  await dbConnect()
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userDoc = await User.findById(user._id)
      .populate('cropsScanned')
      .populate('cropsRecommended')
      .select('-password')
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    // Build a profile object with all required fields
    const profile = {
      fullName: [userDoc.firstName, userDoc.lastName].filter(Boolean).join(' ').trim(),
      email: userDoc.email || '',
      username: userDoc.username || '',
      phone: userDoc.phone || '',
      countryCode: userDoc.countryCode || '+91',
      city: userDoc.city || '',
      profileImage: userDoc.profileImage || '',
      cropsScanned: userDoc.cropsScanned || [],
      cropsRecommended: userDoc.cropsRecommended || [],
      createdAt: userDoc.createdAt || '',
    }
    return NextResponse.json({ profile })
  } catch (err: any) {
    console.error('Profile API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  await dbConnect()
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const updateFields: any = {}
    for (const key of ['firstName', 'lastName', 'username', 'email', 'profileImage', 'phone', 'countryCode', 'city', 'cropsScanned', 'cropsRecommended']) {
      if (body[key] !== undefined) updateFields[key] = body[key]
    }
    const userDoc = await User.findByIdAndUpdate(user._id, updateFields, { new: true })
      .populate('cropsScanned')
      .populate('cropsRecommended')
      .select('-password')
    return NextResponse.json({ success: true, profile: userDoc })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
} 