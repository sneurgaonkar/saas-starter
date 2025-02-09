'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon } from 'lucide-react';
import FirecrawlApp, { ExtractResponse } from "@mendable/firecrawl-js";

const apiKey = process.env.FIRECRAWL_API_KEY;

export default function DashboardPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState('');
  const [extractJob, setExtractJob] = useState<ExtractResponse<any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async function fetchData(url: string) {
    try {
      const app = new FirecrawlApp({
        apiKey: process.env.FIRECRAWL_API_KEY
      });

      const job = await app.extract([url], {
        prompt: "Generate a summary of the website, extract the title, and generate some keywords relevant to the website.",
      });

      if (!job.success) {
        throw new Error(`Failed to scrape: ${job.error}`);
      }

      console.log(job);
      setTitle(job.data.title || '');
      setSummary(job.data.summary || '');
      setKeywords(job.data.keywords || '');
      setExtractJob(job);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchData(url);
    console.log('URL submitted:', url);
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Submit
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

        {extractJob && (
          <Card>
            <CardHeader>
              <CardTitle>Extraction Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Summary</label>
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Keywords</label>
                  <Input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}