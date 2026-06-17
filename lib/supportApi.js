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

export async function submitTicket({ category, message }) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/support/tickets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ category, message }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to submit ticket');
  return json;
}

export async function fetchTickets() {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/support/tickets`, { headers });
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

export async function fetchTicket(id) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/support/tickets/${id}`, { headers });
  if (!res.ok) throw new Error('Ticket not found');
  return res.json();
}

export async function replyToTicket(id, message) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/support/tickets/${id}/reply`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to send reply');
  return json;
}

export async function updateTicketStatus(id, status) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/api/platform/support/tickets/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update status');
  return json;
}
