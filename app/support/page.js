'use client';
import { useState } from 'react';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { submitTicket } from '@/lib/supportApi';

/* â”€â”€â”€ Animations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* â”€â”€â”€ Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px 64px;
  gap: 28px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    padding: 16px 16px 48px;
    gap: 16px;
  }
`;

/* â”€â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Sidebar = styled.aside`
  width: 220px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 20px 12px;
  height: fit-content;
  position: sticky;
  top: 92px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    position: static;
  }
`;

const SidebarTitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0 8px;
  margin-bottom: 8px;
`;

const SidebarItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ $active, theme }) => $active ? theme.colors.text.primary : theme.colors.text.secondary};
  background: ${({ $active, theme }) => $active ? theme.colors.accent.violetAlpha : 'transparent'};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.border.accent : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ $active, theme }) => $active ? theme.colors.accent.violetAlpha : theme.colors.bg.elevated};
  }
`;

const SidebarSubItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px 8px 28px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.accent.violet};
  background: ${({ theme }) => theme.colors.accent.violetAlpha};
  border: 1px solid rgba(200,121,65,0.2);
  cursor: pointer;
  text-align: left;
  transition: all ${({ theme }) => theme.transitions.fast};
  margin-top: 4px;

  &:hover {
    background: rgba(200,121,65,0.15);
  }
`;

/* â”€â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Main = styled.main`
  flex: 1;
  min-width: 0;
`;

/* â”€â”€â”€ Breadcrumbs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const BreadcrumbsNav = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 24px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const BreadcrumbLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const BreadcrumbBtn = styled.button`
  color: ${({ theme }) => theme.colors.text.muted};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const BreadcrumbSep = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
  opacity: 0.4;
  font-size: 0.7rem;
  user-select: none;
`;

const BreadcrumbCurrent = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/* â”€â”€â”€ Section card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Card = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  padding: 32px;
  animation: ${fadeIn} 0.2s ease;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 20px 16px;
  }
`;

const SectionTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 6px;
`;

const SectionSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 32px;
`;

/* â”€â”€â”€ Category grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  cursor: pointer;
  text-align: left;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.accent};
    background: ${({ theme }) => theme.colors.accent.violetAlpha};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(200, 121, 65, 0.15);
  }
`;

const CategoryIcon = styled.div`
  font-size: 1.75rem;
`;

const CategoryLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CategoryDesc = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.5;
`;

/* â”€â”€â”€ Ticket form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const TicketFormWrap = styled.div`
  animation: ${fadeIn} 0.2s ease;
`;

const TicketTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 6px;
`;

const TicketDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 24px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 160px;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  resize: vertical;
  transition: border-color ${({ theme }) => theme.transitions.fast};
  outline: none;
  box-sizing: border-box;

  &::placeholder { color: ${({ theme }) => theme.colors.text.muted}; }
  &:focus { border-color: ${({ theme }) => theme.colors.border.accent}; }
`;

const CharCount = styled.div`
  text-align: right;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 6px;
`;

const SubmitBtn = styled.button`
  margin-top: 20px;
  padding: 12px 32px;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: #fff;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent.violet}, ${({ theme }) => theme.colors.accent.violetDark});
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  box-shadow: 0 4px 14px rgba(200, 121, 65, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(200, 121, 65, 0.45);
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SuccessBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.accent.emeraldAlpha};
  border: 1px solid rgba(52, 211, 153, 0.25);
  color: ${({ theme }) => theme.colors.accent.emerald};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin-top: 16px;
  animation: ${fadeIn} 0.25s ease;
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: rgba(251, 113, 133, 0.1);
  border: 1px solid rgba(251, 113, 133, 0.25);
  color: ${({ theme }) => theme.colors.accent.rose};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin-top: 16px;
  animation: ${fadeIn} 0.25s ease;
`;

/* â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CATEGORIES = [
  { key: 'account',   icon: 'ðŸ‘¤', label: 'My Account',       desc: 'Username, password, profile settings, and account access.' },
  { key: 'bug',       icon: 'ðŸ›', label: 'Bug Reports',      desc: 'Report a bug or unexpected behaviour in the game.' },
  { key: 'technical', icon: 'âš™ï¸', label: 'Technical Issues', desc: 'Connectivity problems, crashes, or performance issues.' },
  { key: 'payment',   icon: 'ðŸ’³', label: 'Payment Issues',   desc: 'Billing, refunds, missing currency, or purchase problems.' },
];

const MAX_LENGTH = 2000;

/* â”€â”€â”€ Ticket form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function TicketForm({ category, onBack }) {
  const [message, setMessage]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitTicket({ category: category.key, message: message.trim() });
      setSubmitted(true);
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TicketFormWrap>
      <TicketTitle>{category.icon} {category.label}</TicketTitle>
      <TicketDesc>{category.desc}</TicketDesc>

      <form onSubmit={handleSubmit}>
        <TextArea
          placeholder={`Describe your ${category.label.toLowerCase()} issue in as much detail as possibleâ€¦`}
          value={message}
          onChange={e => setMessage(e.target.value.slice(0, MAX_LENGTH))}
          disabled={submitting || submitted}
        />
        <CharCount>{message.length} / {MAX_LENGTH}</CharCount>

        {submitted && (
          <SuccessBanner>
            âœ… Your ticket has been submitted. Our support team will get back to you soon.
          </SuccessBanner>
        )}
        {error && <ErrorBanner>âš ï¸ {error}</ErrorBanner>}

        {!submitted && (
          <SubmitBtn type="submit" disabled={!message.trim() || submitting}>
            {submitting ? 'Sendingâ€¦' : 'Submit Ticket'}
          </SubmitBtn>
        )}
      </form>
    </TicketFormWrap>
  );
}

/* â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function SupportPage() {
  const [activeCategory, setActiveCategory] = useState(null);

  /* â”€â”€ breadcrumbs â”€â”€ */
  const crumbs = activeCategory
    ? [
        { label: 'Home',    href: '/' },
        { label: 'Support', href: '/support' },
        { label: 'Help',    onClick: () => setActiveCategory(null) },
        { label: activeCategory.label },
      ]
    : [
        { label: 'Home',    href: '/' },
        { label: 'Support', href: '/support' },
        { label: 'Help' },
      ];

  return (
    <PageWrap>
      <Header />
      <Body>
        {/* Left sidebar */}
        <Sidebar>
          <SidebarTitle>Support</SidebarTitle>
          <SidebarItem $active onClick={() => setActiveCategory(null)}>
            Help
          </SidebarItem>
          {activeCategory && (
            <SidebarSubItem onClick={() => setActiveCategory(null)}>
              {activeCategory.icon} {activeCategory.label}
            </SidebarSubItem>
          )}
        </Sidebar>

        {/* Main content */}
        <Main>
          {/* Breadcrumbs */}
          <BreadcrumbsNav aria-label="breadcrumb">
            {crumbs.map((crumb, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {i > 0 && <BreadcrumbSep>â€º</BreadcrumbSep>}
                {crumb.href ? (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                ) : crumb.onClick ? (
                  <BreadcrumbBtn onClick={crumb.onClick}>{crumb.label}</BreadcrumbBtn>
                ) : (
                  <BreadcrumbCurrent>{crumb.label}</BreadcrumbCurrent>
                )}
              </span>
            ))}
          </BreadcrumbsNav>

          <Card>
            {activeCategory ? (
              <TicketForm
                category={activeCategory}
                onBack={() => setActiveCategory(null)}
              />
            ) : (
              <>
                <SectionTitle>Help Center</SectionTitle>
                <SectionSubtitle>Select a topic below to get in touch with our support team.</SectionSubtitle>
                <CategoryGrid>
                  {CATEGORIES.map(cat => (
                    <CategoryCard key={cat.key} onClick={() => setActiveCategory(cat)}>
                      <CategoryIcon>{cat.icon}</CategoryIcon>
                      <CategoryLabel>{cat.label}</CategoryLabel>
                      <CategoryDesc>{cat.desc}</CategoryDesc>
                    </CategoryCard>
                  ))}
                </CategoryGrid>
              </>
            )}
          </Card>
        </Main>
      </Body>
      <Footer />
    </PageWrap>
  );
}
