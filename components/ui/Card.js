'use client';
import styled, { css } from 'styled-components';

const GlassCard = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme, $radius }) => theme.radii[$radius || 'xl']};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: all ${({ theme }) => theme.transitions.normal};

  ${({ $interactive, theme }) => $interactive && css`
    cursor: pointer;

    &:hover {
      background: ${theme.colors.bg.elevated};
      border-color: ${theme.colors.border.accent};
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg}, 0 0 0 1px rgba(139, 92, 246, 0.1);
    }

    &:active {
      transform: translateY(0);
    }
  `}

  ${({ $gradient, theme }) => $gradient && css`
    background: ${theme.colors.gradient.cardSubtle};
  `}

  ${({ $glow }) => $glow && css`
    &:hover {
      box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(139,92,246,0.2);
    }
  `}
`;

export default GlassCard;
