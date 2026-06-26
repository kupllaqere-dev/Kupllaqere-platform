'use client';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import Avatar from '@/components/ui/Avatar';
import { OutlineButton, PrimaryButton } from '@/components/ui/Button';
import SearchBar from '@/components/SearchBar';
import { fetchUnreadCount, fetchRecentNotifications, markRead } from '@/lib/notificationsApi';

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

/* ─── Wrapper ────────────────────────────────────────────────── */
const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  background: linear-gradient(180deg, rgba(12, 10, 7, 0.97) 0%, rgba(12, 10, 7, 0.88) 100%);
  backdrop-filter: blur(28px) saturate(1.6);
  -webkit-backdrop-filter: blur(28px) saturate(1.6);
  border-bottom: 1px solid rgba(200, 168, 120, 0.10);
  overflow: visible;
`;

/* ─── 3-column grid ──────────────────────────────────────────── */
const HeaderInner = styled.div`
  max-width: 1260px;
  width: 100%;
  margin: 0 auto;
  padding: 0 28px;
  height: 68px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  overflow: visible;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: auto 1fr auto;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 16px;
  }
`;

/* ─── Left nav ───────────────────────────────────────────────── */
const LeftNav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

/* ─── Center logo ────────────────────────────────────────────── */
const LogoWrap = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  position: relative;
  z-index: 1;
  overflow: visible;
`;

const LogoImg = styled.img`
  height: 88px;
  width: auto;
  object-fit: contain;
  transform: translateY(10px);
  transition:
    transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1),
    filter    250ms ease;
  filter: drop-shadow(0 4px 20px rgba(200, 121, 65, 0.38));

  &:hover {
    transform: translateY(10px) scale(1.13);
    filter: drop-shadow(0 6px 28px rgba(200, 121, 65, 0.60));
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    height: 60px;
    transform: translateY(6px);

    &:hover {
      transform: translateY(6px) scale(1.1);
    }
  }
`;

/* ─── Right nav ──────────────────────────────────────────────── */
const RightNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 2px;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

/* Auth pinned to the far right of the full-width header, outside the letterbox */
const AuthFixed = styled.div`
  position: absolute;
  right: 28px;
  top: calc(50% + 8px);
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  z-index: 1;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const AuthGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  margin-left: auto;
  padding-left: ${({ theme }) => theme.spacing['4']};
  border-left: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

/* ─── Shared nav link ────────────────────────────────────────── */
const NavLink = styled(Link)`
  padding: 0.4rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: rgba(245, 236, 224, 0.80);
  letter-spacing: 0.01em;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: #fff;
    background: ${({ theme }) => theme.colors.bg.glass};
  }
`;

/* ─── User section ───────────────────────────────────────────── */
const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
`;

const NotificationBtn = styled.button`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.bg.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  transition: all ${({ theme }) => theme.transitions.fast};
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border.default};
    background: ${({ theme }) => theme.colors.bg.glassHover};
  }
`;

const NotifBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: #b91c1c;
  border: 2px solid ${({ theme }) => theme.colors.bg.root};
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
`;

/* ─── Dropdown ───────────────────────────────────────────────── */
const DropdownWrap = styled.div`
  position: relative;
`;

const UserChip = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  padding: 0.25rem 0.75rem 0.25rem 0.3rem;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.bg.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover, &[aria-expanded="true"] {
    border-color: ${({ theme }) => theme.colors.border.accent};
    background: ${({ theme }) => theme.colors.bg.glassHover};
  }
`;

const Username = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`;

const ChevronIcon = styled.span`
  font-size: 0.6rem;
  color: ${({ theme }) => theme.colors.text.muted};
  transition: transform ${({ theme }) => theme.transitions.fast};
  transform: ${({ $open }) => $open ? 'rotate(180deg)' : 'rotate(0deg)'};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: rgba(20, 16, 10, 0.98);
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  padding: 0.375rem;
  z-index: ${({ theme }) => theme.zIndex.header + 1};
  animation: ${slideDown} 0.15s ease;
  transform-origin: top right;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.bg.glass};
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.accent.rose};
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(251, 113, 133, 0.08);
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.subtle};
  margin: 0.375rem 0;
`;

/* ─── Notification dropdown ──────────────────────────────────── */
const NotifWrap = styled.div`
  position: relative;
`;

const NotifDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: rgba(20, 16, 10, 0.98);
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  z-index: ${({ theme }) => theme.zIndex.header + 1};
  animation: ${slideDown} 0.15s ease;
  transform-origin: top right;
  overflow: hidden;
`;

const NotifHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const NotifTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const ViewAllBtn = styled(Link)`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.accent.violet};
  text-decoration: none;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  &:hover { opacity: 0.75; }
`;

const NotifItem = styled.button`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 12px 14px;
  background: ${({ $unread, theme }) =>
    $unread ? 'rgba(200, 121, 65, 0.09)' : 'transparent'};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  cursor: pointer;
  text-align: left;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:last-child { border-bottom: none; }

  &:hover {
    background: ${({ $unread }) =>
      $unread ? 'rgba(200, 121, 65, 0.14)' : 'rgba(196,181,253,0.04)'};
  }
`;

const NotifItemTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.3;
`;

const NotifItemBody = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.45;
`;

const NotifItemTime = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 2px;
  align-self: flex-end;
`;

const NotifEmpty = styled.div`
  padding: 28px 14px;
  text-align: center;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

/* ─── Mobile controls ────────────────────────────────────────── */
const MobileLeft = styled.div`
  display: none;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
  }
`;

const MobileRight = styled.div`
  display: none;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing['2']};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
  }
`;

const MobileMenuBtn = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.bg.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  font-size: 1.2rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const MobileLogoWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed;
  top: 68px;
  left: 0;
  right: 0;
  background: rgba(20, 16, 10, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: ${({ theme }) => theme.spacing['4']};
  z-index: ${({ theme }) => theme.zIndex.header - 1};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['2']};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: ${({ $open }) => $open ? 'flex' : 'none'};
  }
`;

const MobileNavLink = styled(Link)`
  padding: 0.7rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.bg.glass};
  }
`;

/* ─── Data ───────────────────────────────────────────────────── */
const leftLinks  = [
  { label: 'Home',   href: '/' },
  { label: 'News',   href: '/news' },
  { label: 'Forums', href: '/forums' },
];

const rightLinks = [
  { label: 'Store',        href: '/store' },
  { label: 'Competitions', href: '/competitions' },
  { label: 'Support',      href: '/support' },
];

const allLinks = [...leftLinks, ...rightLinks];

/* ─── Component ──────────────────────────────────────────────── */
function formatNotifTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Poll unread count while user is logged in
  const refreshCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    refreshCount();
    const id = setInterval(refreshCount, 60_000);
    window.addEventListener('notif:refresh', refreshCount);
    return () => {
      clearInterval(id);
      window.removeEventListener('notif:refresh', refreshCount);
    };
  }, [user, refreshCount]);

  // Close both dropdowns on outside click
  useEffect(() => {
    if (!dropdownOpen && !notifOpen) return;
    function onMouseDown(e) {
      if (!e.target.closest('[data-user-dropdown]')) setDropdownOpen(false);
      if (!e.target.closest('[data-notif-dropdown]')) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [dropdownOpen, notifOpen]);

  async function handleBellClick() {
    const opening = !notifOpen;
    setNotifOpen(opening);
    setDropdownOpen(false);
    if (opening) {
      setNotifLoading(true);
      try {
        const data = await fetchRecentNotifications(3);
        setRecentNotifs(data);
      } catch { /* silent */ } finally {
        setNotifLoading(false);
      }
    }
  }

  async function handleNotifClick(notif) {
    setNotifOpen(false);
    if (!notif.read) {
      try {
        await markRead(notif.id);
        setUnreadCount(c => Math.max(0, c - 1));
        setRecentNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      } catch { /* silent */ }
    }
    router.push('/notifications');
  }

  function handleDropdownNav(href) {
    setDropdownOpen(false);
    router.push(href);
  }

  async function handleSignOut() {
    setDropdownOpen(false);
    router.push('/');
    await signOut();
  }

  const displayName = profile?.platform_username || profile?.name || user?.email?.split('@')[0] || 'Player';
  const avatarSrc   = profile?.platform_avatar || null;

  const notifDropdown = (
    <NotifWrap data-notif-dropdown="true">
      <NotificationBtn
        aria-label="Notifications"
        aria-expanded={notifOpen}
        onClick={handleBellClick}
      >
        🔔
        {unreadCount > 0 && (
          <NotifBadge>{unreadCount > 99 ? '99+' : unreadCount}</NotifBadge>
        )}
      </NotificationBtn>

      {notifOpen && (
        <NotifDropdown>
          <NotifHeader>
            <NotifTitle>Notifications</NotifTitle>
            <ViewAllBtn href="/notifications" onClick={() => setNotifOpen(false)}>
              View all
            </ViewAllBtn>
          </NotifHeader>

          {notifLoading && <NotifEmpty>Loading…</NotifEmpty>}

          {!notifLoading && recentNotifs.length === 0 && (
            <NotifEmpty>No notifications yet.</NotifEmpty>
          )}

          {!notifLoading && recentNotifs.map(notif => (
            <NotifItem
              key={notif.id}
              $unread={!notif.read}
              onClick={() => handleNotifClick(notif)}
            >
              <NotifItemTitle>{notif.title}</NotifItemTitle>
              <NotifItemBody>{notif.body}</NotifItemBody>
              <NotifItemTime>{formatNotifTime(notif.created_at)}</NotifItemTime>
            </NotifItem>
          ))}
        </NotifDropdown>
      )}
    </NotifWrap>
  );

  const userDropdown = (
    <DropdownWrap data-user-dropdown="true">
      <UserChip
        onClick={() => setDropdownOpen(prev => !prev)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <Avatar src={avatarSrc} username={avatarSrc ? displayName : ''} color="#c87941" size="28px" fontSize="0.75rem" />
        <Username>{displayName}</Username>
        <ChevronIcon $open={dropdownOpen}>▼</ChevronIcon>
      </UserChip>

      {dropdownOpen && (
        <DropdownMenu>
          <DropdownItem onClick={() => handleDropdownNav('/profile')}>
            👤 Profile
          </DropdownItem>
          <DropdownItem onClick={() => handleDropdownNav('/settings')}>
            ⚙️ Settings
          </DropdownItem>
          {profile?.role === 'admin' && (
            <>
              <DropdownDivider />
              <DropdownItem onClick={() => handleDropdownNav('/admin')}>
                🛡️ Admin Panel
              </DropdownItem>
            </>
          )}
          <DropdownDivider />
          <DropdownButton onClick={handleSignOut}>
            ↪ Log out
          </DropdownButton>
        </DropdownMenu>
      )}
    </DropdownWrap>
  );

  const authNode = !loading && (
    user ? (
      <UserSection>
        <SearchBar />
        {notifDropdown}
        {userDropdown}
      </UserSection>
    ) : (
      <>
        <OutlineButton as={Link} href="/login" size="sm">Sign In</OutlineButton>
        <PrimaryButton as={Link} href="/register" size="sm">Register</PrimaryButton>
      </>
    )
  );

  return (
    <>
      <HeaderWrapper>
        {/* ── Auth: pinned to viewport right edge, outside letterbox ── */}
        <AuthFixed>{authNode}</AuthFixed>

        <HeaderInner>

          {/* ── Desktop left nav ── */}
          <LeftNav>
            {leftLinks.map(link => (
              <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
            ))}
          </LeftNav>

          {/* ── Mobile: hamburger ── */}
          <MobileLeft>
            <MobileMenuBtn
              onClick={() => setMobileOpen(prev => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </MobileMenuBtn>
          </MobileLeft>

          {/* ── Centre logo ── */}
          <MobileLogoWrap>
            <LogoWrap href="/" aria-label="Neclis World home">
              <LogoImg src="/logo.png" alt="Neclis World" />
            </LogoWrap>
          </MobileLogoWrap>

          {/* ── Desktop right nav ── */}
          <RightNav>
            {rightLinks.map(link => (
              <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
            ))}
          </RightNav>

          {/* ── Mobile right: auth ── */}
          <MobileRight>
            {authNode}
          </MobileRight>

        </HeaderInner>
      </HeaderWrapper>

      <MobileMenu $open={mobileOpen}>
        <SearchBar fullWidth onNavigate={() => setMobileOpen(false)} />
        {allLinks.map(link => (
          <MobileNavLink key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
            {link.label}
          </MobileNavLink>
        ))}
      </MobileMenu>
    </>
  );
}
