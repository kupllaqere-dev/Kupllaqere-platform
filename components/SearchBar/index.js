'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import Avatar from '@/components/ui/Avatar';

const API = process.env.NEXT_PUBLIC_API_URL;

/* ─── Styles ─────────────────────────────────────────────────── */
const Wrap = styled.div`
  position: relative;
  flex-shrink: 0;
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
`;

const InputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.625rem;
  height: 34px;
  background: ${({ theme }) => theme.colors.bg.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.full};
  transition: border-color ${({ theme }) => theme.transitions.fast},
              background    ${({ theme }) => theme.transitions.fast},
              width         200ms ease;
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : '170px'};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.border.accent};
    background: ${({ theme }) => theme.colors.bg.glassHover};
    width: ${({ $fullWidth }) => $fullWidth ? '100%' : '230px'};
  }
`;


const Input = styled.input`
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const ClearBtn = styled.button`
  font-size: 0.6rem;
  color: ${({ theme }) => theme.colors.text.muted};
  flex-shrink: 0;
  line-height: 1;
  padding: 0;

  &:hover { color: ${({ theme }) => theme.colors.text.secondary}; }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 280px;
  background: rgba(12, 12, 24, 0.98);
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  padding: 0.375rem;
  z-index: 9999;

  @media (max-width: 480px) {
    min-width: 0;
    width: 100%;
  }
`;

const DropMsg = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  padding: 0.75rem 1rem;
  text-align: center;
  font-style: italic;
`;

const ResultItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: left;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.bg.glass};
  }
`;

const ResultText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`;

const ResultName = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultHandle = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

/* ─── Component ──────────────────────────────────────────────── */
export default function SearchBar({ fullWidth = false, onNavigate }) {
  const router   = useRouter();
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);
  const wrapRef  = useRef(null);
  const timerRef = useRef(null);

  const showDropdown = query.length >= 3;

  useEffect(() => {
    if (query.length < 3) { setResults([]); setLoading(false); setError(false); return; }
    setLoading(true);
    setError(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/platform/players/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) { setError(true); setResults([]); }
        else setResults(await res.json());
      } catch {
        setError(true);
        setResults([]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  useEffect(() => {
    if (!showDropdown) return;
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setQuery('');
        setResults([]);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showDropdown]);

  function handleNavigate(result) {
    const slug = result.platform_username || result.id;
    setQuery('');
    setResults([]);
    onNavigate?.();
    router.push(`/u/${slug}`);
  }

  return (
    <Wrap ref={wrapRef} $fullWidth={fullWidth}>
      <InputWrap $fullWidth={fullWidth}>
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search players…"
        />
        {query && (
          <ClearBtn onClick={() => { setQuery(''); setResults([]); }}>✕</ClearBtn>
        )}
      </InputWrap>

      {showDropdown && (
        <Dropdown>
          {loading ? (
            <DropMsg>Searching…</DropMsg>
          ) : error ? (
            <DropMsg>Could not reach server.</DropMsg>
          ) : results.length === 0 ? (
            <DropMsg>No players found.</DropMsg>
          ) : (
            results.map(r => (
              <ResultItem key={r.id} onClick={() => handleNavigate(r)}>
                <Avatar
                  src={null}
                  username={r.platform_username || r.name || '?'}
                  color="#c87941"
                  size="32px"
                  fontSize="0.7rem"
                />
                <ResultText>
                  <ResultName>{r.platform_username || r.name || 'Unknown'}</ResultName>
                  {r.name
                    ? <ResultHandle>@{r.name}</ResultHandle>
                    : <ResultHandle style={{ fontStyle: 'italic' }}>No character linked</ResultHandle>
                  }
                </ResultText>
              </ResultItem>
            ))
          )}
        </Dropdown>
      )}
    </Wrap>
  );
}
