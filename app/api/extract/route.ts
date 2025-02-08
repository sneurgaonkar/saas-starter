import { NextRequest, NextResponse } from 'next/server';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1/extract';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!FIRECRAWL_API_KEY) {
      return NextResponse.json(
        { error: 'Firecrawl API key is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(FIRECRAWL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': FIRECRAWL_API_KEY,
      },
      body: JSON.stringify({
        urls: [url],
        prompt: "Extract the main content, title, and any relevant metadata from this page",
        enableWebSearch: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firecrawl API error response:', errorText);
      throw new Error('Failed to extract data from URL');
    }

    const data = await response.json();

    if (data.status === 'processing') {
      return NextResponse.json({
        success: true,
        status: 'processing',
        message: 'Extraction in progress'
      });
    }

    return NextResponse.json({
      success: true,
      data: data.data
    });

  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 