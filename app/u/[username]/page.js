'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { createClient } from '@/lib/supabase';
import Header from '@/components/Header';
import Avatar from '@/components/ui/Avatar';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  min-height: 100vh;
  padding: 3rem 1.5rem;
`;

const Inner = styled.div`
  max-width: 720px;
  margin: 0 auto;
  animation: ${fadeUp} 0.35s ease;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Banner = styled.div`
  height: 120px;
  background: ${({ $img, theme }) =>
    $img ? `url(${$img}) center / cover no-repeat` : theme.colors.gradient.brand};
  opacity: ${({ $img }) => $img ? 1 : 0.35};
`;

const ProfileTop = styled.div`
  padding: 0 2rem 2rem;
`;

const AvatarRing = styled.div`
  width: 96px;
  height: 96px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 3px solid ${({ theme }) => theme.colors.accent.violet};
  box-shadow: 0 0 24px rgba(200,121,65,0.4);
  background: ${({ theme }) => theme.colors.bg.elevated};
  overflow: hidden;
  margin-top: -48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileMeta = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const NameBlock = styled.div``;

const DisplayName = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['3xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.15;
`;

const GameHandle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 0.3rem;
  font-style: ${({ $none }) => $none ? 'italic' : 'normal'};
`;

const RoleBadge = styled.span`
  align-self: flex-start;
  margin-top: 0.5rem;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  text-transform: capitalize;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.accent.violet};
  background: ${({ theme }) => theme.colors.accent.violetAlpha};
  border: 1px solid rgba(200,121,65,0.3);
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 0.25rem 0.75rem;
`;

const Bio = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  margin-top: 1rem;
  max-width: 560px;
`;

const NoBio = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  font-style: italic;
  margin-top: 1rem;
`;

const NoCharCard = styled.div`
  margin-top: 1.5rem;
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px dashed ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.5rem;
  text-align: center;
`;

const NoCharSub = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const NotFound = styled.div`
  text-align: center;
  padding: 6rem 1.5rem;
  color: ${({ theme }) => theme.colors.text.muted};

  h2 {
    font-size: ${({ theme }) => theme.typography.sizes['2xl']};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 0.5rem;
  }
`;

const Skeleton = styled.div`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

export default function UserProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sb = createClient();

      // Try by platform_username first
      let { data } = await sb
        .from('profiles')
        .select('*')
        .eq('platform_username', username)
        .maybeSingle();

      // Fallback: try as UUID (direct ID link from search)
      if (!data) {
        const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRe.test(username)) {
          const res = await sb.from('profiles').select('*').eq('id', username).maybeSingle();
          data = res.data;
        }
      }

      setProfile(data ?? null);
      setLoading(false);

      // Increment popularity — once per browser session per profile
      if (data?.id && !data.is_guest) {
        const key = `pv_${data.id}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/platform/players/${data.id}/view`, { method: 'POST' })
            .catch(() => {});
        }
      }
    }
    load();
  }, [username]);

  if (loading) return <Skeleton>Loading…</Skeleton>;

  if (!profile) {
    return (
      <>
        <Header />
        <Page>
          <NotFound>
            <h2>Player not found</h2>
            <p>No profile exists for <strong>{username}</strong>.</p>
          </NotFound>
        </Page>
      </>
    );
  }

  const displayName  = profile.platform_username || profile.name || 'Unknown';
  const hasCharacter = !!(profile.name);
  const bio          = profile.platform_bio || profile.bio || '';

  return (
    <>
      <Header />
      <Page>
        <Inner>
          <Card>
            <Banner $img={profile.banner || null} />
            <ProfileTop>
              <AvatarRing>
                <Avatar
                  src={profile.platform_avatar || null}
                  username={displayName}
                  color="#c87941"
                  size="96px"
                  fontSize="2rem"
                />
              </AvatarRing>

              <ProfileMeta>
                <NameBlock>
                  <DisplayName>{displayName}</DisplayName>
                  {hasCharacter
                    ? <GameHandle>@{profile.name}</GameHandle>
                    : <GameHandle $none>No character linked</GameHandle>
                  }
                </NameBlock>

                {profile.role && profile.role !== 'player' && (
                  <RoleBadge>{profile.role}</RoleBadge>
                )}
              </ProfileMeta>

              {bio
                ? <Bio>{bio}</Bio>
                : <NoBio>No bio yet.</NoBio>
              }

              {!hasCharacter && (
                <NoCharCard>
                  <NoCharSub>This player hasn't linked a game character yet.</NoCharSub>
                </NoCharCard>
              )}
            </ProfileTop>
          </Card>
        </Inner>
      </Page>
    </>
  );
}
