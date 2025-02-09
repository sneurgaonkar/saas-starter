import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY
});

const extractJob = await app.asyncExtract([
  'https://firecrawl.dev/'
], {
  prompt: "Generate a summary of the website, extract the title, and generate some keywords relevant to the website.",
});

if (!extractJob.success) {
  throw new Error(`Failed to scrape: ${extractJob.error}`)
}

console.log(extractJob);
