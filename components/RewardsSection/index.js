'use client';
import styled, { keyframes } from 'styled-components';
import { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/Card';
import { SecondaryButton } from '@/components/ui/Button';
import { fetchDailyRewardStatus, claimDailyReward } from '@/lib/dailyRewardApi';
import { redeemCode } from '@/lib/codesApi';
import { useAuth } from '@/features/auth/AuthProvider';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 16px rgba(251,191,36,0.3); }
  50%       { box-shadow: 0 0 32px rgba(251,191,36,0.6); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const SectionWrapper = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['8']};
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.02em;
  margin-bottom: ${({ theme }) => theme.spacing['4']};

  span { color: ${({ theme }) => theme.colors.accent.gold}; }
`;

const RewardsCard = styled(GlassCard)`
  padding: ${({ theme }) => theme.spacing['6']} ${({ theme }) => theme.spacing['8']};
  background: linear-gradient(135deg, #16120a 0%, #0e0e1c 100%);
  border-color: ${({ theme }) => theme.colors.border.gold};
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: ${({ theme }) => theme.spacing['8']};
  align-items: start;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing['6']};
    padding: ${({ theme }) => theme.spacing['5']};
  }
`;

const ColumnDivider = styled.div`
  width: 1px;
  align-self: stretch;
  background: ${({ theme }) => theme.colors.border.gold};
  opacity: 0.4;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) { display: none; }
`;

/* ── Daily Reward column ─────────────────── */
const DailyColumn = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`;

const DailyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
`;

const RewardIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.gradient.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;
  animation: ${pulse} 3s ease-in-out infinite;
`;

const DailyTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DailySub = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 2px;
`;

const StreakBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.accent.goldAlpha};
  border: 1px solid ${({ theme }) => theme.colors.border.gold};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.accent.gold};
  z-index: 1;
`;

const RewardBoxRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing['3']};
`;

const RewardBox = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: ${({ theme }) => theme.spacing['3']};
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1.5px solid ${({ $dim, $claimed, theme }) =>
    $dim ? theme.colors.border.subtle :
    $claimed ? theme.colors.border.medium :
    theme.colors.border.gold};
  background: ${({ $dim, $claimed }) =>
    $dim ? 'rgba(255,255,255,0.02)' :
    $claimed ? 'rgba(255,255,255,0.03)' :
    'rgba(251,191,36,0.06)'};
  opacity: ${({ $dim }) => $dim ? 0.6 : 1};
  cursor: ${({ $dim, $claimed }) => ($dim || $claimed) ? 'default' : 'pointer'};
  transition: background 0.15s, border-color 0.15s;
  width: 100%;

  ${({ $dim, $claimed }) => !$dim && !$claimed && `
    &:hover {
      background: rgba(251,191,36,0.13);
      border-color: gold;
    }
  `}
`;

const RewardBoxLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const RewardBoxCoins = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ $dim, theme }) => $dim ? theme.colors.text.secondary : theme.colors.accent.gold};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RewardBoxUnit = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SkeletonLine = styled.div`
  height: ${({ $h }) => $h || '16px'};
  width: ${({ $w }) => $w || '100%'};
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(90deg,
    rgba(255,255,255,0.04) 25%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.04) 75%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.6s infinite linear;
`;

/* ── Redeem column ───────────────────────── */
const RedeemColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`;

const RedeemTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const RedeemSub = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const CodeInputRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['3']};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { flex-direction: column; }
`;

const CodeInput = styled.input`
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1.5px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.gold};
    box-shadow: 0 0 0 3px rgba(251,191,36,0.08);
  }
`;

const FeedbackMessage = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ $type, theme }) =>
    $type === 'success' ? theme.colors.accent.emerald :
    $type === 'error'   ? theme.colors.accent.rose :
    theme.colors.text.muted};
  min-height: 20px;
`;

export default function RewardsSection() {
  const { user, loading: authLoading } = useAuth();

  const [code,        setCode]        = useState('');
  const [codeFb,      setCodeFb]      = useState(null);
  const [redeeming,   setRedeeming]   = useState(false);

  const [reward,      setReward]      = useState(null);   // { streak, claimedToday, todayCoins, tomorrowCoins }
  const [rewardLoad,  setRewardLoad]  = useState(true);
  const [claiming,    setClaiming]    = useState(false);
  const [claimFb,     setClaimFb]     = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setRewardLoad(false); return; }
    fetchDailyRewardStatus()
      .then(setReward)
      .catch(() => {})
      .finally(() => setRewardLoad(false));
  }, [authLoading, user]);

  const handleClaim = async () => {
    setClaiming(true);
    setClaimFb(null);
    try {
      const result = await claimDailyReward();
      setReward(prev => ({
        ...prev,
        streak:       result.newStreak,
        claimedToday: true,
        todayCoins:   prev?.todayCoins ?? result.coinsAwarded,
        tomorrowCoins: 100 + result.newStreak * 50,
      }));
      setClaimFb({ type: 'success', msg: `✓ +${result.coinsAwarded} coins claimed! 🔥 ${result.newStreak}-day streak` });
      window.dispatchEvent(new CustomEvent('notif:refresh'));
    } catch (err) {
      setClaimFb({ type: 'error', msg: `✗ ${err.message}` });
    } finally {
      setClaiming(false);
    }
  };

  const handleRedeem = async () => {
    if (!code.trim()) { setCodeFb({ type: 'error', msg: 'Please enter a code.' }); return; }
    setRedeeming(true);
    setCodeFb(null);
    try {
      const result = await redeemCode(code.trim());
      setCodeFb({ type: 'success', msg: `✓ Code redeemed! +${result.lisAwarded} Lis added to your account.` });
      setCode('');
      window.dispatchEvent(new CustomEvent('notif:refresh'));
    } catch (err) {
      setCodeFb({ type: 'error', msg: `✗ ${err.message}` });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <SectionWrapper>
      <RewardsCard $radius="2xl">

        {/* ── Daily Reward ── */}
        <DailyColumn>
          <DailyHeader>
            <RewardIcon>🎁</RewardIcon>
            <div>
              <DailyTitle>Daily Login Reward</DailyTitle>
              <DailySub>Consecutive logins grow your streak and your coins!</DailySub>
            </div>
          </DailyHeader>

          {rewardLoad ? (
            <>
              <SkeletonLine $h="22px" $w="40%" />
              <RewardBoxRow>
                <SkeletonLine $h="80px" />
                <SkeletonLine $h="80px" />
              </RewardBoxRow>
              <SkeletonLine $h="40px" />
            </>
          ) : reward ? (
            <>
              <StreakBadge>🔥 {reward.streak}-day streak</StreakBadge>

              <RewardBoxRow>
                <RewardBox
                  onClick={!reward.claimedToday && !claiming ? handleClaim : undefined}
                  $claimed={reward.claimedToday}
                  disabled={reward.claimedToday || claiming}
                  title={reward.claimedToday ? 'Come back tomorrow!' : 'Click to claim'}
                >
                  <RewardBoxLabel>
                    {reward.claimedToday ? '✓ Claimed' : claiming ? 'Claiming…' : 'Today'}
                  </RewardBoxLabel>
                  <RewardBoxCoins>
                    <img src="/Nectar.png" alt="" style={{ width: '26px', height: '26px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '6px' }} />
                    {reward.todayCoins}
                  </RewardBoxCoins>
                </RewardBox>
                <RewardBox $dim disabled>
                  <RewardBoxLabel>Tomorrow</RewardBoxLabel>
                  <RewardBoxCoins $dim>
                    <img src="/Nectar.png" alt="" style={{ width: '26px', height: '26px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '6px', opacity: 0.5 }} />
                    {reward.tomorrowCoins}
                  </RewardBoxCoins>
                </RewardBox>
              </RewardBoxRow>

              {claimFb?.msg && (
                <FeedbackMessage $type={claimFb.type}>
                  {claimFb.msg}
                </FeedbackMessage>
              )}
            </>
          ) : (
            <DailySub>Log in to claim your daily reward.</DailySub>
          )}
        </DailyColumn>

        <ColumnDivider />

        {/* ── Redeem Codes ── */}
        <RedeemColumn>
          <div>
            <RedeemTitle>🎟 Redeem a Code</RedeemTitle>
            <RedeemSub>Enter a promo code to claim free items and currency.</RedeemSub>
          </div>

          <CodeInputRow>
            <CodeInput
              type="text"
              placeholder="Enter code..."
              value={code}
              onChange={e => { setCode(e.target.value); setCodeFb(null); }}
              onKeyDown={e => e.key === 'Enter' && handleRedeem()}
              maxLength={24}
            />
            <SecondaryButton onClick={handleRedeem} disabled={redeeming}>
              {redeeming ? 'Redeeming…' : 'Redeem'}
            </SecondaryButton>
          </CodeInputRow>

          <FeedbackMessage $type={codeFb?.type}>
            {codeFb?.msg || ''}
          </FeedbackMessage>
        </RedeemColumn>

      </RewardsCard>
    </SectionWrapper>
  );
}
