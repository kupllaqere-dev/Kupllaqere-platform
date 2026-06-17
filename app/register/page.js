'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

const ErrorMsg = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.accent.rose};
  background: rgba(251, 113, 133, 0.08);
  border: 1px solid rgba(251, 113, 133, 0.2);
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.5rem 0.75rem;
  text-align: center;
`;

const SuccessMsg = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.accent.emerald};
  background: ${({ theme }) => theme.colors.accent.emeraldAlpha};
  border: 1px solid rgba(52, 211, 153, 0.25);
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.5rem 0.75rem;
  text-align: center;
`;

const Hint = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.subtle};
  margin: 0.5rem 0;
`;

const Footer = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: 1.5rem;

  a {
    color: ${({ theme }) => theme.colors.text.accent};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function RegisterPage() {
  const { signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email,            setEmail]           = useState('');
  const [platformUsername, setPlatformUsername] = useState('');
  const [password,         setPassword]         = useState('');
  const [confirm,          setConfirm]          = useState('');
  const [error,            setError]            = useState('');
  const [success,          setSuccess]          = useState('');
  const [submitting,       setSubmitting]       = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!USERNAME_RE.test(platformUsername.trim())) {
      setError('Username must be 3–20 characters: letters, numbers, and underscores only.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { data, error: err } = await signUpWithEmail(
      email.trim(),
      password,
      { platform_username: platformUsername.trim() },
    );
    setSubmitting(false);

    if (err) {
      setError(err.message || 'Could not create account.');
      return;
    }

    if (!data?.session) {
      setSuccess('Account created! Check your email to confirm before signing in.');
    } else {
      router.push('/');
    }
  }

  return (
    <>
      <Header />
      <Page>
        <Card>
          <Title>Create account</Title>
        <Subtitle>One account for the game and the community site.</Subtitle>

        <Form onSubmit={handleSubmit}>
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="platform_username">Platform username</Label>
            <Input
              id="platform_username"
              type="text"
              placeholder="StarGazer_42"
              autoComplete="username"
              value={platformUsername}
              onChange={e => setPlatformUsername(e.target.value)}
              maxLength={20}
              required
            />
            <Hint>3–20 characters. Letters, numbers, and underscores. This is your platform identity, separate from your in-game character name.</Hint>
          </Field>

          <Field>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Hint>At least 6 characters.</Hint>
          </Field>

          <Field>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </Field>

          {error   && <ErrorMsg>{error}</ErrorMsg>}
          {success && <SuccessMsg>{success}</SuccessMsg>}

          <Divider />

          <PrimaryButton type="submit" size="lg" disabled={submitting || !!success}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </PrimaryButton>
        </Form>

          <Footer>
            Already have an account?{' '}
            <Link href="/login">Sign in</Link>
          </Footer>
        </Card>
      </Page>
    </>
  );
}
