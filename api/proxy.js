export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function (req, res) {
  const targetUrl = 'http://mamedul.dx.am/contact-handler.php';

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);

    const headers = { ...req.headers };
    delete headers.host;

    const proxyResponse = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : rawBody,
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    res.status(proxyResponse.status);
    proxyResponse.headers.forEach((value, name) => res.setHeader(name, value));

    const proxyBody = await proxyResponse.arrayBuffer();
    res.send(Buffer.from(proxyBody));
  } catch (err) {
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}
