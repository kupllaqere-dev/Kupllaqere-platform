'use client';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { useState } from 'react';

/* ─── Animations ─────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Shell ───────────────────────────────────────────────────── */
const FooterWrapper = styled.footer`
  position: relative;
  margin-top: ${({ theme }) => theme.spacing['8']};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  background: linear-gradient(
    180deg,
    rgba(5, 5, 14, 0.6) 0%,
    rgba(5, 5, 14, 0.92) 12%,
    rgba(5, 5, 14, 0.98) 100%
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 640px;
    height: 1px;
    background: ${({ theme }) => theme.colors.gradient.brand};
    opacity: 0.5;
  }
`;

const FooterInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 56px 24px 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 40px 16px 0;
  }
`;

/* ─── Top grid ────────────────────────────────────────────────── */
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 1fr 1.1fr 1fr;
  gap: ${({ theme }) => theme.spacing['10']};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing['8']};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing['6']};
  }
`;

/* ─── Brand column ────────────────────────────────────────────── */
const BrandCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`;

const LogoRow = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  text-decoration: none;
`;

const LogoMark = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.gradient.brand};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  box-shadow: ${({ theme }) => theme.shadows.glow};
  flex-shrink: 0;
`;

const LogoText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  background: ${({ theme }) => theme.colors.gradient.brandText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.02em;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  max-width: 320px;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing['2']};
  margin-top: ${({ theme }) => theme.spacing['1']};
`;

const Tag = styled.span`
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  background: ${({ theme }) => theme.colors.bg.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.muted};
  letter-spacing: 0.04em;
`;

const OnlineBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.accent.emerald};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin-top: ${({ theme }) => theme.spacing['1']};
`;

const GreenDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent.emerald};
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.7);
  display: inline-block;
  flex-shrink: 0;
`;

/* ─── Generic link column ─────────────────────────────────────── */
const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`;

const ColTitle = styled.h4`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
`;

const ColTitleIcon = styled.span`
  font-size: 0.9rem;
`;

const LinkList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['3']};
`;

const FooterLink = styled(Link)`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: color ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent.violet};
    opacity: 0;
    flex-shrink: 0;
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.accent.violetLight};

    &::before {
      opacity: 1;
    }
  }
`;

/* ─── FAQ column ──────────────────────────────────────────────── */
const FaqList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['2']};
`;

const FaqItem = styled.div`
  border: 1px solid ${({ $open, theme }) =>
    $open ? theme.colors.border.accent : theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ $open, theme }) =>
    $open ? theme.colors.accent.violetAlpha : 'transparent'};
  transition: border-color ${({ theme }) => theme.transitions.normal},
              background   ${({ theme }) => theme.transitions.normal};
`;

const FaqQuestion = styled.button`
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing['2']};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ $open, theme }) =>
    $open ? theme.colors.accent.violetLight : theme.colors.text.secondary};
  cursor: pointer;
  background: transparent;
  border: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const FaqChevron = styled.span`
  font-size: 0.65rem;
  transition: transform ${({ theme }) => theme.transitions.normal};
  transform: ${({ $open }) => $open ? 'rotate(180deg)' : 'rotate(0deg)'};
  flex-shrink: 0;
  opacity: 0.6;
`;

const FaqAnswer = styled.div`
  padding: ${({ $open }) => $open ? '0 12px 10px' : '0 12px'};
  max-height: ${({ $open }) => $open ? '200px' : '0'};
  overflow: hidden;
  transition: max-height ${({ theme }) => theme.transitions.slow},
              padding     ${({ theme }) => theme.transitions.normal};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
`;

/* ─── Social column ───────────────────────────────────────────── */
const SocialGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['3']};
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: 9px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bg.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.normal};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.glassHover};
    border-color: ${({ $color }) => $color || 'rgba(139,92,246,0.4)'};
    transform: translateX(4px);
    box-shadow: -4px 0 16px ${({ $color }) => $color ? `${$color}33` : 'rgba(139,92,246,0.15)'};
  }
`;

const SocialIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
`;

const SocialInfo = styled.div``;

const SocialName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SocialHandle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 1px;
`;

/* ─── Bottom bar ──────────────────────────────────────────────── */
const BottomBar = styled.div`
  margin-top: 48px;
  padding: 20px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing['4']};
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px 16px;
  }
`;

const Copyright = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};

  a {
    color: ${({ theme }) => theme.colors.accent.violetLight};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const LegalLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['5']};
`;

const LegalLink = styled(Link)`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const MadeWith = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};

  span {
    color: ${({ theme }) => theme.colors.accent.rose};
  }
`;

/* ─── Data ────────────────────────────────────────────────────── */
const quickLinks = [
  { label: 'Home',          href: '/' },
  { label: 'News & Updates',href: '/news' },
  { label: 'Forums',        href: '/forums' },
  { label: 'Store',          href: '/store' },
  { label: 'Competitions',  href: '/competitions' },
  { label: 'Clan Hub',      href: '/clans' },
  { label: 'Leaderboards',  href: '/leaderboards' },
  { label: 'Shop',          href: '/shop' },
];

const faqs = [
  {
    q: 'Is FashionVerse free to play?',
    a: 'Yes — FashionVerse is completely free to play in your browser. Premium cosmetic items are available in the shop, but the full game experience requires no purchase.',
  },
  {
    q: 'How do I join a clan?',
    a: 'Head to the Clan Hub, browse open clans by style or rank, and hit "Request to Join." Clan leaders can also send you a direct invite through your profile.',
  },
  {
    q: 'What are FashionCoins?',
    a: 'FashionCoins are the in-game currency you earn through daily logins, events, and competitions. They can be spent in the shop on outfits, accessories, and room decorations.',
  },
  {
    q: 'How do competitions work?',
    a: 'Competitions open weekly with a theme. Submit your look before the deadline, then the community votes. Top 3 entries win exclusive limited-edition prizes.',
  },
  {
    q: 'Can I trade items with other players?',
    a: 'Yes — the Trading forum lets you post offers and negotiate with other players. Rare and seasonal items can only be obtained through trades once their event ends.',
  },
];

const socials = [
  {
    name: 'Discord',
    handle: 'discord.gg/fashionverse',
    icon: '💬',
    bg: 'linear-gradient(135deg, #5865f2, #7289da)',
    color: '#5865f2',
    href: '#',
  },
  {
    name: 'X / Twitter',
    handle: '@FashionVerseGame',
    icon: '✕',
    bg: 'linear-gradient(135deg, #1a1a1a, #333)',
    color: '#94a3b8',
    href: '#',
  },
  {
    name: 'TikTok',
    handle: '@fashionverse',
    icon: '▶',
    bg: 'linear-gradient(135deg, #010101, #69c9d0)',
    color: '#69c9d0',
    href: '#',
  },
  {
    name: 'Instagram',
    handle: '@fashionverse.game',
    icon: '📸',
    bg: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    color: '#fd1d1d',
    href: '#',
  },
  {
    name: 'YouTube',
    handle: 'FashionVerse Official',
    icon: '▶',
    bg: 'linear-gradient(135deg, #ff0000, #cc0000)',
    color: '#ff0000',
    href: '#',
  },
];

/* ─── Component ───────────────────────────────────────────────── */
export default function Footer() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (i) => setOpenFaq(prev => prev === i ? null : i);

  return (
    <FooterWrapper>
      <FooterInner>
        <Grid>
          {/* Brand */}
          <BrandCol>
            <LogoRow href="/">
              <LogoMark>✦</LogoMark>
              <LogoText>FashionVerse</LogoText>
            </LogoRow>

            <Description>
              FashionVerse is the ultimate browser-based multiplayer dress-up and
              social gaming community. Design stunning looks, compete in weekly
              fashion events, build your crew, and rise through the style
              rankings — all for free, right in your browser.
            </Description>

            <TagRow>
              <Tag>Free to Play</Tag>
              <Tag>Browser-Based</Tag>
              <Tag>18+ Servers</Tag>
              <Tag>Community-Driven</Tag>
            </TagRow>

            <OnlineBadge>
              <GreenDot />
              12,480 players online now
            </OnlineBadge>
          </BrandCol>

          {/* Quick Links */}
          <Col>
            <ColTitle>
              <ColTitleIcon>⚡</ColTitleIcon>
              Quick Links
            </ColTitle>
            <LinkList>
              {quickLinks.map(link => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </LinkList>
          </Col>

          {/* FAQ */}
          <Col>
            <ColTitle>
              <ColTitleIcon>❓</ColTitleIcon>
              FAQ
            </ColTitle>
            <FaqList>
              {faqs.map((faq, i) => (
                <FaqItem key={i} $open={openFaq === i}>
                  <FaqQuestion $open={openFaq === i} onClick={() => toggleFaq(i)}>
                    {faq.q}
                    <FaqChevron $open={openFaq === i}>▼</FaqChevron>
                  </FaqQuestion>
                  <FaqAnswer $open={openFaq === i}>{faq.a}</FaqAnswer>
                </FaqItem>
              ))}
            </FaqList>
          </Col>

          {/* Follow Us */}
          <Col>
            <ColTitle>
              <ColTitleIcon>🌐</ColTitleIcon>
              Follow Us
            </ColTitle>
            <SocialGrid>
              {socials.map(s => (
                <SocialLink key={s.name} href={s.href} $color={s.color} target="_blank" rel="noopener noreferrer">
                  <SocialIcon $bg={s.bg}>{s.icon}</SocialIcon>
                  <SocialInfo>
                    <SocialName>{s.name}</SocialName>
                    <SocialHandle>{s.handle}</SocialHandle>
                  </SocialInfo>
                </SocialLink>
              ))}
            </SocialGrid>
          </Col>
        </Grid>
      </FooterInner>

      {/* Bottom bar — outside FooterInner so it spans the full width container */}
      <BottomBar>
        <Copyright>
          © 2026 FashionVerse. All rights reserved. Built with{' '}
          <a href="#">Next.js</a> &amp; <a href="#">Styled Components</a>.
        </Copyright>
        <MadeWith>Made with <span>♥</span> for the community</MadeWith>
        <LegalLinks>
          <LegalLink href="/terms">Terms of Service</LegalLink>
          <LegalLink href="/privacy">Privacy Policy</LegalLink>
          <LegalLink href="/cookies">Cookie Policy</LegalLink>
          <LegalLink href="/contact">Contact</LegalLink>
        </LegalLinks>
      </BottomBar>
    </FooterWrapper>
  );
}
