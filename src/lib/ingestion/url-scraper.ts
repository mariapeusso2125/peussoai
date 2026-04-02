import * as cheerio from 'cheerio';

export interface ScrapedProduct {
  name: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  sku?: string;
  description?: string;
  technicalSpecs?: string;
  imageUrls?: string[];
  sourceUrl: string;
}

export interface ScrapedPage {
  title: string;
  url: string;
  textContent: string;
  products: ScrapedProduct[];
  links: string[];
  images: string[];
}

export async function scrapeUrl(url: string): Promise<ScrapedPage> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove scripts, styles, nav, footer
  $('script, style, nav, footer, header, iframe, noscript').remove();

  const title = $('title').text().trim() || $('h1').first().text().trim() || url;

  // Extract all meaningful text
  const textContent = $('body').text()
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Extract product-like elements
  const products: ScrapedProduct[] = [];

  // Common product selectors
  const productSelectors = [
    '.product', '.producto', '[class*="product"]',
    '.card', '.item', '[class*="item"]',
    'article', '.woocommerce-loop-product',
  ];

  for (const selector of productSelectors) {
    $(selector).each((_, el) => {
      const $el = $(el);
      const name = $el.find('h2, h3, h4, .title, .name, [class*="title"], [class*="name"]').first().text().trim();
      if (!name || name.length < 3) return;

      const description = $el.find('p, .description, [class*="desc"]').first().text().trim();
      const img = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
      const sku = $el.find('[class*="sku"], [class*="code"], [class*="codigo"]').first().text().trim();

      // Avoid duplicates
      if (products.some(p => p.name === name)) return;

      products.push({
        name,
        description: description || undefined,
        sku: sku || undefined,
        imageUrls: img ? [resolveUrl(img, url)] : undefined,
        sourceUrl: url,
      });
    });
  }

  // Extract links (for crawling)
  const links: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      try {
        const resolved = new URL(href, url).toString();
        if (resolved.startsWith('http') && new URL(resolved).hostname === new URL(url).hostname) {
          links.push(resolved);
        }
      } catch {
        // invalid URL
      }
    }
  });

  // Extract images
  const images: string[] = [];
  $('img[src], img[data-src]').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src) {
      images.push(resolveUrl(src, url));
    }
  });

  return {
    title,
    url,
    textContent: textContent.slice(0, 50000), // Limit text size
    products,
    links: [...new Set(links)],
    images: [...new Set(images)],
  };
}

function resolveUrl(src: string, base: string): string {
  try {
    return new URL(src, base).toString();
  } catch {
    return src;
  }
}

export function chunkText(text: string, maxChunkSize: number = 800, overlap: number = 100): string[] {
  if (text.length <= maxChunkSize) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChunkSize;

    // Try to break at sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + maxChunkSize * 0.5) {
        end = breakPoint + 1;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }

  return chunks.filter(c => c.length > 20);
}
