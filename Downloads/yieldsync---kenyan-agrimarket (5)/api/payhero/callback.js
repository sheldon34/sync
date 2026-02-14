import { json, readBody } from '../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, message: 'Method not allowed' });
  }

  const { raw, data } = await readBody(req);

  // NOTE: If PayHero provides a signature mechanism, verify it here.
  console.log('[PayHero Callback] raw:', raw);
  console.log('[PayHero Callback] data:', data);

  return json(res, 200, { ok: true });
}
