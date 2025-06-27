import { NextResponse } from 'next/server';

function stripCodeBlock(content: string): string {
  // Remove triple backtick code blocks (e.g., ```json ... ```)
  return content.replace(/^```[a-zA-Z]*\n|```$/g, '').trim();
}

function normalizeKeys(obj: any): any {
  // Convert snake_case or other variants to camelCase for known fields
  if (!obj || typeof obj !== 'object') return obj;
  const mapping: Record<string, string> = {
    scientific_name: 'scientificName',
    pathogen_type: 'pathogenType',
    transmission_mode: 'transmission',
    transmission: 'transmission',
    economic_impact: 'economicImpact',
    symptoms: 'symptoms',
    favorable_conditions: 'favorableConditions',
    host_range: 'hostRange',
    distribution: 'distribution',
  };
  const result: any = {};
  for (const key in obj) {
    const normKey = mapping[key] || key;
    result[normKey] = obj[key];
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const { disease } = await request.json();
    if (!disease) {
      return NextResponse.json({ error: 'Disease name is required.' }, { status: 400 });
    }

    const prompt = `You are a highly knowledgeable plant pathologist. Given the plant disease or healthy condition: "${disease}", generate a structured and concise JSON object containing key information. Ensure each field is factually accurate and written in a clear, compact manner. If data is unavailable or not applicable, respond with "Unknown". Use short phrases or single sentences for each field.\n\nRequired JSON format:\n{\n  "scientificName": "e.g., Alternaria solani",\n  "pathogenType": "e.g., Fungal, Bacterial, Viral, Abiotic, or Unknown",\n  "transmission": "e.g., Airborne spores, Insect-vectored, Seed-borne, Unknown",\n  "economicImpact": "e.g., Moderate yield loss in commercial crops",\n  "symptoms": "e.g., Yellowing, lesions, wilting, stunted growth",\n  "favorableConditions": "e.g., Warm, humid weather; dense planting",\n  "hostRange": "e.g., Tomato, Potato, Eggplant",\n  "distribution": "e.g., Global, Tropical regions, South Asia, etc."\n}\n\nNow, provide this information for: "${disease}"`;

    const apiKey = process.env.GEMINI_API_KEY;
    // Log the API key (masked) for debugging
    console.log('Gemini API Key:', apiKey ? apiKey.slice(0, 6) + '...' : 'NOT SET');
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    let geminiRes;
    try {
      geminiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
    } catch (fetchErr) {
      return NextResponse.json({ error: 'Failed to fetch Gemini API', fetchErr: fetchErr?.toString() }, { status: 500 });
    }
    if (geminiRes.ok) {
      const geminiData = await geminiRes.json();
      let content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Log the raw Gemini response for debugging
      console.log('Gemini raw response:', content);
      let info = null;
      try {
        // Remove code block wrappers if present
        content = stripCodeBlock(content);
        info = JSON.parse(content);
      } catch {
        // Try to extract JSON object from text
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            info = JSON.parse(match[0]);
          } catch {}
        }
      }
      if (!info) {
        return NextResponse.json({ error: 'Failed to parse Gemini response.', raw: content }, { status: 500 });
      }
      // Normalize keys to camelCase
      info = normalizeKeys(info);
      // Ensure all expected fields are present
      const expectedFields = [
        'scientificName',
        'pathogenType',
        'transmission',
        'economicImpact',
        'symptoms',
        'favorableConditions',
        'hostRange',
        'distribution',
      ];
      for (const field of expectedFields) {
        if (!(field in info)) info[field] = 'Unknown';
      }
      return NextResponse.json(info);
    } else {
      // Try to get the full error body from Gemini
      let errorBody = null;
      try {
        errorBody = await geminiRes.text();
      } catch {}
      return NextResponse.json({ error: 'Gemini API call failed', status: geminiRes.status, statusText: geminiRes.statusText, errorBody }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error?.toString() || 'Unknown error' }, { status: 500 });
  }
} 