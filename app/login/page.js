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

export default function LoginPage() {
  const { signInWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: err } = await signInWithEmail(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Invalid email or password.');
    } else {
      router.push('/setup-username');
    }
  }

  return (
    <>
      <Header />
      <Page>
        <Card>
          <Title>Welcome back</Title>
          <Subtitle>Sign in with your Neclis World account — the same one you use in the game.</Subtitle>

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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </Field>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <Divider />

            <PrimaryButton type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </PrimaryButton>
          </Form>

          <Footer>
            Don&apos;t have an account?{' '}
            <Link href="/register">Create one</Link>
          </Footer>
        </Card>
      </Page>
    </>
  );
}
