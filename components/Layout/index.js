'use client';
import styled from 'styled-components';

export const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 16px 24px;
  }
`;

export const ContentGrid = styled.section`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: ${({ theme }) => theme.spacing['5']};
  padding: ${({ theme }) => theme.spacing['6']} 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.xl}) {
    grid-template-columns: 1fr 290px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing['4']};
  }
`;
