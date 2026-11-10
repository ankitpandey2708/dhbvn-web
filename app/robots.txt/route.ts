import { SITE_URL } from '@/lib/dhbvn-config';

// Content-Signal directives:
//   search=yes  – Allow building search indexes and returning snippets
//   ai-input=yes – Allow using content for RAG / AI-based search answers
//   ai-train=no  – Do NOT use content for training or fine-tuning AI models
const contentSignalLine = 'Content-Signal: search=yes, ai-input=yes, ai-train=no';

export async function GET() {
  const body = [
    '# As a condition of accessing this website, you agree to abide by the',
    '# following content signals:',
    '# (a) If a content-signal = yes, you may collect content for the corresponding use.',
    '# (b) If a content-signal = no, you may not collect content for the corresponding use.',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    contentSignalLine,
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
