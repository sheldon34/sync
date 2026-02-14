import { json } from './_utils.js';

export default function handler(_req, res) {
  return json(res, 200, { ok: true });
}
