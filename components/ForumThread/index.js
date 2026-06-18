'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styled from 'styled-components';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageContainer } from '@/components/Layout';
import GlassCard from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { PrimaryButton, GhostButton } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthProvider';
import { fetchThread, createReply } from '@/lib/forumApi';

const AVATAR_COLORS = ['#c87941','#2aac8e','#c44040','#e8b84a','#4aad6a','#4aad6a','#e09a58','#4ec9a8'];

function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function buildReplyTree(replies) {
  const byId = {};
  replies.forEach(r => { byId[r.id] = { ...r, children: [] }; });
  const roots = [];
  replies.forEach(r => {
    if (r.parent_reply_id && byId[r.parent_reply_id]) {
      byId[r.parent_reply_id].children.push(byId[r.id]);
    } else {
      roots.push(byId[r.id]);
    }
  });
  return roots;
}

/* ─── Styled ──────────────────────────────────────────────────── */

const Wrapper = styled.div`
  min-height: 100vh;
`;

const Inner = styled.div`
  padding-top: ${({ theme }) => theme.spacing['8']};
  padding-bottom: ${({ theme }) => theme.spacing['16']};
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

const PostCard = styled(GlassCard)`
  padding: ${({ theme }) => theme.spacing['6']};
  margin-bottom: ${({ theme }) => theme.spacing['6']};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: ${({ $color }) => $color || '#c87941'};
    border-radius: 3px 0 0 3px;
  }
`;

const PostCategoryRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`;

const PostTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeights.snug};
  margin-bottom: ${({ theme }) => theme.spacing['4']};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.typography.sizes.xl};
  }
`;

const PostAuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  margin-bottom: ${({ theme }) => theme.spacing['5']};
`;

const AuthorName = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MetaItem = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const PostBody = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  white-space: pre-wrap;
  word-break: break-word;
`;

const RepliesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  margin-bottom: ${({ theme }) => theme.spacing['4']};
`;

const RepliesTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ReplyCount = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  background: ${({ theme }) => theme.colors.bg.elevated};
  padding: 2px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const ReplyCard = styled(GlassCard)`
  padding: ${({ theme }) => theme.spacing['4']} ${({ theme }) => theme.spacing['5']};
  display: flex;
  gap: ${({ theme }) => theme.spacing['4']};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
    gap: ${({ theme }) => theme.spacing['3']};
  }
`;

const ReplyAvatarWrap = styled.div`
  flex-shrink: 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { display: none; }
`;

const ReplyContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ReplyAuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  margin-bottom: ${({ theme }) => theme.spacing['2']};
  flex-wrap: wrap;
`;

const ReplyAuthorName = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ReplyTime = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ReplyBody = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`;

const ReplyActionRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing['1']};
`;

const InlineReplyBtn = styled.button`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.muted};
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 0;
  transition: color ${({ theme }) => theme.transitions.fast};
  &:hover { color: ${({ theme }) => theme.colors.accent.violetLight}; }
`;

/* Wraps all children + inline form for a reply, adding the thread line */
const NestedGroup = styled.div`
  margin-top: ${({ theme }) => theme.spacing['2']};
  margin-left: 24px;
  padding-left: 20px;
  border-left: 2px solid ${({ theme }) => theme.colors.border.accent};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['2']};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-left: 10px;
    padding-left: 10px;
  }
`;

const ReplyThread = styled.div`
  display: flex;
  flex-direction: column;
`;

/* Inline reply form */
const InlineFormCard = styled(GlassCard)`
  padding: ${({ theme }) => theme.spacing['4']};
`;

const ReplyingToLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: ${({ theme }) => theme.spacing['2']};
  span { color: ${({ theme }) => theme.colors.accent.violetLight}; font-weight: 600; }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: ${({ $small }) => $small ? '72px' : '100px'};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1.5px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  padding: ${({ theme }) => theme.spacing['3']};
  resize: vertical;
  transition: border-color ${({ theme }) => theme.transitions.fast};
  box-sizing: border-box;
  &::placeholder { color: ${({ theme }) => theme.colors.text.muted}; }
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.accent.violet}; }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing['2']};
  margin-top: ${({ theme }) => theme.spacing['2']};
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.accent.rose};
  margin-top: ${({ theme }) => theme.spacing['2']};
`;

const BottomFormCard = styled(GlassCard)`
  padding: ${({ theme }) => theme.spacing['5']};
  margin-top: ${({ theme }) => theme.spacing['6']};
`;

const FormTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing['3']};
`;

const LoginPrompt = styled(GlassCard)`
  padding: ${({ theme }) => theme.spacing['5']};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  margin-top: ${({ theme }) => theme.spacing['6']};
  a {
    color: ${({ theme }) => theme.colors.accent.violetLight};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
  }
`;

const SkeletonBlock = styled.div`
  height: ${({ $h }) => $h || '80px'};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1.5px solid ${({ theme }) => theme.colors.border.default};
  margin-bottom: ${({ theme }) => theme.spacing['3']};
  animation: pulse 1.5s ease-in-out infinite;
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
`;

/* ── Inline form component ── */
function InlineReplyForm({ replyingToName, onSubmit, onCancel, submitting, error }) {
  const [text, setText] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await onSubmit(text.trim());
    setText('');
  }

  return (
    <InlineFormCard>
      <ReplyingToLabel>Replying to <span>@{replyingToName}</span></ReplyingToLabel>
      <form onSubmit={handleSubmit}>
        <Textarea
          $small
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write your reply…"
          maxLength={5000}
          autoFocus
        />
        {error && <ErrorText>{error}</ErrorText>}
        <FormActions>
          <GhostButton type="button" size="sm" onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton type="submit" size="sm" disabled={submitting || !text.trim()}>
            {submitting ? 'Posting…' : 'Reply'}
          </PrimaryButton>
        </FormActions>
      </form>
    </InlineFormCard>
  );
}

/* ─── Main component ──────────────────────────────────────────── */

export default function ForumThread() {
  const { id }   = useParams();
  const { user } = useAuth();

  const [post, setPost]         = useState(null);
  const [replies, setReplies]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [bottomText, setBottomText]             = useState('');
  const [bottomSubmitting, setBottomSubmitting] = useState(false);
  const [bottomError, setBottomError]           = useState('');

  const [activeInlineReply, setActiveInlineReply] = useState(null);
  const [inlineSubmitting, setInlineSubmitting]   = useState(false);
  const [inlineError, setInlineError]             = useState('');

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetchThread(id)
      .then(({ post, replies }) => { setPost(post); setReplies(replies); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBottomReply(e) {
    e.preventDefault();
    if (!bottomText.trim()) return;
    setBottomSubmitting(true);
    setBottomError('');
    try {
      const newReply = await createReply(id, bottomText.trim(), null);
      setReplies(prev => [...prev, newReply]);
      setPost(prev => ({ ...prev, reply_count: prev.reply_count + 1 }));
      setBottomText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setBottomError(err.message || 'Failed to post reply.');
    } finally {
      setBottomSubmitting(false);
    }
  }

  async function handleInlineReply(parentReplyId, text) {
    setInlineSubmitting(true);
    setInlineError('');
    try {
      const newReply = await createReply(id, text, parentReplyId);
      setReplies(prev => [...prev, { ...newReply, parent_reply_id: parentReplyId }]);
      setPost(prev => ({ ...prev, reply_count: prev.reply_count + 1 }));
      setActiveInlineReply(null);
    } catch (err) {
      setInlineError(err.message || 'Failed to post reply.');
    } finally {
      setInlineSubmitting(false);
    }
  }

  // Recursive render — no depth limit
  function renderReply(node) {
    const isReplying = activeInlineReply === node.id;
    const hasNested  = node.children.length > 0 || isReplying;

    return (
      <ReplyThread key={node.id}>
        <ReplyCard>
          <ReplyAvatarWrap>
            <Avatar
              username={node.author_name}
              color={avatarColor(node.author_name)}
              size="38px"
              fontSize="0.9rem"
            />
          </ReplyAvatarWrap>
          <ReplyContent>
            <ReplyAuthorRow>
              <ReplyAuthorName>{node.author_name}</ReplyAuthorName>
              <ReplyTime>{timeAgo(node.created_at)}</ReplyTime>
            </ReplyAuthorRow>
            <ReplyBody>{node.body}</ReplyBody>
            {user && (
              <ReplyActionRow>
                <InlineReplyBtn
                  onClick={() => setActiveInlineReply(isReplying ? null : node.id)}
                >
                  ↩ Reply
                </InlineReplyBtn>
              </ReplyActionRow>
            )}
          </ReplyContent>
        </ReplyCard>

        {hasNested && (
          <NestedGroup>
            {node.children.map(child => renderReply(child))}
            {isReplying && (
              <InlineReplyForm
                replyingToName={node.author_name}
                submitting={inlineSubmitting}
                error={inlineError}
                onSubmit={text => handleInlineReply(node.id, text)}
                onCancel={() => { setActiveInlineReply(null); setInlineError(''); }}
              />
            )}
          </NestedGroup>
        )}
      </ReplyThread>
    );
  }

  const tree = buildReplyTree(replies);

  return (
    <Wrapper>
      <Header />
      <PageContainer>
        <Inner>
          <BackLink href="/forums">← Back to Forums</BackLink>

          {loading ? (
            <>
              <SkeletonBlock $h="160px" />
              <SkeletonBlock $h="80px" />
              <SkeletonBlock $h="80px" />
            </>
          ) : notFound ? (
            <GlassCard style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8' }}>Thread not found.</p>
            </GlassCard>
          ) : post && (
            <>
              <PostCard $color={post.category_color}>
                <PostCategoryRow>
                  <Badge $color={post.category_color}>{post.category}</Badge>
                </PostCategoryRow>
                <PostTitle>{post.title}</PostTitle>
                <PostAuthorRow>
                  <Avatar
                    username={post.author_name}
                    color={avatarColor(post.author_name)}
                    size="40px"
                    fontSize="0.95rem"
                  />
                  <div>
                    <AuthorName>{post.author_name}</AuthorName>
                    <div><MetaItem>{timeAgo(post.created_at)}</MetaItem></div>
                  </div>
                </PostAuthorRow>
                <PostBody>{post.body}</PostBody>
              </PostCard>

              <RepliesHeader>
                <RepliesTitle>Replies</RepliesTitle>
                <ReplyCount>{replies.length}</ReplyCount>
              </RepliesHeader>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tree.map(node => renderReply(node))}
              </div>

              <div ref={bottomRef} />

              {user ? (
                <BottomFormCard>
                  <FormTitle>Post a Reply</FormTitle>
                  <form onSubmit={handleBottomReply}>
                    <Textarea
                      value={bottomText}
                      onChange={e => setBottomText(e.target.value)}
                      placeholder="Write your reply…"
                      maxLength={5000}
                    />
                    {bottomError && <ErrorText>{bottomError}</ErrorText>}
                    <FormActions>
                      <GhostButton type="button" size="sm" onClick={() => setBottomText('')}>
                        Clear
                      </GhostButton>
                      <PrimaryButton type="submit" size="sm" disabled={bottomSubmitting || !bottomText.trim()}>
                        {bottomSubmitting ? 'Posting…' : 'Post Reply'}
                      </PrimaryButton>
                    </FormActions>
                  </form>
                </BottomFormCard>
              ) : (
                <LoginPrompt>
                  <Link href="/login">Sign in</Link> to join the conversation.
                </LoginPrompt>
              )}
            </>
          )}
        </Inner>
      </PageContainer>
      <Footer />
    </Wrapper>
  );
}
