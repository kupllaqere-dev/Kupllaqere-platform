'use client';
import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCart } from '@/features/cart/CartProvider';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Page shell ────────────────────────────────────────────────── */
const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  flex: 1;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px 64px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 24px 16px 48px;
  }
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  display: flex;
  gap: 0;
  align-items: flex-start;
  overflow: hidden;
  min-height: 480px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    min-height: unset;
  }
`;

/* ─── Left nav ──────────────────────────────────────────────────── */
const Nav = styled.nav`
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.border.subtle};
  padding: 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-self: stretch;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
    padding: 12px 8px;
    flex-direction: row;
  }
`;

const NavLabel = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 8px 12px 4px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.border.accent : 'transparent'};
  background: ${({ $active, theme }) => $active ? theme.colors.accent.violetAlpha : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.text.accent : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ $active, theme }) => $active ? theme.typography.weights.semibold : theme.typography.weights.normal};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.accent.violetAlpha : theme.colors.bg.glassHover};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex: 1;
    justify-content: center;
  }
`;

const NavIcon = styled.span`
  font-size: 1rem;
  line-height: 1;
`;

/* ─── Content area ──────────────────────────────────────────────── */
const Content = styled.div`
  flex: 1;
  min-width: 0;
  padding: 28px 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 20px 16px;
  }
`;

const ContentHeader = styled.div`
  margin-bottom: 28px;
  animation: ${fadeUp} 0.3s ease;
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['3xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

/* ─── Account tab ───────────────────────────────────────────────── */
const FormSection = styled.div`
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 24px;
  animation: ${fadeUp} 0.35s ease;
`;

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const FormSectionDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const UsernameInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.accent};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
  }
`;

const SaveBtn = styled.button`
  padding: 10px 22px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ disabled, theme }) => disabled ? theme.colors.bg.surface : theme.colors.accent.violetAlpha};
  border: 1px solid ${({ disabled, theme }) => disabled ? theme.colors.border.subtle : theme.colors.border.accent};
  color: ${({ disabled, theme }) => disabled ? theme.colors.text.muted : theme.colors.text.accent};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accent.violet};
    color: #fff;
  }
`;

const FormHint = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 8px;
`;

const SaveMsg = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ $type }) => $type === 'success' ? 'rgba(52, 211, 153, 1)' : 'rgba(251, 113, 133, 1)'};
  margin-top: 10px;
  animation: ${fadeUp} 0.2s ease;
`;

/* ─── Purchase history tab ──────────────────────────────────────── */
const EmptyHistory = styled.div`
  padding: 72px 40px;
  text-align: center;
  animation: ${fadeUp} 0.3s ease;
`;

const EmptyHistoryIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.4;
`;

const EmptyHistoryText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: ${fadeUp} 0.35s ease;
`;

const PurchaseCard = styled.div`
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 18px 20px;
`;

const PurchaseCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const PurchaseId = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  font-family: monospace;
`;

const PurchaseDate = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const PurchaseItemsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const PurchaseItemChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.accent.violetAlpha};
  border: 1px solid ${({ theme }) => theme.colors.border.accent};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.accent};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
`;

const PurchaseQty = styled.span`
  background: rgba(139, 92, 246, 0.3);
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 1px 6px;
  font-size: 0.6rem;
`;

/* ─── Helpers ───────────────────────────────────────────────────── */
function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const TABS = [
  { key: 'account', label: 'Account',          icon: '👤' },
  { key: 'history', label: 'Purchase History',  icon: '🛍️' },
];

/* ─── Page ──────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const { user, profile, loading, updatePlatformUsername } = useAuth();
  const { purchaseHistory } = useCart();
  const router = useRouter();

  const [active,   setActive]   = useState('account');
  const [username, setUsername] = useState('');
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (profile?.platform_username) setUsername(profile.platform_username);
  }, [profile]);

  async function handleSaveUsername() {
    const trimmed = username.trim();
    if (!trimmed) return;
    setSaving(true);
    setSaveMsg(null);
    const { error } = await updatePlatformUsername(trimmed);
    setSaving(false);
    if (error) {
      setSaveMsg({ type: 'error', text: error.message || 'Failed to update username.' });
    } else {
      setSaveMsg({ type: 'success', text: 'Username updated successfully!' });
      setTimeout(() => setSaveMsg(null), 4000);
    }
  }

  if (loading || !user) return null;

  return (
    <PageWrap>
      <Header />
      <Body>
        <Panel>
          <Nav>
            <NavLabel>Settings</NavLabel>
            {TABS.map(t => (
              <NavItem key={t.key} $active={active === t.key} onClick={() => setActive(t.key)}>
                <NavIcon>{t.icon}</NavIcon>
                {t.label}
              </NavItem>
            ))}
          </Nav>

          <Content>
            {active === 'account' && (
              <>
                <ContentHeader>
                  <PageTitle>Account</PageTitle>
                  <PageSubtitle>Manage your platform account settings.</PageSubtitle>
                </ContentHeader>

                <FormSection>
                  <FormSectionTitle>Platform Username</FormSectionTitle>
                  <FormSectionDesc>This is how other players see you across the platform.</FormSectionDesc>
                  <FormRow>
                    <UsernameInput
                      value={username}
                      onChange={e => { setUsername(e.target.value); setSaveMsg(null); }}
                      placeholder="Enter username"
                      maxLength={30}
                    />
                    <SaveBtn
                      onClick={handleSaveUsername}
                      disabled={saving || !username.trim()}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </SaveBtn>
                  </FormRow>
                  <FormHint>Max 30 characters.</FormHint>
                  {saveMsg && <SaveMsg $type={saveMsg.type}>{saveMsg.text}</SaveMsg>}
                </FormSection>
              </>
            )}

            {active === 'history' && (
              <>
                <ContentHeader>
                  <PageTitle>Purchase History</PageTitle>
                  <PageSubtitle>Your past purchases from the platform store.</PageSubtitle>
                </ContentHeader>

                {purchaseHistory.length === 0 ? (
                  <EmptyHistory>
                    <EmptyHistoryIcon>🛍️</EmptyHistoryIcon>
                    <EmptyHistoryText>No purchases yet. Head to the store to get started.</EmptyHistoryText>
                  </EmptyHistory>
                ) : (
                  <HistoryList>
                    {purchaseHistory.map(purchase => (
                      <PurchaseCard key={purchase.id}>
                        <PurchaseCardHeader>
                          <PurchaseId>Order #{String(purchase.id).slice(-8)}</PurchaseId>
                          <PurchaseDate>{formatDate(purchase.date)}</PurchaseDate>
                        </PurchaseCardHeader>
                        <PurchaseItemsGrid>
                          {purchase.items.map((item, i) => (
                            <PurchaseItemChip key={i}>
                              {item.name}
                              {item.qty > 1 && <PurchaseQty>×{item.qty}</PurchaseQty>}
                            </PurchaseItemChip>
                          ))}
                        </PurchaseItemsGrid>
                      </PurchaseCard>
                    ))}
                  </HistoryList>
                )}
              </>
            )}
          </Content>
        </Panel>
      </Body>
      <Footer />
    </PageWrap>
  );
}
