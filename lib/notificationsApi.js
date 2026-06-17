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

export async function fetchUnreadCount() {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/notifications/unread-count`, { headers });
  if (!res.ok) throw new Error('Failed to fetch unread count');
  const json = await res.json();
  return json.count ?? 0;
}

export async function fetchRecentNotifications(limit = 3) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/notifications/recent?limit=${limit}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function fetchNotifications({ page = 1, limit = 10 } = {}) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/notifications?page=${page}&limit=${limit}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json(); // { notifications, total, page, limit }
}

export async function markRead(id) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/notifications/${id}/read`, {
    method: 'PATCH',
    headers,
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return res.json();
}

export async function markAllRead() {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/notifications/read-all`, {
    method: 'PATCH',
    headers,
  });
  if (!res.ok) throw new Error('Failed to mark all as read');
  return res.json();
}
