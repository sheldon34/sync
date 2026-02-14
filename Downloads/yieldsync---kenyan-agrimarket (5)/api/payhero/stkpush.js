import { getPublicBaseUrl, json, normalizePhone, readBody } from '../_utils.js';

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
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { success: false, message: 'Method not allowed' });
  }

  try {
    const { data } = await readBody(req);
    const serviceId = process.env.PAYHERO_SERVICE_ID;
    requireEnv('PAYHERO_SERVICE_ID', serviceId);

    const phoneNumber = normalizePhone(data.phoneNumber);
    const amount = Number(data.amount);
    const reference = String(data.reference || `TRX-${Date.now()}`);

    if (!phoneNumber) return json(res, 400, { success: false, message: 'phoneNumber is required' });
    if (!Number.isFinite(amount) || amount <= 0) return json(res, 400, { success: false, message: 'amount must be a positive number' });

    const publicBaseUrl = getPublicBaseUrl(req);
    const callbackUrl = new URL('/api/payhero/callback', publicBaseUrl).toString();

    const payload = {
      amount,
      phone_number: phoneNumber,
      channel_id: Number(serviceId),
      provider: 'm-pesa',
      external_reference: reference,
      callback_url: callbackUrl,
    };

    const response = await fetch(`${PAYHERO_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const payhero = await response.json().catch(() => null);
    if (!response.ok) {
      return json(res, 502, { success: false, message: 'PayHero request failed', details: payhero });
    }

    return json(res, 200, { success: true, message: 'STK Push Sent', reference, callbackUrl, payhero });
  } catch (err) {
    return json(res, 500, { success: false, message: err?.message || 'Server error' });
  }
}
