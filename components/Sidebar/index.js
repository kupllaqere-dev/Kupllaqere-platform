'use client';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import GlassCard from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { topCreators } from '@/lib/mockData';

const SidebarWrapper = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`;

/* Widget shared styles */
const Widget = styled(GlassCard)`
  padding: ${({ theme }) => theme.spacing['5']};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WidgetTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
`;

const WidgetIcon = styled.span`
  font-size: 1rem;
`;

const ViewAll = styled.a`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.accent.violetLight};
  cursor: pointer;
  transition: color ${({ theme }) => theme.transitions.fast};
  font-weight: ${({ theme }) => theme.typography.weights.medium};

  &:hover {
    color: ${({ theme }) => theme.colors.accent.cyan};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.subtle};
  margin: -${({ theme }) => theme.spacing['1']} 0;
`;

/* Ranking rows */
const RankList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['3']};
`;

const RankRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['3']};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: background ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.elevated};
  }
`;

const RankNumber = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  flex-shrink: 0;
  width: 22px;
`;

const RankInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RankName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RankScore = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 2px;
`;

const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $online, theme }) => $online ? theme.colors.accent.emerald : theme.colors.text.muted};
  flex-shrink: 0;
  box-shadow: ${({ $online }) => $online ? '0 0 6px rgba(74,173,106,0.6)' : 'none'};
`;

const RatingBadge = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.accent.violetLight};
  flex-shrink: 0;
  letter-spacing: 0.02em;
`;

const API = process.env.NEXT_PUBLIC_API_URL;

function useFetchPlayers(path) {
  const [players, setPlayers] = useState([]);
  useEffect(() => {
    fetch(`${API}${path}`)
      .then(r => r.json())
      .then(data => setPlayers(
        data.slice(0, 3).map((p, i) => ({ ...p, rank: i + 1, username: p.platform_username || p.name }))
      ))
      .catch(() => {});
  }, [path]);
  return players;
}

export default function Sidebar() {
  const chessMasters    = useFetchPlayers('/api/platform/players/chess-leaderboard');
  const popularPlayers  = useFetchPlayers('/api/platform/players/popular');

  return (
    <SidebarWrapper>
      {/* Top Creators */}
      <Widget>
        <WidgetHeader>
          <WidgetTitle>
            <WidgetIcon>🎨</WidgetIcon>
            Top Creators
          </WidgetTitle>
          <ViewAll href="#">View all</ViewAll>
        </WidgetHeader>
        <Divider />
        <RankList>
          {topCreators.map(creator => (
            <RankRow key={creator.id}>
              <RankNumber>{creator.rank}.</RankNumber>
              <Avatar
                username={creator.username}
                color={creator.avatarColor}
                size="34px"
                fontSize="0.8rem"
              />
              <RankInfo>
                <RankName>{creator.username}</RankName>
                <RankScore>{creator.score.toLocaleString()} pts</RankScore>
              </RankInfo>
            </RankRow>
          ))}
        </RankList>
      </Widget>

      {/* Popular Players */}
      <Widget>
        <WidgetHeader>
          <WidgetTitle>
            <WidgetIcon>⭐</WidgetIcon>
            Popular Players
          </WidgetTitle>
          <ViewAll href="#">View all</ViewAll>
        </WidgetHeader>
        <Divider />
        <RankList>
          {popularPlayers.map(player => (
            <RankRow key={player.id}>
              <RankNumber>{player.rank}.</RankNumber>
              <Avatar
                username={player.username}
                size="34px"
                fontSize="0.8rem"
              />
              <RankInfo>
                <RankName>{player.username || 'Unknown'}</RankName>
                <RankScore>{(player.popularity ?? 0).toLocaleString()} popularity</RankScore>
              </RankInfo>
            </RankRow>
          ))}
        </RankList>
      </Widget>

      {/* Chess Masters */}
      <Widget>
        <WidgetHeader>
          <WidgetTitle>
            <WidgetIcon>♟️</WidgetIcon>
            Chess Masters
          </WidgetTitle>
          <ViewAll href="#">View all</ViewAll>
        </WidgetHeader>
        <Divider />
        <RankList>
          {chessMasters.map(player => (
            <RankRow key={player.id}>
              <RankNumber>{player.rank}.</RankNumber>
              <Avatar
                username={player.username}
                size="34px"
                fontSize="0.8rem"
              />
              <RankInfo>
                <RankName>{player.username}</RankName>
                <RankScore>{player.chess_rating ?? 1000} ELO</RankScore>
              </RankInfo>
            </RankRow>
          ))}
        </RankList>
      </Widget>
    </SidebarWrapper>
  );
}
