'use client';
import styled from 'styled-components';

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: ${({ $color }) => $color ? `${$color}22` : 'rgba(200,121,65,0.15)'};
  color: ${({ $color }) => $color || '#e09a58'};
  border: 1px solid ${({ $color }) => $color ? `${$color}44` : 'rgba(200,121,65,0.3)'};
  white-space: nowrap;
`;

export default Badge;
