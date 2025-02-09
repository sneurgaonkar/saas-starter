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

    // Step 1: Initial extraction request
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
    console.log(extractData.id)

    if (!extractId) {
      throw new Error('No extract ID received');
    }

    // Step 2: Get extraction results
    const resultResponse = await fetch(`${FIRECRAWL_API_URL}/extract/${extractId}`, {
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
    });

    if (!resultResponse.ok) {
      const errorText = await resultResponse.text();
      console.error('Firecrawl Get Extract API error:', errorText);
      throw new Error('Failed to get extraction results');
    }

    const resultData = await resultResponse.json();
    console.log('Firecrawl result data:', resultData); // Debug log

    // Format the response to match our ExtractedData interface
    return NextResponse.json({
      success: true,
      data: {
        title: resultData.results?.[0]?.title || '',
        summary: resultData.results?.[0]?.content || '',
        keywords: resultData.results?.[0]?.metadata?.keywords || []
      }
    });

  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 