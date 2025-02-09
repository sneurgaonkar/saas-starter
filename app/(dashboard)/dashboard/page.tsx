'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Link as LinkIcon } from 'lucide-react';

interface ExtractedData {
  title: string;
  summary: string;
  keywords: string[];
}

export default function DashboardPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    title: '',
    summary: '',
    keywords: []
  });
  const [error, setError] = useState<string | null>(null);

  async function pollExtractResults(extractId: string) {
    setIsPolling(true);
    try {
      const response = await fetch(`/api/extract/${extractId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get results');
      }

      if (data.success && data.data) {
        setExtractedData({
          title: data.data.title || '',
          summary: data.data.summary || '',
          keywords: data.data.keywords || []
        });
        setIsPolling(false);
      } else {
        // If still processing, poll again after 2 seconds
        setTimeout(() => pollExtractResults(extractId), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get results');
      setIsPolling(false);
    }
  }

  async function handleExtract(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setExtractedData({ title: '', summary: '', keywords: [] });

    try {
      // Step 1: Initiate extraction
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to start extraction');
      }

      // Step 2: Poll for results
      await pollExtractResults(data.extractId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Enter your business website
      </h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Get details from URL</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExtract} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="Enter URL to extract data from"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || isPolling}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isLoading || isPolling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isPolling ? 'Getting Results...' : 'Extracting...'}
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Extract
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {(extractedData.title || extractedData.summary || extractedData.keywords.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Extracted Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  value={extractedData.title}
                  onChange={(e) => setExtractedData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                </label>
                <Textarea
                  value={extractedData.summary}
                  onChange={(e) => setExtractedData(prev => ({
                    ...prev,
                    summary: e.target.value
                  }))}
                  className="w-full min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords
                </label>
                <Input
                  value={extractedData.keywords.join(', ')}
                  onChange={(e) => setExtractedData(prev => ({
                    ...prev,
                    keywords: e.target.value.split(',').map(k => k.trim())
                  }))}
                  className="w-full"
                  placeholder="Comma-separated keywords"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
