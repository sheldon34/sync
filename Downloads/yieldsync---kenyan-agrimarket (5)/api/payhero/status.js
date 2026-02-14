import { json } from '../_utils.js';

const PAYHERO_BASE_URL = process.env.PAYHERO_BASE_URL || 'https://backend.payhero.co.ke/api/v2';

function requireEnv(name, value) {
  if (!value) throw new Error(`Missing required env var: ${name}`);
}

function getAuthHeader() {
  const username = process.env.PAYHERO_USERNAME;
  const password = process.env.PAYHERO_PASSWORD;
  requireEnv('PAYHERO_USERNAME', username);
  requireEnv('PAYHERO_PASSWORD', password);
  const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { success: false, message: 'Method not allowed' });
  }

  try {
    const reference = String(req.query?.reference || '').trim();
    if (!reference) return json(res, 400, { success: false, message: 'reference is required' });

    const response = await fetch(`${PAYHERO_BASE_URL}/payments?external_reference=${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: { Authorization: getAuthHeader() },
    });

    const payhero = await response.json().catch(() => null);
    if (!response.ok) {
      return json(res, 502, { success: false, message: 'PayHero status request failed', details: payhero });
    }

    return json(res, 200, { success: true, payhero });
  } catch (err) {
    return json(res, 500, { success: false, message: err?.message || 'Server error' });
  }
}
