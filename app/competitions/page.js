'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styled, { keyframes, css } from 'styled-components';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchCompetitions } from '@/lib/competitionsApi';
import { LETTERBOX_WIDTH } from '@/components/Layout';

/* ─── Animations ───────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`;

/* ─── Layout ───────────────────────────────────────────────────── */
const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  flex: 1;
  max-width: ${LETTERBOX_WIDTH};
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px 64px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 24px 16px 48px;
  }
`;

/* ─── Page header ──────────────────────────────────────────────── */
const PageHeader = styled.div`
  margin-bottom: 36px;
  animation: ${fadeUp} 0.3s ease;
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['4xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 6px;
`;

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

/* ─── Panel ─────────────────────────────────────────────────────── */
const Panel = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  padding: 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 20px 16px;
  }
`;

/* ─── Competition list ─────────────────────────────────────────── */
const CompList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CompCard = styled(Link)`
  text-decoration: none;
  display: flex;
  border-radius: ${({ theme }) => theme.radii['2xl']};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.normal};
  animation: ${fadeUp} 0.35s ease both;
  animation-delay: ${({ $index }) => $index * 60}ms;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.accent};
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const CompImage = styled.div`
  width: 280px;
  flex-shrink: 0;
  position: relative;
  background: ${({ theme }) => theme.colors.bg.elevated};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform ${({ theme }) => theme.transitions.slow};
  }

  ${CompCard}:hover & img {
    transform: scale(1.04);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 220px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
    height: 200px;
  }
`;

const CompBody = styled.div`
  flex: 1;
  min-width: 0;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 18px 20px;
  }
`;

const CompHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`;

const CompTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeights?.snug ?? 1.3};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const statusVariants = {
  upcoming:     css`background: ${({ theme }) => theme.colors.accent.violetAlpha}; color: ${({ theme }) => theme.colors.accent.violet}; border-color: rgba(200,121,65,0.3);`,
  registration: css`background: rgba(42,172,142,0.1); color: ${({ theme }) => theme.colors.accent.cyan}; border-color: rgba(42,172,142,0.3);`,
  voting:       css`background: rgba(232,184,74,0.1); color: ${({ theme }) => theme.colors.accent.gold}; border-color: rgba(232,184,74,0.3);`,
  closed:       css`background: transparent; color: ${({ theme }) => theme.colors.text.muted}; border-color: ${({ theme }) => theme.colors.border.subtle};`,
};

const StatusBadge = styled.span`
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  border: 1px solid;
  white-space: nowrap;
  ${({ $variant }) => statusVariants[$variant] ?? statusVariants.closed}
`;

const CompDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.65;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CompMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

/* ─── Skeleton loading ─────────────────────────────────────────── */
const SkeletonCard = styled.div`
  display: flex;
  border-radius: ${({ theme }) => theme.radii['2xl']};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  overflow: hidden;
  height: 180px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    height: auto;
  }
`;

const SkeletonImage = styled.div`
  width: 280px;
  flex-shrink: 0;
  background: linear-gradient(90deg,
    rgba(255,255,255,0.05) 25%,
    rgba(255,255,255,0.11) 50%,
    rgba(255,255,255,0.05) 75%
  );
  background-size: 600px 100%;
  animation: ${shimmer} 1.6s infinite linear;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
    height: 160px;
  }
`;

const SkeletonBody = styled.div`
  flex: 1;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SkeletonLine = styled.div`
  height: ${({ $h }) => $h || '14px'};
  width: ${({ $w }) => $w || '100%'};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: linear-gradient(90deg,
    rgba(255,255,255,0.05) 25%,
    rgba(255,255,255,0.11) 50%,
    rgba(255,255,255,0.05) 75%
  );
  background-size: 600px 100%;
  animation: ${shimmer} 1.6s infinite linear;
`;

/* ─── Empty / error states ─────────────────────────────────────── */
const EmptyState = styled.div`
  text-align: center;
  padding: 80px 24px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.4;
`;

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.base};
`;

/* ─── Status helper ────────────────────────────────────────────── */
function getStatus(comp) {
  const now      = Date.now();
  const regStart = new Date(comp.reg_start).getTime();
  const regEnd   = new Date(comp.reg_end).getTime();
  const voteEnd  = new Date(comp.voting_end).getTime();

  if (now < regStart) {
    const ms   = regStart - now;
    const days  = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    if (days >= 1) return { label: `Registrations in ${days}d`, variant: 'upcoming' };
    if (hours >= 1) return { label: `Registrations in ${hours}h`, variant: 'upcoming' };
    return { label: 'Starting soon', variant: 'upcoming' };
  }
  if (now < regEnd)  return { label: 'Registrations open', variant: 'registration' };
  if (now < voteEnd) return { label: 'Voting open',        variant: 'voting' };
  return { label: 'Closed', variant: 'closed' };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    fetchCompetitions()
      .then(setCompetitions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrap>
      <Header />
      <Body>
        <Panel>
        <PageHeader>
          <PageTitle>Competitions</PageTitle>
          <PageSubtitle>Fashion competitions hosted by the FashionVerse team</PageSubtitle>
        </PageHeader>

        <CompList>
          {loading && [0, 1, 2].map(i => (
            <SkeletonCard key={i}>
              <SkeletonImage />
              <SkeletonBody>
                <SkeletonLine $h="22px" $w="70%" />
                <SkeletonLine $w="100%" />
                <SkeletonLine $w="90%" />
                <SkeletonLine $w="60%" />
              </SkeletonBody>
            </SkeletonCard>
          ))}

          {!loading && error && (
            <EmptyState>
              <EmptyIcon>⚠️</EmptyIcon>
              <EmptyText>Failed to load competitions. Please try again later.</EmptyText>
            </EmptyState>
          )}

          {!loading && !error && competitions.length === 0 && (
            <EmptyState>
              <EmptyIcon>🏆</EmptyIcon>
              <EmptyText>No competitions yet. Check back soon!</EmptyText>
            </EmptyState>
          )}

          {!loading && !error && competitions.map((comp, i) => {
            const status = getStatus(comp);
            return (
              <CompCard key={comp.id} href={`/competitions/${comp.id}`} $index={i}>
                <CompImage>
                  <img src={comp.image_url} alt={comp.title} />
                </CompImage>
                <CompBody>
                  <CompHeader>
                    <CompTitle>{comp.title}</CompTitle>
                    <StatusBadge $variant={status.variant}>{status.label}</StatusBadge>
                  </CompHeader>
                  <CompDesc>{comp.description}</CompDesc>
                  <CompMeta>
                    <MetaItem>Registrations: {formatDate(comp.reg_start)} – {formatDate(comp.reg_end)}</MetaItem>
                    <MetaItem>Voting ends: {formatDate(comp.voting_end)}</MetaItem>
                  </CompMeta>
                </CompBody>
              </CompCard>
            );
          })}
        </CompList>
        </Panel>
      </Body>
      <Footer />
    </PageWrap>
  );
}
