import { createClient } from './supabase';

const API = process.env.NEXT_PUBLIC_API_URL;

async function getToken() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export async function fetchNews(limit) {
  const url = `${API}/api/platform/news${limit ? `?limit=${limit}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}

export async function fetchArticle(id) {
  const res = await fetch(`${API}/api/platform/news/${id}`);
  if (!res.ok) throw new Error('Article not found');
  return res.json();
}

export async function createNews({ title, content, imageFile }) {
  const token = await getToken();
  const form = new FormData();
  form.append('title', title);
  form.append('content', content);
  form.append('image', imageFile);

  const res = await fetch(`${API}/api/platform/news`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to publish article');
  return json;
}

export async function deleteNews(id) {
  const token = await getToken();
  const res = await fetch(`${API}/api/platform/news/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || 'Failed to delete article');
  }
  return res.json();
}
