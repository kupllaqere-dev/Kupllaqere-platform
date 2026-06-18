'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageContainer } from '@/components/Layout';
import GlassCard from '@/components/ui/Card';
import { PrimaryButton, GhostButton } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthProvider';
import { createPost } from '@/lib/forumApi';

const CATEGORIES = [
  { label: 'General',       color: '#c87941' },
  { label: 'Tips & Guides', color: '#2aac8e' },
  { label: 'Events',        color: '#c44040' },
  { label: 'Trading',       color: '#e8b84a' },
  { label: 'Clans',         color: '#4aad6a' },
  { label: 'Help & Support',color: '#4aad6a' },
];

/* ─── Styled ──────────────────────────────────────────────────── */

const Wrapper = styled.div`
  min-height: 100vh;
`;

const Inner = styled.div`
  padding-top: ${({ theme }) => theme.spacing['8']};
  padding-bottom: ${({ theme }) => theme.spacing['16']};
  max-width: 760px;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: ${({ theme }) => theme.spacing['6']};
  transition: color ${({ theme }) => theme.transitions.fast};
  text-decoration: none;

  &:hover { color: ${({ theme }) => theme.colors.accent.violetLight}; }
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing['6']};

  span { color: ${({ theme }) => theme.colors.accent.violetLight}; }
`;

const FormCard = styled(GlassCard)`
  padding: ${({ theme }) => theme.spacing['6']};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['5']};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['2']};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.01em;
`;

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1.5px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  padding: ${({ theme }) => theme.spacing['3']};
  transition: border-color ${({ theme }) => theme.transitions.fast};
  box-sizing: border-box;

  &::placeholder { color: ${({ theme }) => theme.colors.text.muted}; }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.violet};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 180px;
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1.5px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  padding: ${({ theme }) => theme.spacing['3']};
  resize: vertical;
  transition: border-color ${({ theme }) => theme.transitions.fast};
  box-sizing: border-box;

  &::placeholder { color: ${({ theme }) => theme.colors.text.muted}; }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.violet};
  }
`;

const CategoryGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing['2']};
`;

const CategoryOption = styled.button`
  padding: 0.35rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px solid ${({ $active, $color, theme }) =>
    $active ? $color : theme.colors.border.default};
  background: ${({ $active, $color }) =>
    $active ? `${$color}22` : 'transparent'};
  color: ${({ $active, $color, theme }) =>
    $active ? $color : theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ $color }) => $color};
    color: ${({ $color }) => $color};
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing['3']};
  padding-top: ${({ theme }) => theme.spacing['2']};
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.accent.rose};
`;

const LoginPrompt = styled(GlassCard)`
  padding: ${({ theme }) => theme.spacing['8']};
  text-align: center;

  h3 {
    font-size: ${({ theme }) => theme.typography.sizes.xl};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing['2']};
  }

  p {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    margin-bottom: ${({ theme }) => theme.spacing['5']};
  }
`;

/* ─── Component ───────────────────────────────────────────────── */

export default function ForumNew() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const selectedCategory = CATEGORIES.find(c => c.label === category);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const post = await createPost({
        title: title.trim(),
        body:  body.trim(),
        category,
        category_color: selectedCategory?.color || '#c87941',
      });
      router.push(`/forums/${post.id}`);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setSubmitting(false);
    }
  }

  return (
    <Wrapper>
      <Header />
      <PageContainer>
        <Inner>
          <BackLink href="/forums">← Back to Forums</BackLink>
          <PageTitle>New <span>Thread</span></PageTitle>

          {!authLoading && !user ? (
            <LoginPrompt>
              <h3>Sign in to post</h3>
              <p>You need an account to create threads or reply to discussions.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <PrimaryButton as={Link} href="/login">Sign In</PrimaryButton>
                <GhostButton as={Link} href="/register">Register</GhostButton>
              </div>
            </LoginPrompt>
          ) : (
            <FormCard>
              <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
                <Field>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="What's your thread about?"
                    maxLength={200}
                    required
                  />
                </Field>

                <Field>
                  <Label>Category</Label>
                  <CategoryGrid>
                    {CATEGORIES.map(cat => (
                      <CategoryOption
                        key={cat.label}
                        type="button"
                        $active={category === cat.label}
                        $color={cat.color}
                        onClick={() => setCategory(cat.label)}
                      >
                        {cat.label}
                      </CategoryOption>
                    ))}
                  </CategoryGrid>
                </Field>

                <Field>
                  <Label htmlFor="body">Content</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Share your thoughts, questions, or tips with the community..."
                    maxLength={10000}
                    required
                  />
                </Field>

                {error && <ErrorText>{error}</ErrorText>}

                <FormActions>
                  <GhostButton type="button" as={Link} href="/forums">Cancel</GhostButton>
                  <PrimaryButton type="submit" disabled={submitting || !title.trim() || !body.trim()}>
                    {submitting ? 'Posting…' : 'Post Thread'}
                  </PrimaryButton>
                </FormActions>
              </form>
            </FormCard>
          )}
        </Inner>
      </PageContainer>
      <Footer />
    </Wrapper>
  );
}
