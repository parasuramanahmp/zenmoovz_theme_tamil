/* ───────────────────────── OTP service ─────────────────────────
   The store has no server, so by default this runs in DEMO MODE: a random 4-digit code is made in the browser and
   shown on the OTP card ("Demo mode · your code is ····"). Nothing is sent to a phone.

   To send REAL codes, set VITE_OTP_API in a .env file (e.g. VITE_OTP_API=https://api.yourshop.in) and expose:
     POST {API}/otp/send    body { phone }        → 200 when the SMS was sent
     POST {API}/otp/verify  body { phone, code }  → 200 { ok: true } or { ok: false, reason: 'wrong' | 'expired' | 'locked' }
   (MSG91, Twilio Verify, Firebase Auth phone and Fast2SMS all fit behind those two routes.)
   The OTP card does not change: it only calls requestOtp() and verifyOtp() below.
   A code must always be checked on your server in production: a check that lives in the browser can be bypassed. */

const API = import.meta.env.VITE_OTP_API;
export const OTP_DEMO = !API;
export const OTP_LENGTH = 4, OTP_TTL_MS = 5 * 60 * 1000, MAX_TRIES = 5;

const wait = ms => new Promise(r => setTimeout(r, ms));
const post = (path, body) => fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
let pending = null;   // demo mode only: { phone, code, exp, tries }

/* Ask for a code for a 10-digit mobile number. Resolves { demoCode } in demo mode, {} otherwise; rejects if it could not be sent. */
export async function requestOtp(phone) {
  if (API) {
    const r = await post('/otp/send', { phone });
    if (!r.ok) throw new Error('send-failed');
    return {};
  }
  await wait(600);
  const code = String(1000 + Math.floor(Math.random() * 9000));
  pending = { phone, code, exp: Date.now() + OTP_TTL_MS, tries: 0 };
  return { demoCode: code };
}

/* Check a code. Resolves { ok: true } or { ok: false, reason: 'wrong' | 'expired' | 'locked' | 'network' } */
export async function verifyOtp(phone, code) {
  if (API) {
    try {
      const r = await post('/otp/verify', { phone, code });
      const j = await r.json().catch(() => ({}));
      return r.ok && j.ok !== false ? { ok: true } : { ok: false, reason: j.reason || 'wrong' };
    } catch { return { ok: false, reason: 'network' }; }
  }
  await wait(350);
  if (!pending || pending.phone !== phone || Date.now() > pending.exp) return { ok: false, reason: 'expired' };
  if (pending.tries >= MAX_TRIES) return { ok: false, reason: 'locked' };
  pending.tries += 1;
  if (code !== pending.code) return { ok: false, reason: 'wrong' };
  pending = null;
  return { ok: true };
}
