'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import GlassCard from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { SecondaryButton } from '@/components/ui/Button';
import { fetchPosts } from '@/lib/forumApi';

const AVATAR_COLORS = ['#c87941','#2aac8e','#c44040','#e8b84a','#4aad6a','#4aad6a','#e09a58','#4ec9a8'];

function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Styled ──────────────────────────────────────────────────── */

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  padding: ${({ theme }) => theme.spacing['6']};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing['4']};
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.02em;

  span { color: ${({ theme }) => theme.colors.accent.violetLight}; }
`;

const ThreadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['3']};
`;

const ThreadCard = styled(GlassCard)`
  background: ${({ theme }) => theme.colors.bg.elevated};
  padding: ${({ theme }) => theme.spacing['4']} ${({ theme }) => theme.spacing['5']};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['4']};
  position: relative;
  overflow: hidden;
  text-decoration: none;

  &:hover { background: ${({ theme }) => theme.colors.bg.elevated}; }

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: ${({ $accentColor }) => $accentColor || '#c87941'};
    border-radius: 3px 0 0 3px;
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }

  &:hover::before { opacity: 1; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
    gap: ${({ theme }) => theme.spacing['3']};
  }
`;

const ThreadAvatar = styled.div`
  flex-shrink: 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { display: none; }
`;

const ThreadBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const ThreadTop = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  flex-wrap: wrap;
  margin-bottom: 4px;
`;

const PinnedIcon = styled.span`
  font-size: 0.7rem;
  opacity: 0.7;
`;

const ThreadTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing['1']};
  transition: color ${({ theme }) => theme.transitions.fast};

  ${ThreadCard}:hover & { color: ${({ theme }) => theme.colors.accent.violetLight}; }
`;

const ThreadMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  flex-wrap: wrap;
  margin-top: 5px;
`;

const MetaItem = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AuthorName = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const ThreadStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { display: none; }
`;

const StatPill = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  background: ${({ theme }) => theme.colors.bg.elevated};
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};

  strong {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
  }
`;

const ViewAllLink = styled.div`
  margin-top: ${({ theme }) => theme.spacing['2']};
`;

const SkeletonCard = styled.div`
  height: 78px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1.5px solid ${({ theme }) => theme.colors.border.default};
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
`;

const EmptyNote = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: center;
  padding: ${({ theme }) => theme.spacing['8']} 0;
`;

/* ─── Component ───────────────────────────────────────────────── */

export default function ForumPreview() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts(5)
      .then(setThreads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Latest <span>Forum</span> Threads</SectionTitle>
        <SecondaryButton as={Link} href="/forums" size="sm">+ Create Thread</SecondaryButton>
      </SectionHeader>

      <ThreadList>
        {loading ? (
          [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
        ) : threads.length === 0 ? (
          <EmptyNote>No threads yet — be the first to post!</EmptyNote>
        ) : (
          threads.map(thread => (
            <ThreadCard
              key={thread.id}
              as={Link}
              href={`/forums/${thread.id}`}
              $interactive
              $accentColor={thread.category_color}
            >
              <ThreadAvatar>
                <Avatar
                  username={thread.author_name}
                  color={avatarColor(thread.author_name)}
                  size="42px"
                  fontSize="1rem"
                />
              </ThreadAvatar>

              <ThreadBody>
                <ThreadTop>
                  <Badge $color={thread.category_color}>{thread.category}</Badge>
                  {thread.is_pinned && <PinnedIcon title="Pinned">📌</PinnedIcon>}
                </ThreadTop>
                <ThreadTitle>{thread.title}</ThreadTitle>
                <ThreadMeta>
                  <MetaItem>by <AuthorName>{thread.author_name}</AuthorName></MetaItem>
                  <MetaItem>· {timeAgo(thread.updated_at)}</MetaItem>
                </ThreadMeta>
              </ThreadBody>

              <ThreadStats>
                <StatPill>
                  <span>💬</span>
                  <strong>{thread.reply_count}</strong>
                  <span>replies</span>
                </StatPill>
              </ThreadStats>
            </ThreadCard>
          ))
        )}
      </ThreadList>

      <ViewAllLink>
        <SecondaryButton as={Link} href="/forums" style={{ width: '100%' }}>
          View All Threads →
        </SecondaryButton>
      </ViewAllLink>
    </Section>
  );
}
