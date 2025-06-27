import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // The URL of your running FastAPI backend
    const backendUrl = (process.env.BACKEND_URL || 'http://localhost:8000') + 'recommendation';

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      // If the backend returned an error, pass it along to the frontend
      const errorData = await backendResponse.json();
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API route /api/recommendation error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred in the Next.js proxy.' },
      { status: 500 }
    );
  }
} 