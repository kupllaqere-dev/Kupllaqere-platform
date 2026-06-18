'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/features/auth/AuthProvider';
import { GhostButton, PrimaryButton } from '@/components/ui/Button';
import Header from '@/components/Header';
import ImageCropModal from '@/components/ui/ImageCropModal';

/* â”€â”€â”€ Animations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* â”€â”€â”€ Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Page = styled.div`
  min-height: 100vh;
  padding: 3rem 1.5rem;
`;

const Inner = styled.div`
  max-width: 720px;
  margin: 0 auto;
  animation: ${fadeUp} 0.4s ease;
`;

/* â”€â”€â”€ Profile card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Card = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

/* â”€â”€â”€ Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const BannerEditHint = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  gap: 0.4rem;
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  pointer-events: none;
`;

const BannerArea = styled.div`
  height: 120px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: ${({ $img, theme }) =>
    $img ? `url(${$img}) center / cover no-repeat` : theme.colors.gradient.brand};
  ${({ $img }) => !$img && 'opacity: 0.35;'}

  &:hover ${BannerEditHint} {
    opacity: 1;
  }
`;

const ProfileTop = styled.div`
  padding: 0 2rem 2rem;
  position: relative;
`;

/* â”€â”€â”€ Avatar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const AvatarEditHint = styled.div`
  position: absolute;
  inset: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: rgba(0, 0, 0, 0.58);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  pointer-events: none;
  z-index: 1;
`;

const AvatarWrap = styled.div`
  width: 96px;
  height: 96px;
  margin-top: -48px;
  position: relative;
  cursor: pointer;

  &:hover ${AvatarEditHint} {
    opacity: 1;
  }
`;

const AvatarRing = styled.div`
  width: 96px;
  height: 96px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 3px solid ${({ theme }) => theme.colors.accent.violet};
  box-shadow: 0 0 24px rgba(200,121,65,0.4);
  background: ${({ theme }) => theme.colors.bg.elevated};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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

const GuestTag = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.accent.gold};
  background: ${({ theme }) => theme.colors.accent.goldAlpha};
  border: 1px solid ${({ theme }) => theme.colors.border.gold};
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 0.2rem 0.6rem;
  margin-left: 0.5rem;
  vertical-align: middle;
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

/* â”€â”€â”€ Upload status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const UploadStatus = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ $err, theme }) => $err ? theme.colors.accent.rose : theme.colors.text.muted};
  margin-top: 0.5rem;
  font-style: italic;
`;

/* â”€â”€â”€ Bio â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const BioSection = styled.div`
  margin-top: 1rem;
`;

const BioText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  max-width: 560px;
`;

const NoBio = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  font-style: italic;
`;

const BioEditRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const EditBioBtn = styled.button`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover { color: ${({ theme }) => theme.colors.text.secondary}; }
`;

const BioTextarea = styled.textarea`
  width: 100%;
  max-width: 560px;
  padding: 0.625rem 0.875rem;
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  resize: vertical;
  min-height: 80px;
  outline: none;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus { border-color: ${({ theme }) => theme.colors.accent.violet}; }
`;

const CharCount = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme, $over }) => $over ? theme.colors.accent.rose : theme.colors.text.muted};
`;

const BioActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

/* â”€â”€â”€ No character notice â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const NoCharCard = styled.div`
  margin-top: 1.5rem;
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px dashed ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.5rem;
  text-align: center;
`;

const NoCharTitle = styled.p`
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.375rem;
`;

const NoCharSub = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

/* â”€â”€â”€ Loading skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Skeleton = styled.div`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const BIO_MAX = 200;
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp,image/tiff';

/* â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function ProfilePage() {
  const { user, profile, loading, updateBio, updateAvatar, updateBanner } = useAuth();
  const router = useRouter();

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [editingBio, setEditingBio] = useState(false);
  const [bioText,    setBioText]    = useState('');
  const [bioSaving,  setBioSaving]  = useState(false);
  const [bioError,   setBioError]   = useState('');

  const [cropTarget, setCropTarget] = useState(null); // 'avatar' | 'banner'
  const [cropFile,   setCropFile]   = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState('');

  useEffect(() => {
    if (profile) setBioText(profile.platform_bio ?? profile.bio ?? '');
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  async function handleSaveBio() {
    setBioSaving(true);
    setBioError('');
    const { error } = await updateBio(bioText);
    setBioSaving(false);
    if (error) setBioError(error.message || 'Could not save bio.');
    else setEditingBio(false);
  }

  function openFilePicker(target) {
    setUploadErr('');
    if (target === 'avatar') avatarInputRef.current?.click();
    else bannerInputRef.current?.click();
  }

  function handleFileSelected(e, target) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadErr('Only image files are accepted.');
      return;
    }
    setCropFile(file);
    setCropTarget(target);
  }

  async function handleCropConfirm(blob) {
    const target = cropTarget;
    setCropTarget(null);
    setUploading(true);
    setUploadErr('');
    const { error } = await (target === 'avatar' ? updateAvatar(blob) : updateBanner(blob));
    setUploading(false);
    if (error) setUploadErr(error.message || 'Upload failed â€” please try again.');
  }

  if (loading || !user) return <Skeleton>Loadingâ€¦</Skeleton>;

  const hasCharacter = !!(profile?.name);
  const platformName = profile?.platform_username || user.email?.split('@')[0] || 'Player';
  const gameHandle   = hasCharacter ? `@${profile.name}` : null;
  const avatarSrc    = profile?.platform_avatar || null;
  const bannerSrc    = profile?.banner || null;
  const displayBio   = profile?.platform_bio ?? profile?.bio ?? '';
  const bioOver      = bioText.length > BIO_MAX;

  return (
    <>
      <Header />
      <Page>
        <Inner>
          <Card>
            {/* â”€â”€ Banner â”€â”€ */}
            <BannerArea $img={bannerSrc} onClick={() => openFilePicker('banner')} title="Click to change banner">
              {bannerSrc && <BannerEditHint>Edit banner</BannerEditHint>}
              {!bannerSrc && <BannerEditHint style={{ opacity: 0.7 }}>Add banner image</BannerEditHint>}
            </BannerArea>

            <ProfileTop>
              {/* â”€â”€ Avatar â”€â”€ */}
              <AvatarWrap onClick={() => openFilePicker('avatar')} title="Click to change avatar">
                <AvatarRing>
                  {avatarSrc
                    ? <AvatarImg src={avatarSrc} alt={platformName} />
                    : '?'
                  }
                </AvatarRing>
                <AvatarEditHint>Edit</AvatarEditHint>
              </AvatarWrap>

              {(uploading || uploadErr) && (
                <UploadStatus $err={!!uploadErr}>
                  {uploading ? 'Uploadingâ€¦' : uploadErr}
                </UploadStatus>
              )}

              <ProfileMeta>
                <NameBlock>
                  <DisplayName>
                    {platformName}
                    {profile?.is_guest && <GuestTag>Guest</GuestTag>}
                  </DisplayName>
                  {gameHandle
                    ? <GameHandle>{gameHandle}</GameHandle>
                    : <GameHandle $none>No character linked</GameHandle>
                  }
                </NameBlock>

                {profile?.role && profile.role !== 'player' && (
                  <RoleBadge>{profile.role}</RoleBadge>
                )}
              </ProfileMeta>

              {/* â”€â”€ Bio â”€â”€ */}
              <BioSection>
                {editingBio ? (
                  <>
                    <BioTextarea
                      value={bioText}
                      onChange={e => setBioText(e.target.value)}
                      placeholder="Write a short bioâ€¦"
                      maxLength={BIO_MAX + 10}
                    />
                    <BioActions>
                      <CharCount $over={bioOver}>{bioText.length}/{BIO_MAX}</CharCount>
                      <PrimaryButton
                        size="sm"
                        onClick={handleSaveBio}
                        disabled={bioSaving || bioOver}
                      >
                        {bioSaving ? 'Savingâ€¦' : 'Save'}
                      </PrimaryButton>
                      <GhostButton size="sm" onClick={() => { setEditingBio(false); setBioText(displayBio); setBioError(''); }}>
                        Cancel
                      </GhostButton>
                      {bioError && <span style={{ fontSize: '0.75rem', color: '#c44040' }}>{bioError}</span>}
                    </BioActions>
                  </>
                ) : (
                  <>
                    {displayBio
                      ? <BioText>{displayBio}</BioText>
                      : <NoBio>No bio yet.</NoBio>
                    }
                    <BioEditRow>
                      <EditBioBtn onClick={() => setEditingBio(true)}>
                        {displayBio ? 'Edit bio' : 'Add a bio'}
                      </EditBioBtn>
                    </BioEditRow>
                  </>
                )}
              </BioSection>

              {!hasCharacter && (
                <NoCharCard>
                  <NoCharTitle>No character linked</NoCharTitle>
                  <NoCharSub>Launch FashionVerse and complete the setup to link your character here.</NoCharSub>
                </NoCharCard>
              )}
            </ProfileTop>
          </Card>
        </Inner>
      </Page>

      {/* â”€â”€ Hidden file inputs â”€â”€ */}
      <input
        ref={avatarInputRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: 'none' }}
        onChange={e => handleFileSelected(e, 'avatar')}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: 'none' }}
        onChange={e => handleFileSelected(e, 'banner')}
      />

      {/* â”€â”€ Crop modals â”€â”€ */}
      <ImageCropModal
        open={cropTarget === 'avatar'}
        onClose={() => setCropTarget(null)}
        onConfirm={handleCropConfirm}
        file={cropFile}
        circular
        outputW={256}
        outputH={256}
        title="Adjust avatar"
      />
      <ImageCropModal
        open={cropTarget === 'banner'}
        onClose={() => setCropTarget(null)}
        onConfirm={handleCropConfirm}
        file={cropFile}
        outputW={1440}
        outputH={240}
        title="Adjust banner"
      />
    </>
  );
}
