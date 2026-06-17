'use client';
import styled, { css } from 'styled-components';

const baseStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['2']};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  letter-spacing: 0.02em;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  white-space: nowrap;
  border: 1.5px solid transparent;
  text-decoration: none;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const sizeStyles = {
  sm: css`
    padding: 0.375rem 0.875rem;
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    border-radius: ${({ theme }) => theme.radii.sm};
  `,
  md: css`
    padding: 0.5625rem 1.25rem;
  `,
  lg: css`
    padding: 0.75rem 1.75rem;
    font-size: ${({ theme }) => theme.typography.sizes.base};
  `,
};

export const PrimaryButton = styled.button`
  ${baseStyles}
  ${({ size = 'md' }) => sizeStyles[size]}
  background: ${({ theme }) => theme.colors.gradient.brand};
  color: #fff;
  border-color: transparent;
  box-shadow: ${({ theme }) => theme.shadows.button};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.buttonHover};
    transform: translateY(-1px);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(0);
    filter: brightness(0.95);
  }
`;

export const SecondaryButton = styled.button`
  ${baseStyles}
  ${({ size = 'md' }) => sizeStyles[size]}
  background: ${({ theme }) => theme.colors.bg.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  border-color: ${({ theme }) => theme.colors.border.medium};

  &:hover {
    background: #1e1e38;
    border-color: ${({ theme }) => theme.colors.border.accent};
    color: ${({ theme }) => theme.colors.accent.violetLight};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const GhostButton = styled.button`
  ${baseStyles}
  ${({ size = 'md' }) => sizeStyles[size]}
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-color: transparent;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.elevated};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const OutlineButton = styled.button`
  ${baseStyles}
  ${({ size = 'md' }) => sizeStyles[size]}
  background: transparent;
  color: ${({ theme }) => theme.colors.accent.violet};
  border-color: ${({ theme }) => theme.colors.border.accent};

  &:hover {
    background: ${({ theme }) => theme.colors.accent.violetAlpha};
    border-color: ${({ theme }) => theme.colors.accent.violet};
    box-shadow: ${({ theme }) => theme.shadows.glow};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const GoldButton = styled.button`
  ${baseStyles}
  ${({ size = 'md' }) => sizeStyles[size]}
  background: ${({ theme }) => theme.colors.gradient.gold};
  color: #1a1005;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  border-color: transparent;
  box-shadow: ${({ theme }) => theme.shadows.glowGold};

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
    box-shadow: 0 6px 28px rgba(251, 191, 36, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;
