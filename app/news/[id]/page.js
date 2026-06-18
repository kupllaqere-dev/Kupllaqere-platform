'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchArticle } from '@/lib/newsApi';
import { LETTERBOX_WIDTH } from '@/components/Layout';

/* ─── Animations ───────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -800px 0; }
  100% { background-position: 800px 0; }
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
  padding: 40px 24px 80px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 24px 16px 60px;
  }
`;

/* ─── Back link ────────────────────────────────────────────────── */
const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration: none;
  margin-bottom: 28px;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.accent};
  }
`;

/* ─── Unified article card ─────────────────────────────────────── */
const ArticleCard = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  overflow: hidden;
  animation: ${fadeUp} 0.3s ease;
`;

const ArticleBanner = styled.div`
  width: 100%;
  aspect-ratio: 16 / 7;
  background: ${({ theme }) => theme.colors.bg.elevated};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const ArticleBody = styled.div`
  padding: 32px 36px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 20px;
  }
`;

const ArticleTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['4xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeights.tight};
  margin-bottom: 14px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  }
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const ArticleContent = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  white-space: pre-wrap;
  word-break: break-word;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

/* ─── Skeleton card ────────────────────────────────────────────── */
const SkeletonCard = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  overflow: hidden;
`;

const BannerSkeleton = styled.div`
  width: 100%;
  aspect-ratio: 16 / 7;
  background: linear-gradient(90deg,
    ${({ theme }) => theme.colors.bg.elevated} 25%,
    ${({ theme }) => theme.colors.bg.glass} 50%,
    ${({ theme }) => theme.colors.bg.elevated} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.6s infinite linear;
`;

/* ─── Skeleton content ─────────────────────────────────────────── */
const SkeletonLine = styled.div`
  height: ${({ $h }) => $h || '16px'};
  width: ${({ $w }) => $w || '100%'};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: linear-gradient(90deg,
    ${({ theme }) => theme.colors.bg.elevated} 25%,
    ${({ theme }) => theme.colors.bg.glass} 50%,
    ${({ theme }) => theme.colors.bg.elevated} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.6s infinite linear;
  margin-bottom: 12px;
`;

/* ─── Error state ──────────────────────────────────────────────── */
const ErrorState = styled.div`
  text-align: center;
  padding: 80px 24px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.4;
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  margin-bottom: 20px;
`;

/* ─── Helper ───────────────────────────────────────────────────── */
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }) + ' at ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchArticle(id)
      .then(setArticle)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <PageWrap>
      <Header />
      <Body>
        <BackLink href="/news">← Back to News</BackLink>

        {loading && (
          <SkeletonCard>
            <BannerSkeleton />
            <div style={{ padding: '32px 36px' }}>
              <SkeletonLine $h="40px" $w="80%" />
              <SkeletonLine $h="14px" $w="40%" />
              <div style={{ marginTop: 28 }}>
                {[100, 95, 88, 100, 72, 90, 65].map((w, i) => (
                  <SkeletonLine key={i} $w={`${w}%`} />
                ))}
              </div>
            </div>
          </SkeletonCard>
        )}

        {!loading && error && (
          <ErrorState>
            <ErrorIcon>📰</ErrorIcon>
            <ErrorText>This article could not be found.</ErrorText>
            <BackLink href="/news">← Back to News</BackLink>
          </ErrorState>
        )}

        {!loading && !error && article && (
          <ArticleCard>
            <ArticleBanner>
              <img src={article.image_url} alt={article.title} />
            </ArticleBanner>
            <ArticleBody>
              <ArticleTitle>{article.title}</ArticleTitle>
              <ArticleMeta>
                <span>{formatDate(article.created_at)}</span>
              </ArticleMeta>
              <ArticleContent>{article.content}</ArticleContent>
            </ArticleBody>
          </ArticleCard>
        )}
      </Body>
      <Footer />
    </PageWrap>
  );
}
