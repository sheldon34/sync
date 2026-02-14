function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export async function readBody(req) {
  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  const raw = await getRawBody(req);

  if (!raw) return { raw: '', data: {} };

  if (contentType.includes('application/json')) {
    try {
      return { raw, data: JSON.parse(raw) };
    } catch {
      return { raw, data: {} };
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    const obj = {};
    for (const [k, v] of params.entries()) obj[k] = v;
    return { raw, data: obj };
  }

  return { raw, data: { raw } };
}

export function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export function normalizePhone(phone) {
  let p = String(phone || '').replace(/\s+/g, '');
  if (p.startsWith('0')) return '254' + p.substring(1);
  if (p.startsWith('+254')) return p.substring(1);
  if (p.startsWith('7')) return '254' + p;
  if (p.startsWith('+')) return p.substring(1);
  return p;
}

export function getPublicBaseUrl(req) {
  const envBase = process.env.PUBLIC_BASE_URL;
  if (envBase) return envBase;

  const proto = String(req.headers['x-forwarded-proto'] || 'https');
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  return `${proto}://${host}`;
}
