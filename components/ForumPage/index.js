'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageContainer } from '@/components/Layout';
import GlassCard from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { fetchPosts } from '@/lib/forumApi';

const CATEGORIES = [
  { label: 'All',           color: null },
  { label: 'General',       color: '#c87941' },
  { label: 'Tips & Guides', color: '#2aac8e' },
  { label: 'Events',        color: '#c44040' },
  { label: 'Trading',       color: '#e8b84a' },
  { label: 'Clans',         color: '#4aad6a' },
  { label: 'Help & Support',color: '#4aad6a' },
];

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

const Wrapper = styled.div`
  min-height: 100vh;
`;

const Inner = styled.div`
  padding-top: ${({ theme }) => theme.spacing['8']};
  padding-bottom: ${({ theme }) => theme.spacing['16']};
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  padding: 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 20px 16px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing['6']};
  gap: ${({ theme }) => theme.spacing['4']};
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['3xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.02em;

  span { color: ${({ theme }) => theme.colors.accent.violetLight}; }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['2']};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing['5']};
`;

const CategoryTab = styled.button`
  padding: 0.35rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px solid ${({ $active, theme, $color }) =>
    $active ? ($color || theme.colors.accent.violet) : theme.colors.border.default};
  background: ${({ $active, $color }) =>
    $active ? ($color ? `${$color}22` : 'rgba(200,121,65,0.15)') : 'transparent'};
  color: ${({ $active, $color, theme }) =>
    $active ? ($color || theme.colors.accent.violetLight) : theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  letter-spacing: 0.02em;

  &:hover {
    border-color: ${({ $color, theme }) => $color || theme.colors.border.accent};
    color: ${({ $color, theme }) => $color || theme.colors.accent.violetLight};
  }
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
    background: ${({ $color }) => $color || '#c87941'};
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

const AvatarWrap = styled.div`
  flex-shrink: 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { display: none; }
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  flex-wrap: wrap;
  margin-bottom: 4px;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-top: 4px;
  transition: color ${({ theme }) => theme.transitions.fast};

  ${ThreadCard}:hover & { color: ${({ theme }) => theme.colors.accent.violetLight}; }
`;

const Meta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['3']};
  flex-wrap: wrap;
  margin-top: 5px;
`;

const MetaItem = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const AuthorName = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const Stats = styled.div`
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

const PinnedIcon = styled.span` font-size: 0.7rem; opacity: 0.7; `;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['16']} 0;
  color: ${({ theme }) => theme.colors.text.muted};

  h3 {
    font-size: ${({ theme }) => theme.typography.sizes.xl};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing['2']};
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['3']};
`;

const SkeletonCard = styled.div`
  height: 80px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1.5px solid ${({ theme }) => theme.colors.border.default};
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
`;

/* ─── Component ───────────────────────────────────────────────── */

export default function ForumPage() {
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const visible = activeCategory === 'All'
    ? posts
    : posts.filter(p => p.category === activeCategory);

  return (
    <Wrapper>
      <Header />
      <PageContainer>
        <Inner>
          <Panel>
          <PageHeader>
            <PageTitle>Community <span>Forums</span></PageTitle>
            <PrimaryButton as={Link} href="/forums/new" size="md">+ New Thread</PrimaryButton>
          </PageHeader>

          <CategoryTabs>
            {CATEGORIES.map(cat => (
              <CategoryTab
                key={cat.label}
                $active={activeCategory === cat.label}
                $color={cat.color}
                onClick={() => setActiveCategory(cat.label)}
              >
                {cat.label}
              </CategoryTab>
            ))}
          </CategoryTabs>

          {loading ? (
            <LoadingState>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </LoadingState>
          ) : visible.length === 0 ? (
            <EmptyState>
              <h3>No threads yet</h3>
              <p>Be the first to start a conversation.</p>
            </EmptyState>
          ) : (
            <ThreadList>
              {visible.map(thread => (
                <ThreadCard
                  key={thread.id}
                  as={Link}
                  href={`/forums/${thread.id}`}
                  $interactive
                  $color={thread.category_color}
                >
                  <AvatarWrap>
                    <Avatar
                      username={thread.author_name}
                      color={avatarColor(thread.author_name)}
                      size="42px"
                      fontSize="1rem"
                    />
                  </AvatarWrap>

                  <Body>
                    <TopRow>
                      <Badge $color={thread.category_color}>{thread.category}</Badge>
                      {thread.is_pinned && <PinnedIcon title="Pinned">📌</PinnedIcon>}
                    </TopRow>
                    <Title>{thread.title}</Title>
                    <Meta>
                      <MetaItem>by <AuthorName>{thread.author_name}</AuthorName></MetaItem>
                      <MetaItem>· {timeAgo(thread.updated_at)}</MetaItem>
                    </Meta>
                  </Body>

                  <Stats>
                    <StatPill>
                      <span>💬</span>
                      <strong>{thread.reply_count}</strong>
                      <span>replies</span>
                    </StatPill>
                  </Stats>
                </ThreadCard>
              ))}
            </ThreadList>
          )}
          </Panel>
        </Inner>
      </PageContainer>
      <Footer />
    </Wrapper>
  );
}
