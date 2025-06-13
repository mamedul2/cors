import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';

export const config = {
  api: {
    bodyParser: false,
  },
};

const targetUrl = 'http://mamedul.dx.am/contact-handler.php';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const rawBody = Buffer.concat(chunks);

    const headers = { ...req.headers } as Record<string, string>;
    delete headers.host;

    const proxyResponse = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method ?? '') ? undefined : rawBody,
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    res.status(proxyResponse.status);
    proxyResponse.headers.forEach((value, name) => res.setHeader(name, value));

    const proxyBody = Buffer.from(await proxyResponse.arrayBuffer());
    res.send(proxyBody);
  } catch (err: any) {
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}
