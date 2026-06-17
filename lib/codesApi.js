import { createClient } from './supabase';

const API = process.env.NEXT_PUBLIC_API_URL;

async function authHeaders() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

export async function redeemCode(code) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/codes/redeem`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to redeem code.');
  return json; // { success, lisAwarded }
}

export async function fetchCodes() {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/codes`, { headers });
  if (!res.ok) throw new Error('Failed to fetch codes.');
  return res.json();
}

export async function createCode({ code, lis_amount }) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/codes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code, lis_amount }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create code.');
  return json;
}

export async function toggleCode(id) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/codes/${id}/toggle`, {
    method: 'PATCH',
    headers,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update code.');
  return json;
}
