export const url = process.env.SUPABASE_URL || '';
export const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!key || !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(url)) throw new Error('Operação recusada: exige credencial do Supabase em localhost.');
export async function request(path, options = {}) {
  const response = await fetch(`${url}${path}`, { ...options, headers: {
    apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
    ...(options.headers || {}),
  }});
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase local respondeu HTTP ${response.status}: ${text.slice(0, 240)}`);
  return text ? JSON.parse(text) : null;
}
