import { NextRequest, NextResponse } from 'next/server';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

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

    const extractResponse = await fetch(`${FIRECRAWL_API_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        urls: [url],
        prompt: "Give a summary of the website and give the title, and any relevant metadata from this page",
        enableWebSearch: false
      }),
    });

    if (!extractResponse.ok) {
      const errorText = await extractResponse.text();
      console.error('Firecrawl Extract API error:', errorText);
      throw new Error('Failed to initiate extraction');
    }

    const extractData = await extractResponse.json();
    const extractId = extractData.id;
    console.log('Extract ID:', extractId);

    if (!extractId) {
      throw new Error('No extract ID received');
    }

    return NextResponse.json({
      success: true,
      extractId: extractId
    });

  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 