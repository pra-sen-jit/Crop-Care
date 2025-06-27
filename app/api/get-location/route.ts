import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get IP address from request headers (works for most deployments)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || '';
    // Fallback for localhost/dev
    if (ip === '127.0.0.1' || ip === '::1' || ip === '') {
      // Use a default city for local dev
      return NextResponse.json({
        city: 'Kolkata',
        country: 'India',
        region: 'West Bengal',
        lat: 22.5726,
        lon: 88.3639,
        devFallback: true
      });
    }
    // Use ip-api.com to get geolocation info
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,lat,lon`);
    const geoData = await geoRes.json();
    console.log('IP:', ip, 'GeoData:', geoData);
    if (geoData.status !== 'success') {
      return NextResponse.json({ error: geoData.message || 'Failed to get location', ip, geoData }, { status: 400 });
    }
    return NextResponse.json({
      city: geoData.city,
      country: geoData.country,
      region: geoData.regionName,
      lat: geoData.lat,
      lon: geoData.lon
    });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() || 'Unknown error' }, { status: 500 });
  }
} 