import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // The URL of your running FastAPI backend
    const backendUrl = (process.env.BACKEND_URL || 'http://localhost:8000') + 'predict';

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
    });

    if (!backendResponse.ok) {
      // If the backend returned an error, pass it along to the frontend
      const errorData = await backendResponse.json();
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API route /api/predict error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred in the Next.js proxy.' },
      { status: 500 }
    );
  }
} 