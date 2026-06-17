import { createClient } from './supabase';

const API = process.env.NEXT_PUBLIC_API_URL;

async function getToken() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export async function fetchCompetitions() {
  const res = await fetch(`${API}/api/platform/competitions`);
  if (!res.ok) throw new Error('Failed to fetch competitions');
  return res.json();
}

export async function fetchCompetition(id) {
  const res = await fetch(`${API}/api/platform/competitions/${id}`);
  if (!res.ok) throw new Error('Competition not found');
  return res.json();
}

export async function fetchEntries(competitionId) {
  const token = await getToken();
  const res = await fetch(`${API}/api/platform/competitions/${competitionId}/entries`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
}

export async function toggleLike(competitionId, entryId) {
  const token = await getToken();
  const res = await fetch(
    `${API}/api/platform/competitions/${competitionId}/entries/${entryId}/like`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to toggle like');
  return json; // { liked: bool }
}

export async function fetchMyEntry(competitionId) {
  const token = await getToken();
  if (!token) return { registered: false, entry: null };
  const res = await fetch(`${API}/api/platform/competitions/${competitionId}/my-entry`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to check registration');
  return res.json();
}

export async function registerForCompetition(competitionId, imageFile) {
  const token = await getToken();
  const form  = new FormData();
  form.append('image', imageFile);
  const res = await fetch(`${API}/api/platform/competitions/${competitionId}/register`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to register');
  return json;
}

export async function createCompetition({ title, description, regStart, regEnd, votingEnd, imageFile }) {
  const token = await getToken();
  const form  = new FormData();
  form.append('title',       title);
  form.append('description', description);
  form.append('reg_start',   regStart);
  form.append('reg_end',     regEnd);
  form.append('voting_end',  votingEnd);
  form.append('image',       imageFile);
  const res = await fetch(`${API}/api/platform/competitions`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create competition');
  return json;
}
