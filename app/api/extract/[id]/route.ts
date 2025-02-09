import { NextRequest, NextResponse } from 'next/server';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!FIRECRAWL_API_KEY) {
      return NextResponse.json(
        { error: 'Firecrawl API key is not configured' },
        { status: 500 }
      );
    }

    const extractId = params.id;
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
    console.log('Firecrawl result data:', resultData);

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