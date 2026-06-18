'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { useCarousel } from '@/hooks/useCarousel';
import { fetchNews } from '@/lib/newsApi';

const shimmer = keyframes`
  0%   { background-position: -800px 0; }
  100% { background-position: 800px 0; }
`;

/* ─── Wrapper ─────────────────────────────────────────────────── */
const CarouselWrapper = styled.section`
  position: relative;
  width: 100%;
  height: 460px;
  border-radius: ${({ theme }) => theme.radii['2xl']};
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing['12']};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.bg.elevated};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 340px;
    border-radius: ${({ theme }) => theme.radii.xl};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    height: 240px;
  }
`;

/* ─── Slides ──────────────────────────────────────────────────── */
const SlideTrack = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Slide = styled.div`
  position: absolute;
  inset: 0;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 0.65s ease;
  pointer-events: ${({ $active }) => ($active ? 'auto' : 'none')};
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

/* Full-cover clickable link — sits above image, below arrows */
const SlideLink = styled(Link)`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  cursor: pointer;
`;

/* ─── Navigation arrows ───────────────────────────────────────── */
const ArrowBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  z-index: 2;
  backdrop-filter: blur(8px);

  ${({ $side }) => ($side === 'left' ? 'left: 16px;' : 'right: 16px;')}

  &:hover {
    background: rgba(200, 121, 65, 0.65);
    border-color: rgba(200, 121, 65, 0.52);
    transform: translateY(-50%) scale(1.08);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
    ${({ $side }) => ($side === 'left' ? 'left: 8px;' : 'right: 8px;')}
  }
`;

/* ─── Dot indicators ──────────────────────────────────────────── */
const DotsRow = styled.div`
  position: absolute;
  bottom: 20px;
  right: 24px;
  display: flex;
  gap: 6px;
  z-index: 2;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    bottom: 12px;
    right: 12px;
  }
`;

const Dot = styled.button`
  height: 6px;
  border-radius: 3px;
  background: ${({ $active }) =>
    $active ? '#c87941' : 'rgba(255, 255, 255, 0.3)'};
  width: ${({ $active }) => ($active ? '22px' : '6px')};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  border: none;
  padding: 0;
  z-index: 2;

  &:hover {
    background: rgba(255, 255, 255, 0.65);
    width: 14px;
  }
`;

/* ─── Progress bar ────────────────────────────────────────────── */
const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  background: #c87941;
  animation: progress 5s linear;
  z-index: 3;

  @keyframes progress {
    from { width: 0%; }
    to   { width: 100%; }
  }
`;

/* ─── Skeleton ────────────────────────────────────────────────── */
const SkeletonWrap = styled.div`
  width: 100%;
  height: 460px;
  border-radius: ${({ theme }) => theme.radii['2xl']};
  margin-top: ${({ theme }) => theme.spacing['12']};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.bg.elevated} 25%,
    ${({ theme }) => theme.colors.bg.glass} 50%,
    ${({ theme }) => theme.colors.bg.elevated} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.6s infinite linear;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 340px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    height: 240px;
  }
`;

/* ─── Inner component that uses the hook (needs count > 0) ───── */
function Slides({ items }) {
  const { current, next, prev, go } = useCarousel(items.length, 5000);

  return (
    <CarouselWrapper>
      <ProgressBar key={current} />

      <SlideTrack>
        {items.map((item, i) => (
          <Slide key={item.id} $active={i === current}>
            <SlideImage src={item.image_url} alt={item.title} />
            <SlideLink href={`/news/${item.id}`} />
          </Slide>
        ))}
      </SlideTrack>

      {items.length > 1 && (
        <>
          <ArrowBtn $side="left" onClick={prev} aria-label="Previous">‹</ArrowBtn>
          <ArrowBtn $side="right" onClick={next} aria-label="Next">›</ArrowBtn>

          <DotsRow>
            {items.map((item, i) => (
              <Dot
                key={item.id}
                $active={i === current}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </DotsRow>
        </>
      )}
    </CarouselWrapper>
  );
}

/* ─── Exported component ──────────────────────────────────────── */
export default function NewsCarousel() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews(5)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonWrap />;
  if (items.length === 0) return null;

  return <Slides items={items} />;
}
