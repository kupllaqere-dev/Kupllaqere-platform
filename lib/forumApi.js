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

export async function fetchPosts(limit) {
  const url = `${API}/api/platform/forum/posts${limit ? `?limit=${limit}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function fetchThread(id) {
  const res = await fetch(`${API}/api/platform/forum/posts/${id}`);
  if (!res.ok) throw new Error('Thread not found');
  return res.json();
}

export async function createPost({ title, body, category, category_color }) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/forum/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, body, category, category_color }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create post');
  return json;
}

export async function createReply(postId, body, parentReplyId = null) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/forum/posts/${postId}/replies`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ body, parent_reply_id: parentReplyId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to post reply');
  return json;
}

export async function reportPost(postId, reason = '') {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/forum/posts/${postId}/report`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to submit report');
  return json;
}

export async function reportReply(replyId, reason = '') {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/forum/replies/${replyId}/report`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to submit report');
  return json;
}

export async function fetchReports() {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/forum/reports`, { headers });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function resolveReport(reportId) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/forum/reports/${reportId}/resolve`, {
    method: 'PATCH',
    headers,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to resolve report');
  return json;
}

export async function deletePost(postId) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/forum/posts/${postId}`, {
    method: 'DELETE',
    headers,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to delete post');
  return json;
}

export async function deleteReply(replyId) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/forum/replies/${replyId}`, {
    method: 'DELETE',
    headers,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to delete reply');
  return json;
}
