'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/features/auth/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createNews } from '@/lib/newsApi';
import { createCompetition } from '@/lib/competitionsApi';
import { fetchTickets, replyToTicket, updateTicketStatus } from '@/lib/supportApi';
import { fetchCodes, createCode, toggleCode } from '@/lib/codesApi';

/* â”€â”€â”€ Animations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* â”€â”€â”€ Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
  gap: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }
`;

/* â”€â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Sidebar = styled.aside`
  width: 220px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 20px 12px;
  height: fit-content;
  position: sticky;
  top: 92px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    position: static;
    display: flex;
    gap: 8px;
    padding: 12px;
  }
`;

const SidebarTitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0 8px;
  margin-bottom: 8px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const SidebarItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ $active, theme }) => $active ? theme.colors.text.primary : theme.colors.text.secondary};
  background: ${({ $active, theme }) => $active ? theme.colors.accent.violetAlpha : 'transparent'};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.border.accent : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ $active, theme }) => $active ? theme.colors.accent.violetAlpha : theme.colors.bg.elevated};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex: 1;
    justify-content: center;
  }
`;

/* â”€â”€â”€ Main content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Main = styled.main`
  flex: 1;
  min-width: 0;
`;

const FormCard = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  padding: 32px;
  animation: ${fadeIn} 0.2s ease;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 20px 16px;
  }
`;

const FormTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 6px;
`;

const FormSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 28px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  transition: border-color ${({ theme }) => theme.transitions.fast};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.accent};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 140px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  resize: vertical;
  transition: border-color ${({ theme }) => theme.transitions.fast};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.accent};
  }
`;

/* â”€â”€â”€ Image upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ImagesRow = styled.div`
  display: grid;
  grid-template-columns: ${({ $cols }) => `repeat(${$cols}, 1fr)`};
  gap: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const UploadBox = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 2px dashed ${({ $hasFile, theme }) => $hasFile ? theme.colors.border.accent : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ $hasFile, theme }) => $hasFile ? theme.colors.accent.violetAlpha : theme.colors.bg.surface};
  min-height: 180px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  overflow: hidden;
  position: relative;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.accent};
    background: ${({ theme }) => theme.colors.accent.violetAlpha};
  }

  input {
    display: none;
  }
`;

const UploadPreview = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.xl};
`;

const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
`;

const UploadIcon = styled.div`
  font-size: 1.75rem;
  opacity: 0.5;
`;

const UploadHint = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: center;
  padding: 0 12px;
`;

const UploadLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: rgba(7, 7, 15, 0.8);
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.accent.rose};
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(251, 113, 133, 0.15);
    border-color: ${({ theme }) => theme.colors.accent.rose};
  }
`;

/* â”€â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const ResetBtn = styled.button`
  padding: 10px 20px;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border.medium};
  }
`;

const SubmitBtn = styled.button`
  padding: 10px 28px;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: #fff;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent.violet}, ${({ theme }) => theme.colors.accent.violetDark});
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  box-shadow: 0 4px 14px rgba(200, 121, 65, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(200, 121, 65, 0.45);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.accent.emeraldAlpha};
  border: 1px solid rgba(52, 211, 153, 0.25);
  color: ${({ theme }) => theme.colors.accent.emerald};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin-top: 16px;
  animation: ${fadeIn} 0.25s ease;
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: rgba(251, 113, 133, 0.1);
  border: 1px solid rgba(251, 113, 133, 0.25);
  color: ${({ theme }) => theme.colors.accent.rose};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin-top: 16px;
  animation: ${fadeIn} 0.25s ease;
`;

/* â”€â”€â”€ Access denied â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Denied = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  padding: 64px 24px;
`;

/* â”€â”€â”€ Image upload sub-component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ImageUpload({ label, hint, value, onChange }) {
  const inputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ file, url });
  }

  function handleRemove(e) {
    e.preventDefault();
    e.stopPropagation();
    if (value?.url) URL.revokeObjectURL(value.url);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <Field>
      <Label>{label}</Label>
      <UploadBox $hasFile={!!value}>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} />
        {value ? (
          <>
            <UploadPreview src={value.url} alt={label} />
            <RemoveBtn onClick={handleRemove} type="button">âœ•</RemoveBtn>
          </>
        ) : (
          <UploadPlaceholder>
            <UploadIcon>ðŸ–¼ï¸</UploadIcon>
            <UploadLabel>Click to upload</UploadLabel>
            <UploadHint>{hint || 'PNG, JPG, WEBP up to 10 MB'}</UploadHint>
          </UploadPlaceholder>
        )}
      </UploadBox>
    </Field>
  );
}

/* â”€â”€â”€ News form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function NewsForm() {
  const [image, setImage]         = useState(null);
  const [title, setTitle]         = useState('');
  const [text, setText]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState(null);

  function reset() {
    if (image?.url) URL.revokeObjectURL(image.url);
    setImage(null);
    setTitle('');
    setText('');
    setSubmitted(false);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!image?.file || !title.trim() || !text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createNews({ title: title.trim(), content: text.trim(), imageFile: image.file });
      setSubmitted(true);
      if (image?.url) URL.revokeObjectURL(image.url);
      setImage(null);
      setTitle('');
      setText('');
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const valid = !!image && title.trim().length > 0 && text.trim().length > 0;

  return (
    <FormCard>
      <FormTitle>Post News</FormTitle>
      <FormSubtitle>Publish a news article visible to all players.</FormSubtitle>

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <ImagesRow $cols={1}>
            <ImageUpload label="Cover Image" value={image} onChange={setImage} />
          </ImagesRow>

          <Field>
            <Label>Title</Label>
            <Input
              type="text"
              placeholder="Article titleâ€¦"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
            />
          </Field>

          <Field>
            <Label>Content</Label>
            <TextArea
              placeholder="Write the news content hereâ€¦"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </Field>
        </FieldGroup>

        {submitted && (
          <SuccessBanner>âœ… News article published successfully!</SuccessBanner>
        )}
        {error && (
          <ErrorBanner>âš ï¸ {error}</ErrorBanner>
        )}

        <ActionRow>
          <ResetBtn type="button" onClick={reset} disabled={submitting}>Clear</ResetBtn>
          <SubmitBtn type="submit" disabled={!valid || submitting}>
            {submitting ? 'Publishingâ€¦' : 'Publish'}
          </SubmitBtn>
        </ActionRow>
      </form>
    </FormCard>
  );
}

/* â”€â”€â”€ Date row (two columns) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const DateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const DateHint = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 4px;
`;

/* â”€â”€â”€ Competitions form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function CompetitionsForm() {
  const [image, setImage]           = useState(null);
  const [title, setTitle]           = useState('');
  const [description, setDesc]      = useState('');
  const [regStart, setRegStart]     = useState('');
  const [regEnd, setRegEnd]         = useState('');
  const [votingEnd, setVotingEnd]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState(null);

  function reset() {
    if (image?.url) URL.revokeObjectURL(image.url);
    setImage(null);
    setTitle(''); setDesc(''); setRegStart(''); setRegEnd(''); setVotingEnd('');
    setSubmitted(false); setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createCompetition({
        title: title.trim(),
        description: description.trim(),
        regStart, regEnd, votingEnd,
        imageFile: image.file,
      });
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const regEndMin  = regStart || undefined;
  const voteEndMin = regEnd   || undefined;

  const valid =
    !!image &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    regStart && regEnd && votingEnd &&
    regEnd > regStart &&
    votingEnd > regEnd;

  return (
    <FormCard>
      <FormTitle>Create Competition</FormTitle>
      <FormSubtitle>
        Set up a new fashion competition. Voting opens automatically when registrations close.
      </FormSubtitle>

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <ImagesRow $cols={1}>
            <ImageUpload label="Cover Image" value={image} onChange={setImage} />
          </ImagesRow>

          <Field>
            <Label>Title</Label>
            <Input
              type="text"
              placeholder="Competition titleâ€¦"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
            />
          </Field>

          <Field>
            <Label>Description</Label>
            <TextArea
              placeholder="Describe the competition, theme, rulesâ€¦"
              value={description}
              onChange={e => setDesc(e.target.value)}
            />
          </Field>

          <DateRow>
            <Field>
              <Label>Registration Opens</Label>
              <Input
                type="date"
                value={regStart}
                onChange={e => setRegStart(e.target.value)}
              />
            </Field>
            <Field>
              <Label>Registration Closes</Label>
              <Input
                type="date"
                value={regEnd}
                min={regEndMin}
                onChange={e => setRegEnd(e.target.value)}
              />
            </Field>
          </DateRow>

          <Field>
            <Label>Voting Ends</Label>
            <Input
              type="date"
              value={votingEnd}
              min={voteEndMin}
              onChange={e => setVotingEnd(e.target.value)}
            />
            <DateHint>Voting begins automatically once registrations close.</DateHint>
          </Field>
        </FieldGroup>

        {submitted && (
          <SuccessBanner>âœ… Competition created successfully!</SuccessBanner>
        )}
        {error && (
          <ErrorBanner>âš ï¸ {error}</ErrorBanner>
        )}

        <ActionRow>
          <ResetBtn type="button" onClick={reset} disabled={submitting}>Clear</ResetBtn>
          <SubmitBtn type="submit" disabled={!valid || submitting}>
            {submitting ? 'Creatingâ€¦' : 'Create Competition'}
          </SubmitBtn>
        </ActionRow>
      </form>
    </FormCard>
  );
}

/* â”€â”€â”€ Support section styled components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TicketRow = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  padding: 16px 20px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ $selected, theme }) => $selected ? theme.colors.accent.violetAlpha : theme.colors.bg.elevated};
  border: 1px solid ${({ $selected, theme }) => $selected ? theme.colors.border.accent : theme.colors.border.default};
  cursor: pointer;
  text-align: left;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.accent};
  }
`;

const TicketMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

const TicketHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

const TicketCategory = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.accent.violetAlpha};
  color: ${({ theme }) => theme.colors.accent.violet};
  border: 1px solid rgba(200,121,65,0.3);
  text-transform: capitalize;
`;

const TicketStatus = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $s, theme }) =>
    $s === 'open'    ? 'rgba(42,172,142,0.1)' :
    $s === 'replied' ? theme.colors.accent.emeraldAlpha :
    'rgba(255,255,255,0.05)'};
  color: ${({ $s, theme }) =>
    $s === 'open'    ? theme.colors.accent.cyan :
    $s === 'replied' ? theme.colors.accent.emerald :
    theme.colors.text.muted};
  border: 1px solid ${({ $s }) =>
    $s === 'open'    ? 'rgba(42,172,142,0.3)' :
    $s === 'replied' ? 'rgba(74,173,106,0.3)' :
    'transparent'};
  text-transform: capitalize;
`;

const TicketUser = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TicketPreview = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TicketTime = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  white-space: nowrap;
  flex-shrink: 0;
`;

/* â”€â”€â”€ Ticket detail panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const DetailWrap = styled.div`
  margin-top: 20px;
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 24px;
  animation: ${fadeIn} 0.2s ease;
`;

const DetailTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 16px;
`;

const DetailMessage = styled.div`
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.7;
  white-space: pre-wrap;
  margin-bottom: 20px;
`;

const ReplyBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReplyLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AdminReplyTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  resize: vertical;
  transition: border-color ${({ theme }) => theme.transitions.fast};
  outline: none;
  box-sizing: border-box;

  &::placeholder { color: ${({ theme }) => theme.colors.text.muted}; }
  &:focus { border-color: ${({ theme }) => theme.colors.border.accent}; }
`;

const ReplyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusSelect = styled.select`
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  outline: none;
  cursor: pointer;

  &:focus { border-color: ${({ theme }) => theme.colors.border.accent}; }

  option { background: #0a0a16; }
`;

const SendReplyBtn = styled.button`
  padding: 10px 24px;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: #fff;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent.violet}, ${({ theme }) => theme.colors.accent.violetDark});
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  box-shadow: 0 4px 14px rgba(200, 121, 65, 0.3);

  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200, 121, 65, 0.45); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const EmptyTickets = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

/* â”€â”€â”€ Support section component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CATEGORY_ICONS = { account: 'ðŸ‘¤', bug: 'ðŸ›', technical: 'âš™ï¸', payment: 'ðŸ’³' };

function SupportSection() {
  const [tickets, setTickets]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [reply, setReply]             = useState('');
  const [replyStatus, setReplyStatus] = useState('replied');
  const [sending, setSending]         = useState(false);
  const [replyDone, setReplyDone]     = useState(false);
  const [replyError, setReplyError]   = useState(null);

  useEffect(() => {
    fetchTickets()
      .then(data => { setTickets(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, []);

  function selectTicket(ticket) {
    setSelected(ticket);
    setReply('');
    setReplyDone(false);
    setReplyError(null);
  }

  async function handleSendReply(e) {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    setSending(true);
    setReplyError(null);
    try {
      await replyToTicket(selected.id, reply.trim());
      await updateTicketStatus(selected.id, replyStatus);
      setTickets(prev => prev.map(t =>
        t.id === selected.id ? { ...t, status: replyStatus } : t
      ));
      setSelected(prev => ({ ...prev, status: replyStatus }));
      setReply('');
      setReplyDone(true);
      setTimeout(() => setReplyDone(false), 4000);
    } catch (err) {
      setReplyError(err.message);
    } finally {
      setSending(false);
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <FormCard>
      <FormTitle>Support Tickets</FormTitle>
      <FormSubtitle>Review and respond to player support requests.</FormSubtitle>

      {loading && <EmptyTickets>Loading ticketsâ€¦</EmptyTickets>}
      {!loading && error && <EmptyTickets>âš ï¸ {error}</EmptyTickets>}
      {!loading && !error && tickets.length === 0 && (
        <EmptyTickets>No tickets yet.</EmptyTickets>
      )}

      {!loading && !error && tickets.length > 0 && (
        <TicketList>
          {tickets.map(ticket => (
            <TicketRow
              key={ticket.id}
              $selected={selected?.id === ticket.id}
              onClick={() => selectTicket(ticket)}
            >
              <TicketMeta>
                <TicketHeader>
                  <TicketCategory>
                    {CATEGORY_ICONS[ticket.category] || 'ðŸ“©'} {ticket.category}
                  </TicketCategory>
                  <TicketStatus $s={ticket.status}>{ticket.status || 'open'}</TicketStatus>
                  <TicketUser>
                    {ticket.platform_username || ticket.user_email || 'Unknown player'}
                  </TicketUser>
                </TicketHeader>
                <TicketPreview>{ticket.message}</TicketPreview>
              </TicketMeta>
              <TicketTime>{ticket.created_at ? formatDate(ticket.created_at) : ''}</TicketTime>
            </TicketRow>
          ))}
        </TicketList>
      )}

      {selected && (
        <DetailWrap>
          <DetailTitle>
            {CATEGORY_ICONS[selected.category] || 'ðŸ“©'} {selected.category} â€”{' '}
            {selected.platform_username || selected.user_email || 'Unknown player'}
          </DetailTitle>
          <DetailMessage>{selected.message}</DetailMessage>

          <ReplyBox>
            <ReplyLabel>Reply to player</ReplyLabel>
            <AdminReplyTextArea
              placeholder="Write your reply hereâ€¦"
              value={reply}
              onChange={e => setReply(e.target.value)}
              disabled={sending}
            />
            <ReplyRow>
              <StatusSelect
                value={replyStatus}
                onChange={e => setReplyStatus(e.target.value)}
              >
                <option value="replied">Mark as replied</option>
                <option value="open">Keep open</option>
                <option value="closed">Mark as closed</option>
              </StatusSelect>
              <SendReplyBtn onClick={handleSendReply} disabled={!reply.trim() || sending}>
                {sending ? 'Sendingâ€¦' : 'Send Reply'}
              </SendReplyBtn>
            </ReplyRow>

            {replyDone  && <SuccessBanner>âœ… Reply sent successfully.</SuccessBanner>}
            {replyError && <ErrorBanner>âš ï¸ {replyError}</ErrorBanner>}
          </ReplyBox>
        </DetailWrap>
      )}
    </FormCard>
  );
}

/* â”€â”€â”€ Codes section styled components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CodesTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
`;

const CodesTableHead = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 120px 160px 100px;
  gap: 12px;
  padding: 8px 16px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`;

const CodeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 120px 160px 100px;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  font-size: ${({ theme }) => theme.typography.sizes.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr 1fr;
    row-gap: 8px;
  }
`;

const CodeText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.06em;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const LisChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.accent.gold};
  background: ${({ theme }) => theme.colors.accent.goldAlpha};
  border: 1px solid rgba(232,184,74,0.25);
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 3px 10px;
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $enabled, theme }) =>
    $enabled ? theme.colors.accent.emeraldAlpha : 'rgba(255,255,255,0.05)'};
  color: ${({ $enabled, theme }) =>
    $enabled ? theme.colors.accent.emerald : theme.colors.text.muted};
  border: 1px solid ${({ $enabled }) =>
    $enabled ? 'rgba(74,173,106,0.3)' : 'transparent'};
`;

const CodeDate = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ToggleBtn = styled.button`
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  border: 1px solid ${({ $enabled, theme }) =>
    $enabled ? 'rgba(196,64,64,0.4)' : 'rgba(74,173,106,0.4)'};
  color: ${({ $enabled, theme }) =>
    $enabled ? theme.colors.accent.rose : theme.colors.accent.emerald};
  background: ${({ $enabled }) =>
    $enabled ? 'rgba(196,64,64,0.08)' : 'rgba(74,173,106,0.08)'};

  &:hover:not(:disabled) {
    background: ${({ $enabled }) =>
      $enabled ? 'rgba(196,64,64,0.18)' : 'rgba(74,173,106,0.18)'};
  }

  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const SectionDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  margin: 28px 0 24px;
`;

/* â”€â”€â”€ Codes section component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function CodesSection() {
  const [codes, setCodes]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [newCode, setNewCode]       = useState('');
  const [lisAmount, setLisAmount]   = useState('10');
  const [creating, setCreating]     = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createDone, setCreateDone] = useState(false);
  const [toggling, setToggling]     = useState(null);

  useEffect(() => {
    fetchCodes()
      .then(data => { setCodes(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newCode.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createCode({ code: newCode.trim(), lis_amount: parseInt(lisAmount) || 10 });
      setCodes(prev => [created, ...prev]);
      setNewCode('');
      setLisAmount('10');
      setCreateDone(true);
      setTimeout(() => setCreateDone(false), 4000);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(code) {
    setToggling(code.id);
    try {
      const updated = await toggleCode(code.id);
      setCodes(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch {
      // silently ignore â€” state stays as-is
    } finally {
      setToggling(null);
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <FormCard>
      <FormTitle>Redeem Codes</FormTitle>
      <FormSubtitle>Create and manage promo codes that award Lis to players.</FormSubtitle>

      {/* Create new code form */}
      <form onSubmit={handleCreate}>
        <FieldGroup>
          <DateRow>
            <Field>
              <Label>Code</Label>
              <Input
                type="text"
                placeholder="e.g. SUMMER26"
                value={newCode}
                onChange={e => setNewCode(e.target.value.toUpperCase())}
                maxLength={32}
                style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}
              />
            </Field>
            <Field>
              <Label>Lis Reward</Label>
              <Input
                type="number"
                min="1"
                placeholder="10"
                value={lisAmount}
                onChange={e => setLisAmount(e.target.value)}
              />
            </Field>
          </DateRow>
        </FieldGroup>

        {createDone  && <SuccessBanner>âœ… Code created successfully!</SuccessBanner>}
        {createError && <ErrorBanner>âš ï¸ {createError}</ErrorBanner>}

        <ActionRow>
          <SubmitBtn type="submit" disabled={!newCode.trim() || creating}>
            {creating ? 'Creatingâ€¦' : 'Create Code'}
          </SubmitBtn>
        </ActionRow>
      </form>

      <SectionDivider />

      {/* Codes table */}
      {loading && <EmptyTickets>Loading codesâ€¦</EmptyTickets>}
      {!loading && error && <EmptyTickets>âš ï¸ {error}</EmptyTickets>}
      {!loading && !error && codes.length === 0 && (
        <EmptyTickets>No codes yet. Create one above.</EmptyTickets>
      )}

      {!loading && !error && codes.length > 0 && (
        <CodesTable>
          <CodesTableHead>
            <span>Code</span>
            <span>Lis</span>
            <span>Status</span>
            <span>Created</span>
            <span>Action</span>
          </CodesTableHead>
          {codes.map(c => (
            <CodeRow key={c.id}>
              <CodeText>{c.code}</CodeText>
              <LisChip>âœ¦ {c.lis_amount}</LisChip>
              <StatusPill $enabled={c.enabled}>
                {c.enabled ? 'â— Active' : 'â—‹ Disabled'}
              </StatusPill>
              <CodeDate>{formatDate(c.created_at)}</CodeDate>
              <ToggleBtn
                $enabled={c.enabled}
                onClick={() => handleToggle(c)}
                disabled={toggling === c.id}
              >
                {toggling === c.id ? 'â€¦' : c.enabled ? 'Disable' : 'Enable'}
              </ToggleBtn>
            </CodeRow>
          ))}
        </CodesTable>
      )}
    </FormCard>
  );
}

/* â”€â”€â”€ Sidebar items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SECTIONS = [
  { key: 'news',         label: 'ðŸ“° News' },
  { key: 'competitions', label: 'ðŸ† Competitions' },
  { key: 'support',      label: 'ðŸŽ§ Support' },
  { key: 'codes',        label: 'ðŸŽŸ Codes' },
];

/* â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState('news');

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.replace('/');
    }
  }, [loading, user, profile, router]);

  if (loading || !user || profile?.role !== 'admin') {
    return (
      <PageWrap>
        <Header />
        <Denied>ðŸ”’ Access restricted</Denied>
        <Footer />
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <Header />
      <Body>
        <Sidebar>
          <SidebarTitle>Admin</SidebarTitle>
          {SECTIONS.map(s => (
            <SidebarItem
              key={s.key}
              $active={section === s.key}
              onClick={() => setSection(s.key)}
            >
              {s.label}
            </SidebarItem>
          ))}
        </Sidebar>

        <Main>
          {section === 'news'         && <NewsForm />}
          {section === 'competitions' && <CompetitionsForm />}
          {section === 'support'      && <SupportSection />}
          {section === 'codes'        && <CodesSection />}
        </Main>
      </Body>
      <Footer />
    </PageWrap>
  );
}
