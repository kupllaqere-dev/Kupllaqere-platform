'use client';
import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/features/auth/AuthProvider';
import { fetchNotifications, markRead, markAllRead } from '@/lib/notificationsApi';

/* ─── Animations ─────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Layout ─────────────────────────────────────────────────── */
const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  flex: 1;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px 64px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 24px 16px 48px;
  }
`;

/* ─── Page header ────────────────────────────────────────────── */
const PageTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  animation: ${fadeUp} 0.25s ease;
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['3xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MarkAllBtn = styled.button`
  padding: 8px 18px;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border.accent};
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

/* ─── Notification list ──────────────────────────────────────── */
const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  overflow: hidden;
  animation: ${fadeUp} 0.3s ease;
`;

const NotifRow = styled.button`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  padding: 18px 22px;
  background: ${({ $unread, theme }) =>
    $unread ? 'rgba(200, 121, 65, 0.07)' : theme.colors.bg.surface};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:last-child { border-bottom: none; }

  &:hover {
    background: ${({ $unread }) =>
      $unread ? 'rgba(200, 121, 65, 0.13)' : 'rgba(255,255,255,0.03)'};
  }
`;

const UnreadDot = styled.span`
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent.violet};
  flex-shrink: 0;
`;

const NotifTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  padding-left: ${({ $unread }) => $unread ? '12px' : '0'};
`;

const NotifBody = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  padding-left: ${({ $unread }) => $unread ? '12px' : '0'};
`;

const NotifTime = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  align-self: flex-end;
  margin-top: 2px;
`;

/* ─── States ─────────────────────────────────────────────────── */
const EmptyState = styled.div`
  text-align: center;
  padding: 80px 24px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 12px;
  opacity: 0.35;
`;

/* ─── Skeleton ───────────────────────────────────────────────── */
const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;

const SkeletonRow = styled.div`
  padding: 18px 22px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:last-child { border-bottom: none; }
`;

const SkeletonLine = styled.div`
  height: ${({ $h }) => $h || '13px'};
  width: ${({ $w }) => $w || '100%'};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: linear-gradient(90deg,
    rgba(255,255,255,0.05) 25%,
    rgba(255,255,255,0.1)  50%,
    rgba(255,255,255,0.05) 75%
  );
  background-size: 600px 100%;
  animation: ${shimmer} 1.6s infinite linear;
`;

/* ─── Pagination ─────────────────────────────────────────────── */
const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 28px;
`;

const PageBtn = styled.button`
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.text.secondary};
  background: ${({ $active, theme }) => $active
    ? `linear-gradient(135deg, ${theme.colors.accent.violet}, ${theme.colors.accent.violetDark})`
    : theme.colors.bg.elevated};
  border: 1px solid ${({ $active, theme }) => $active ? 'transparent' : theme.colors.border.medium};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.4 : 1};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled):not([data-active]) {
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border.accent};
  }
`;

const PageInfo = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  padding: 0 4px;
`;

/* ─── Helpers ────────────────────────────────────────────────── */
const LIMIT = 10;

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [loading, setLoading]             = useState(true);
  const [markingAll, setMarkingAll]       = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const load = useCallback(async (p = 1) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchNotifications({ page: p, limit: LIMIT });
      setNotifications(res.notifications);
      setTotal(res.total);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) load(page);
  }, [authLoading, page, load]);

  async function handleNotifClick(notif) {
    if (notif.read) return;
    try {
      await markRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    } catch { /* silent */ }
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* silent */ } finally {
      setMarkingAll(false);
    }
  }

  function goToPage(p) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasUnread = notifications.some(n => !n.read);

  return (
    <PageWrap>
      <Header />
      <Body>
        <PageTop>
          <PageTitle>Notifications</PageTitle>
          {hasUnread && (
            <MarkAllBtn onClick={handleMarkAll} disabled={markingAll}>
              {markingAll ? 'Marking…' : 'Mark all as read'}
            </MarkAllBtn>
          )}
        </PageTop>

        {/* Skeleton */}
        {loading && (
          <List>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i}>
                <SkeletonLine $h="14px" $w="45%" />
                <SkeletonLine $h="12px" $w="80%" />
                <SkeletonLine $h="11px" $w="25%" />
              </SkeletonRow>
            ))}
          </List>
        )}

        {/* Empty */}
        {!loading && notifications.length === 0 && (
          <EmptyState>
            <EmptyIcon>🔔</EmptyIcon>
            You have no notifications yet.
          </EmptyState>
        )}

        {/* List */}
        {!loading && notifications.length > 0 && (
          <List>
            {notifications.map(notif => (
              <NotifRow
                key={notif.id}
                $unread={!notif.read}
                onClick={() => handleNotifClick(notif)}
              >
                {!notif.read && <UnreadDot />}
                <NotifTitle $unread={!notif.read}>{notif.title}</NotifTitle>
                <NotifBody $unread={!notif.read}>{notif.body}</NotifBody>
                <NotifTime>{formatTime(notif.created_at)}</NotifTime>
              </NotifRow>
            ))}
          </List>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination>
            <PageBtn onClick={() => goToPage(page - 1)} disabled={page === 1}>←</PageBtn>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === '…'
                  ? <PageInfo key={`ellipsis-${i}`}>…</PageInfo>
                  : <PageBtn key={item} $active={item === page} onClick={() => goToPage(item)}>{item}</PageBtn>
              )
            }

            <PageBtn onClick={() => goToPage(page + 1)} disabled={page === totalPages}>→</PageBtn>
          </Pagination>
        )}
      </Body>
      <Footer />
    </PageWrap>
  );
}
