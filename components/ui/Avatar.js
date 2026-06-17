'use client';
import styled from 'styled-components';

const AvatarWrapper = styled.div`
  width: ${({ $size }) => $size || '36px'};
  height: ${({ $size }) => $size || '36px'};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $color }) => $color || 'linear-gradient(135deg, #8b5cf6, #22d3ee)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ $fontSize }) => $fontSize || '0.875rem'};
  color: #fff;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.12);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
    pointer-events: none;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export default function Avatar({ username = '', color, size, fontSize, src }) {
  const fallback = username ? username.charAt(0) : '?';
  return (
    <AvatarWrapper $color={color} $size={size} $fontSize={fontSize}>
      {src ? <AvatarImg src={src} alt={username || 'avatar'} /> : fallback}
    </AvatarWrapper>
  );
}
