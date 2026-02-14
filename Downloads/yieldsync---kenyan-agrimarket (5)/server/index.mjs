import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PAYHERO_BASE_URL = process.env.PAYHERO_BASE_URL || 'https://backend.payhero.co.ke/api/v2';
const PAYHERO_USERNAME = process.env.PAYHERO_USERNAME;
const PAYHERO_PASSWORD = process.env.PAYHERO_PASSWORD;
const PAYHERO_SERVICE_ID = process.env.PAYHERO_SERVICE_ID;

// Public URL PayHero can reach (ngrok / deployed domain)
// Example: https://xxxx.ngrok-free.app
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL;

function requireEnv(name, value) {
  if (!value) {
    const err = new Error(`Missing required env var: ${name}`);
    err.statusCode = 500;
    throw err;
  }
}

function getAuthHeader() {
  requireEnv('PAYHERO_USERNAME', PAYHERO_USERNAME);
  requireEnv('PAYHERO_PASSWORD', PAYHERO_PASSWORD);
  const token = Buffer.from(`${PAYHERO_USERNAME}:${PAYHERO_PASSWORD}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

function normalizePhone(phone) {
  let p = String(phone || '').replace(/\s+/g, '');
  if (p.startsWith('0')) return '254' + p.substring(1);
  if (p.startsWith('+254')) return p.substring(1);
  if (p.startsWith('7')) return '254' + p;
  return p;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Initiate STK push server-side (avoids CORS and hides credentials)
app.post('/api/payhero/stkpush', async (req, res) => {
  try {
    requireEnv('PAYHERO_SERVICE_ID', PAYHERO_SERVICE_ID);
    requireEnv('PUBLIC_BASE_URL', PUBLIC_BASE_URL);

    const { phoneNumber, amount, reference } = req.body || {};
    const normalizedPhone = normalizePhone(phoneNumber);
    const parsedAmount = Number(amount);
    const externalReference = reference || `TRX-${Date.now()}`;

    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: 'phoneNumber is required' });
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }

    const callbackUrl = new URL('/api/payhero/callback', PUBLIC_BASE_URL).toString();

    const payload = {
      amount: parsedAmount,
      phone_number: normalizedPhone,
      channel_id: Number(PAYHERO_SERVICE_ID),
      provider: 'm-pesa',
      external_reference: externalReference,
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

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'PayHero request failed', details: data });
    }

    return res.json({ success: true, message: 'STK Push Sent', reference: externalReference, payhero: data });
  } catch (err) {
    const status = err?.statusCode || 500;
    res.status(status).json({ success: false, message: err?.message || 'Server error' });
  }
});

// Poll transaction status server-side (optional helper)
app.get('/api/payhero/status', async (req, res) => {
  try {
    const reference = String(req.query.reference || '').trim();
    if (!reference) {
      return res.status(400).json({ success: false, message: 'reference is required' });
    }

    const response = await fetch(`${PAYHERO_BASE_URL}/payments?external_reference=${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: { Authorization: getAuthHeader() },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'PayHero status request failed', details: data });
    }

    res.json({ success: true, payhero: data });
  } catch (err) {
    const status = err?.statusCode || 500;
    res.status(status).json({ success: false, message: err?.message || 'Server error' });
  }
});

// PayHero callback/webhook target (this is what ngrok must expose)
app.post('/api/payhero/callback', async (req, res) => {
  // TODO: verify signature if PayHero provides one (not implemented here).
  // For now we just acknowledge and log.
  console.log('[PayHero Callback] headers:', req.headers);
  console.log('[PayHero Callback] body:', req.body);
  res.json({ ok: true });
});

const port = Number(process.env.PORT || 8787);
app.listen(port, '0.0.0.0', () => {
  console.log(`PayHero backend listening on http://0.0.0.0:${port}`);
  if (PUBLIC_BASE_URL) {
    console.log(`Configured PUBLIC_BASE_URL=${PUBLIC_BASE_URL}`);
    console.log(`Callback URL: ${new URL('/api/payhero/callback', PUBLIC_BASE_URL).toString()}`);
  } else {
    console.log('PUBLIC_BASE_URL not set (set it to your ngrok https URL).');
  }
});
