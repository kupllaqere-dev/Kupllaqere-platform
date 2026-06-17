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

export async function fetchDailyRewardStatus() {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/daily-reward`, { headers });
  if (!res.ok) throw new Error('Failed to fetch reward status');
  return res.json(); // { streak, claimedToday, todayCoins, tomorrowCoins }
}

export async function claimDailyReward() {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/daily-reward/claim`, {
    method: 'POST',
    headers,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to claim reward');
  return json; // { coinsAwarded, newStreak, newCoins }
}
