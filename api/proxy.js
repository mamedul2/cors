export const config = {
  api: {
    bodyParser: false, // Important: Prevent Vercel from parsing body
  },
};

export default async function handler(req, res) {
  const targetUrl = 'http://mamedul.dx.am/contact-handler.php';

  try {
    // Read raw request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    // Prepare headers (excluding `host` to avoid issues)
    const headers = { ...req.headers };
    delete headers.host;

    const proxyResponse = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : rawBody,
    });

    // Pipe response status and headers
    res.status(proxyResponse.status);
    proxyResponse.headers.forEach((value, name) => res.setHeader(name, value));

    // Stream back the response
    const proxyBody = await proxyResponse.arrayBuffer();
    res.send(Buffer.from(proxyBody));
  } catch (err) {
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}
