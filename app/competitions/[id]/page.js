'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styled, { keyframes, css } from 'styled-components';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  fetchCompetition, fetchMyEntry, registerForCompetition,
  fetchEntries, toggleLike,
} from '@/lib/competitionsApi';

/* ─── Animations ───────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -800px 0; }
  100% { background-position: 800px 0; }
`;
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  100% { transform: scale(1); }
`;

/* ─── Layout ───────────────────────────────────────────────────── */
const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  flex: 1;
  max-width: 860px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px 80px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 24px 16px 60px;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration: none;
  margin-bottom: 28px;
  transition: color ${({ theme }) => theme.transitions.fast};
  &:hover { color: ${({ theme }) => theme.colors.text.accent}; }
`;

/* ─── Banner ───────────────────────────────────────────────────── */
const Banner = styled.div`
  width: 100%;
  aspect-ratio: 16 / 7;
  border-radius: ${({ theme }) => theme.radii['2xl']};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg.elevated};
  margin-bottom: 28px;
  animation: ${fadeUp} 0.3s ease;
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const BannerSkeleton = styled.div`
  width: 100%;
  aspect-ratio: 16 / 7;
  border-radius: ${({ theme }) => theme.radii['2xl']};
  background: linear-gradient(90deg,
    ${({ theme }) => theme.colors.bg.elevated} 25%,
    ${({ theme }) => theme.colors.bg.glass} 50%,
    ${({ theme }) => theme.colors.bg.elevated} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.6s infinite linear;
  margin-bottom: 28px;
`;

/* ─── Content card ─────────────────────────────────────────────── */
const Card = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  padding: 32px 36px;
  animation: ${fadeUp} 0.35s ease 0.05s both;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { padding: 20px; }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
`;

const CompTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['3xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.25;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  }
`;

const statusVariants = {
  upcoming:     css`background: ${({ theme }) => theme.colors.accent.violetAlpha}; color: ${({ theme }) => theme.colors.accent.violet}; border-color: rgba(139,92,246,0.3);`,
  registration: css`background: rgba(34,211,238,0.1); color: ${({ theme }) => theme.colors.accent.cyan}; border-color: rgba(34,211,238,0.3);`,
  voting:       css`background: rgba(251,191,36,0.1); color: ${({ theme }) => theme.colors.accent.gold}; border-color: rgba(251,191,36,0.3);`,
  closed:       css`background: transparent; color: ${({ theme }) => theme.colors.text.muted}; border-color: ${({ theme }) => theme.colors.border.subtle};`,
};

const StatusBadge = styled.span`
  flex-shrink: 0;
  padding: 5px 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  border: 1px solid;
  white-space: nowrap;
  ${({ $variant }) => statusVariants[$variant] ?? statusVariants.closed}
`;

const CompDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 24px;
`;

const DatesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const DateItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DateLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const DateValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

/* ─── Registration card ────────────────────────────────────────── */
const RegCard = styled(Card)`
  margin-top: 20px;
  animation-delay: 0.1s;
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 6px;
`;

const SectionSub = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 24px;
`;

/* ─── Upload box ───────────────────────────────────────────────── */
const UploadBox = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 2px dashed ${({ $hasFile, theme }) => $hasFile ? theme.colors.border.accent : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ $hasFile, theme }) => $hasFile ? theme.colors.accent.violetAlpha : theme.colors.bg.elevated};
  min-height: 220px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  overflow: hidden;
  position: relative;
  margin-bottom: 20px;
  &:hover { border-color: ${({ theme }) => theme.colors.border.accent}; background: ${({ theme }) => theme.colors.accent.violetAlpha}; }
  input { display: none; }
`;

const UploadPreview = styled.img`
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
`;

const UploadPlaceholder = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none;
`;

const UploadIcon   = styled.div`font-size: 2.5rem; opacity: 0.4;`;
const UploadText   = styled.span`font-size: ${({ theme }) => theme.typography.sizes.sm}; font-weight: ${({ theme }) => theme.typography.weights.medium}; color: ${({ theme }) => theme.colors.text.secondary};`;
const UploadHint   = styled.span`font-size: ${({ theme }) => theme.typography.sizes.xs}; color: ${({ theme }) => theme.colors.text.muted};`;

const RemoveBtn = styled.button`
  position: absolute; top: 10px; right: 10px; width: 26px; height: 26px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: rgba(7,7,15,0.8);
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.accent.rose};
  font-size: 0.7rem; display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 2; transition: all ${({ theme }) => theme.transitions.fast};
  &:hover { background: rgba(251,113,133,0.15); border-color: ${({ theme }) => theme.colors.accent.rose}; }
`;

/* ─── Buttons / feedback ───────────────────────────────────────── */
const SubmitBtn = styled.button`
  width: 100%;
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: #fff;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent.violet}, ${({ theme }) => theme.colors.accent.violetDark});
  border: none; cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  box-shadow: 0 4px 14px rgba(139,92,246,0.3);
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,92,246,0.45); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SuccessBanner = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px; border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.accent.emeraldAlpha};
  border: 1px solid rgba(52,211,153,0.25);
  color: ${({ theme }) => theme.colors.accent.emerald};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  animation: ${fadeIn} 0.25s ease;
`;

const ErrorBanner = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: ${({ theme }) => theme.radii.lg};
  background: rgba(251,113,133,0.1); border: 1px solid rgba(251,113,133,0.25);
  color: ${({ theme }) => theme.colors.accent.rose};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  margin-top: 14px; animation: ${fadeIn} 0.25s ease;
`;

const LoginPrompt = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  a { color: ${({ theme }) => theme.colors.accent.violet}; text-decoration: none; font-weight: ${({ theme }) => theme.typography.weights.medium}; &:hover { text-decoration: underline; } }
`;

/* ─── Entries grid ─────────────────────────────────────────────── */
const EntriesCard = styled(Card)`
  margin-top: 20px;
  animation-delay: 0.15s;
`;

const EntriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const EntryCard = styled.div`
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  overflow: hidden;
  transition: border-color ${({ theme }) => theme.transitions.fast};
  &:hover { border-color: ${({ theme }) => theme.colors.border.medium}; }
`;

const EntryImage = styled.div`
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg.surface};
  img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform ${({ theme }) => theme.transitions.slow}; }
  ${EntryCard}:hover & img { transform: scale(1.04); }
`;

const EntryFooter = styled.div`
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const EntryUsername = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LikeBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px solid ${({ $liked, theme }) => $liked ? 'rgba(251,113,133,0.4)' : theme.colors.border.subtle};
  background: ${({ $liked }) => $liked ? 'rgba(251,113,133,0.12)' : 'transparent'};
  color: ${({ $liked, theme }) => $liked ? theme.colors.accent.rose : theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  transition: all ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  &:hover:not(:disabled) {
    border-color: rgba(251,113,133,0.4);
    background: rgba(251,113,133,0.1);
    color: ${({ theme }) => theme.colors.accent.rose};
  }
`;

const HeartIcon = styled.span`
  font-size: 0.85rem;
  display: inline-block;
  ${({ $popping }) => $popping && css`animation: ${pop} 0.3s ease;`}
`;

const EmptyEntries = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: center;
  padding: 32px 0 8px;
`;

/* ─── Skeleton ─────────────────────────────────────────────────── */
const SkeletonLine = styled.div`
  height: ${({ $h }) => $h || '16px'};
  width: ${({ $w }) => $w || '100%'};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: linear-gradient(90deg,
    ${({ theme }) => theme.colors.bg.elevated} 25%,
    ${({ theme }) => theme.colors.bg.glass} 50%,
    ${({ theme }) => theme.colors.bg.elevated} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.6s infinite linear;
  margin-bottom: 12px;
`;

const ErrorState = styled.div`
  text-align: center; padding: 80px 24px; color: ${({ theme }) => theme.colors.text.muted};
`;

/* ─── Helpers ──────────────────────────────────────────────────── */
function getStatus(comp) {
  const now      = Date.now();
  const regStart = new Date(comp.reg_start).getTime();
  const regEnd   = new Date(comp.reg_end).getTime();
  const voteEnd  = new Date(comp.voting_end).getTime();

  if (now < regStart) {
    const ms    = regStart - now;
    const days  = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    if (days >= 1)  return { label: `Registrations in ${days}d`, variant: 'upcoming' };
    if (hours >= 1) return { label: `Registrations in ${hours}h`, variant: 'upcoming' };
    return { label: 'Starting soon', variant: 'upcoming' };
  }
  if (now < regEnd)  return { label: 'Registrations open', variant: 'registration' };
  if (now < voteEnd) return { label: 'Voting open',        variant: 'voting' };
  return { label: 'Closed', variant: 'closed' };
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/* ─── Registration form ────────────────────────────────────────── */
function RegistrationForm({ competitionId, onRegistered }) {
  const inputRef = useRef(null);
  const [image, setImage]           = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage({ file, url: URL.createObjectURL(file) });
  }

  function handleRemove(e) {
    e.preventDefault(); e.stopPropagation();
    if (image?.url) URL.revokeObjectURL(image.url);
    setImage(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!image?.file) return;
    setSubmitting(true); setError(null);
    try {
      await registerForCompetition(competitionId, image.file);
      if (image?.url) URL.revokeObjectURL(image.url);
      onRegistered();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <UploadBox $hasFile={!!image}>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} />
        {image ? (
          <>
            <UploadPreview src={image.url} alt="Your entry" />
            <RemoveBtn onClick={handleRemove} type="button">✕</RemoveBtn>
          </>
        ) : (
          <UploadPlaceholder>
            <UploadIcon>👗</UploadIcon>
            <UploadText>Click to upload your look</UploadText>
            <UploadHint>PNG, JPG, WEBP up to 10 MB</UploadHint>
          </UploadPlaceholder>
        )}
      </UploadBox>
      {error && <ErrorBanner>⚠️ {error}</ErrorBanner>}
      <SubmitBtn type="submit" disabled={!image || submitting} style={{ marginTop: error ? 14 : 0 }}>
        {submitting ? 'Submitting…' : 'Submit Entry'}
      </SubmitBtn>
    </form>
  );
}

/* ─── Entries section ──────────────────────────────────────────── */
function EntriesSection({ competitionId, votingOpen, user }) {
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [popping, setPopping]   = useState(null); // entryId currently animating

  useEffect(() => {
    fetchEntries(competitionId)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [competitionId]);

  async function handleLike(entry) {
    if (!votingOpen || !user) return;
    if (entry.user_id === user.id) return;

    // Optimistic update
    const wasLiked = entry.liked_by_me;
    setEntries(prev => prev.map(e =>
      e.id === entry.id
        ? { ...e, liked_by_me: !wasLiked, like_count: e.like_count + (wasLiked ? -1 : 1) }
        : e
    ));
    setPopping(entry.id);
    setTimeout(() => setPopping(null), 350);

    try {
      await toggleLike(competitionId, entry.id);
    } catch {
      // Revert on failure
      setEntries(prev => prev.map(e =>
        e.id === entry.id
          ? { ...e, liked_by_me: wasLiked, like_count: e.like_count + (wasLiked ? 1 : -1) }
          : e
      ));
    }
  }

  return (
    <EntriesCard>
      <SectionTitle>{votingOpen ? 'Vote for your favourite' : 'Entries'}</SectionTitle>
      <SectionSub style={{ marginBottom: 0 }}>
        {votingOpen
          ? 'Like the looks you love. You can like as many entries as you want.'
          : 'All entries from this competition.'}
      </SectionSub>

      {loading ? (
        <EntriesGrid style={{ marginTop: 20 }}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i}>
              <SkeletonLine style={{ aspectRatio: '1/1', height: 'auto', marginBottom: 8 }} />
              <SkeletonLine $w="60%" $h="12px" />
            </div>
          ))}
        </EntriesGrid>
      ) : entries.length === 0 ? (
        <EmptyEntries>No entries yet.</EmptyEntries>
      ) : (
        <EntriesGrid>
          {entries.map(entry => {
            const isOwn     = user?.id === entry.user_id;
            const canLike   = votingOpen && user && !isOwn;
            return (
              <EntryCard key={entry.id}>
                <EntryImage>
                  <img src={entry.image_url} alt={`${entry.username}'s entry`} />
                </EntryImage>
                <EntryFooter>
                  <EntryUsername>{entry.username}</EntryUsername>
                  <LikeBtn
                    $liked={entry.liked_by_me}
                    disabled={!canLike}
                    onClick={() => handleLike(entry)}
                    title={
                      !user ? 'Log in to like entries'
                      : isOwn ? 'Your entry'
                      : !votingOpen ? 'Voting is closed'
                      : entry.liked_by_me ? 'Unlike' : 'Like'
                    }
                  >
                    <HeartIcon $popping={popping === entry.id}>
                      {entry.liked_by_me ? '♥' : '♡'}
                    </HeartIcon>
                    {entry.like_count}
                  </LikeBtn>
                </EntryFooter>
              </EntryCard>
            );
          })}
        </EntriesGrid>
      )}
    </EntriesCard>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function CompetitionPage() {
  const { id }                         = useParams();
  const { user, loading: authLoading } = useAuth();
  const [comp, setComp]                = useState(null);
  const [loading, setLoading]          = useState(true);
  const [error, setError]              = useState(null);
  const [registered, setRegistered]    = useState(false);
  const [checkingEntry, setCheckingEntry] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchCompetition(id)
      .then(setComp)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!comp || authLoading || !user) return;
    const status = getStatus(comp);
    if (status.variant !== 'registration') return;
    setCheckingEntry(true);
    fetchMyEntry(comp.id)
      .then(({ registered: r }) => setRegistered(r))
      .catch(() => {})
      .finally(() => setCheckingEntry(false));
  }, [comp, user, authLoading]);

  const status = comp ? getStatus(comp) : null;
  const showEntries = status && (status.variant === 'voting' || status.variant === 'closed');

  return (
    <PageWrap>
      <Header />
      <Body>
        <BackLink href="/competitions">← Back to Competitions</BackLink>

        {loading && (
          <>
            <BannerSkeleton />
            <SkeletonLine $h="36px" $w="75%" />
            <SkeletonLine $h="14px" $w="40%" />
            <div style={{ marginTop: 20 }}>
              {[100, 95, 88, 100, 72].map((w, i) => (
                <SkeletonLine key={i} $w={`${w}%`} />
              ))}
            </div>
          </>
        )}

        {!loading && error && (
          <ErrorState>
            <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.4 }}>🏆</div>
            <p style={{ marginBottom: 20 }}>This competition could not be found.</p>
            <BackLink href="/competitions">← Back to Competitions</BackLink>
          </ErrorState>
        )}

        {!loading && !error && comp && (
          <>
            <Banner>
              <img src={comp.image_url} alt={comp.title} />
            </Banner>

            <Card>
              <TitleRow>
                <CompTitle>{comp.title}</CompTitle>
                <StatusBadge $variant={status.variant}>{status.label}</StatusBadge>
              </TitleRow>

              <CompDesc>{comp.description}</CompDesc>

              <DatesRow>
                <DateItem>
                  <DateLabel>Registrations open</DateLabel>
                  <DateValue>{fmtDate(comp.reg_start)}</DateValue>
                </DateItem>
                <DateItem>
                  <DateLabel>Registrations close</DateLabel>
                  <DateValue>{fmtDate(comp.reg_end)}</DateValue>
                </DateItem>
                <DateItem>
                  <DateLabel>Voting ends</DateLabel>
                  <DateValue>{fmtDate(comp.voting_end)}</DateValue>
                </DateItem>
              </DatesRow>
            </Card>

            {status.variant === 'registration' && (
              <RegCard>
                {registered ? (
                  <SuccessBanner>✅ You&apos;re registered for this competition!</SuccessBanner>
                ) : checkingEntry || authLoading ? null : !user ? (
                  <>
                    <SectionTitle>Enter this competition</SectionTitle>
                    <LoginPrompt>
                      <Link href="/login">Log in</Link> to submit your entry.
                    </LoginPrompt>
                  </>
                ) : (
                  <>
                    <SectionTitle>Enter this competition</SectionTitle>
                    <SectionSub>Upload a photo of your look to participate.</SectionSub>
                    <RegistrationForm
                      competitionId={comp.id}
                      onRegistered={() => setRegistered(true)}
                    />
                  </>
                )}
              </RegCard>
            )}

            {showEntries && (
              <EntriesSection
                competitionId={comp.id}
                votingOpen={status.variant === 'voting'}
                user={user}
              />
            )}
          </>
        )}
      </Body>
      <Footer />
    </PageWrap>
  );
}
