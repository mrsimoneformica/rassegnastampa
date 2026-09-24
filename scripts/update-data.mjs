import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const config = JSON.parse(await fs.readFile(path.join(root, 'config/sources.json'), 'utf8'));
const outputPath = path.join(root, 'data/latest.json');

const decode = value => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

const tag = (xml, name) => {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? decode(match[1]) : '';
};

const parseFeed = (xml, source) => {
  const chunks = xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi) || [];
  return chunks.slice(0, 30).map(chunk => ({
    id: tag(chunk, 'guid') || tag(chunk, 'id') || tag(chunk, 'link') || tag(chunk, 'title'),
    source: source.name,
    domain: source.domain,
    title: tag(chunk, 'title'),
    url: tag(chunk, 'link'),
    publishedAt: tag(chunk, 'pubDate') || tag(chunk, 'published') || tag(chunk, 'updated'),
    summary: tag(chunk, 'description') || tag(chunk, 'summary'),
    status: 'Reported'
  })).filter(item => item.title && item.url);
};

const sources = [
  ...config.nationalSources,
  ...Object.entries(config.localSources).flatMap(([club, entries]) =>
    entries.map(source => ({ ...source, club }))
  )
].filter(source => source.enabled && source.feedUrl);

const report = {
  generatedAt: new Date().toISOString(),
  timezone: config.timezone,
  mode: sources.length ? 'authorized-feeds' : 'demo',
  status: 'ready',
  message: sources.length
    ? 'Aggiornamento automatico completato.'
    : 'Nessun feed autorizzato abilitato: il frontend mantiene il dataset demo.',
  sourcesChecked: sources.length,
  sourcesSucceeded: 0,
  sourcesFailed: 0,
  errors: [],
  items: []
};

for (const source of sources) {
  try {
    const response = await fetch(source.feedUrl, {
      headers: { 'User-Agent': 'SerieAPressIntelligence/1.0 (+repository-owner-contact)' },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    report.items.push(...parseFeed(await response.text(), source).map(item => ({ ...item, club: source.club || null })));
    report.sourcesSucceeded += 1;
  } catch (error) {
    report.sourcesFailed += 1;
    report.errors.push({ source: source.name, message: error.message });
  }
}

const seen = new Set();
report.items = report.items.filter(item => {
  const key = `${item.url}|${item.title.toLowerCase()}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
}).slice(0, 500);

await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Updated ${report.items.length} items from ${report.sourcesSucceeded}/${report.sourcesChecked} sources.`);
