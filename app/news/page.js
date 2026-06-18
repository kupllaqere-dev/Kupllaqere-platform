'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchNews } from '@/lib/newsApi';
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

/* ─── Article list ─────────────────────────────────────────────── */
const ArticleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ArticleCard = styled(Link)`
  display: flex;
  border-radius: ${({ theme }) => theme.radii['2xl']};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  overflow: hidden;
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.normal};
  animation: ${fadeUp} 0.35s ease both;
  animation-delay: ${({ $index }) => $index * 60}ms;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.accent};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const ArticleImage = styled.div`
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

  ${ArticleCard}:hover & img {
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

const ArticleBody = styled.div`
  flex: 1;
  min-width: 0;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 18px 20px;
  }
`;

const ArticleTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 10px;
  line-height: ${({ theme }) => theme.typography.lineHeights.snug};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArticleExcerpt = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const ArticleAuthor = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ArticleDate = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: right;
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

/* ─── Helpers ──────────────────────────────────────────────────── */
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    fetchNews()
      .then(setArticles)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrap>
      <Header />
      <Body>
        <Panel>
        <PageHeader>
          <PageTitle>News</PageTitle>
          <PageSubtitle>Latest updates from the FashionVerse team</PageSubtitle>
        </PageHeader>

        <ArticleList>
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
              <EmptyText>Failed to load news. Please try again later.</EmptyText>
            </EmptyState>
          )}

          {!loading && !error && articles.length === 0 && (
            <EmptyState>
              <EmptyIcon>📰</EmptyIcon>
              <EmptyText>No news articles yet. Check back soon!</EmptyText>
            </EmptyState>
          )}

          {!loading && !error && articles.map((article, i) => (
            <ArticleCard key={article.id} href={`/news/${article.id}`} $index={i}>
              <ArticleImage>
                <img src={article.image_url} alt={article.title} />
              </ArticleImage>
              <ArticleBody>
                <ArticleTitle>{article.title}</ArticleTitle>
                <ArticleExcerpt>{article.content}</ArticleExcerpt>
                <ArticleMeta>
                  <ArticleAuthor>By {article.author_name}</ArticleAuthor>
                  <ArticleDate>{formatDate(article.created_at)}</ArticleDate>
                </ArticleMeta>
              </ArticleBody>
            </ArticleCard>
          ))}
        </ArticleList>
        </Panel>
      </Body>
      <Footer />
    </PageWrap>
  );
}
