'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/features/auth/AuthProvider';
import { PrimaryButton } from '@/components/ui/Button';
import Header from '@/components/Header';

const Page = styled.div`
  min-height: calc(100vh - 68px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  padding: 2.5rem;
  box-shadow: ${({ theme }) => theme.shadows.xl};
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['3xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.375rem;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: 0.625rem 0.875rem;
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  outline: none;
  transition: border-color ${({ theme }) => theme.transitions.fast},
              box-shadow    ${({ theme }) => theme.transitions.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.violet};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent.violetAlpha};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const Hint = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ErrorMsg = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.accent.rose};
  background: rgba(251, 113, 133, 0.08);
  border: 1px solid rgba(251, 113, 133, 0.2);
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.5rem 0.75rem;
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.subtle};
  margin: 0.25rem 0;
`;

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function SetupUsernamePage() {
  const { user, profile, loading, updatePlatformUsername } = useAuth();
  const router = useRouter();
  const [username,    setUsername]    = useState('');
  const [error,       setError]       = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    // Already has a platform username — skip straight to home
    if (profile?.platform_username) router.replace('/');
  }, [loading, user, profile, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!USERNAME_RE.test(username.trim())) {
      setError('Username must be 3–20 characters: letters, numbers, and underscores only.');
      return;
    }

    setSubmitting(true);
    const { error: err } = await updatePlatformUsername(username.trim());
    setSubmitting(false);

    if (err) {
      setError(err.message?.includes('unique') ? 'That username is already taken.' : (err.message || 'Could not save username.'));
      return;
    }

    router.push('/');
  }

  // Show nothing while redirecting (profile already has username)
  if (loading || !user || profile?.platform_username) {
    return null;
  }

  return (
    <>
      <Header />
      <Page>
        <Card>
          <Title>Pick a username</Title>
          <Subtitle>
            Your game account is linked. Now choose a username for the FashionVerse platform — this is separate from your in-game character name.
          </Subtitle>

          <Form onSubmit={handleSubmit}>
            <Field>
              <Label htmlFor="username">Platform username</Label>
              <Input
                id="username"
                type="text"
                placeholder="StarGazer_42"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={20}
                required
              />
              <Hint>3–20 characters. Letters, numbers, and underscores.</Hint>
            </Field>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <Divider />

            <PrimaryButton type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Saving…' : 'Continue'}
            </PrimaryButton>
          </Form>
        </Card>
      </Page>
    </>
  );
}
