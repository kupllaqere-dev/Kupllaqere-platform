'use client';
import styled from 'styled-components';

export const LETTERBOX_WIDTH = '1260px';

export const PageContainer = styled.div`
  max-width: ${LETTERBOX_WIDTH};
  width: 100%;
  margin: 0 auto;
  padding: 0 28px 40px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 16px 28px;
  }
`;

export const ContentGrid = styled.section`
  display: grid;
  grid-template-columns: 1fr 310px;
  gap: ${({ theme }) => theme.spacing['5']};
  padding: ${({ theme }) => theme.spacing['6']} 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.xl}) {
    grid-template-columns: 1fr 285px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing['4']};
  }
`;
