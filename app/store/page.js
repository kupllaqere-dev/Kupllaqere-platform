'use client';
import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/features/cart/CartProvider';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Page shell ────────────────────────────────────────────────── */
const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px 64px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 24px 16px 48px;
  }
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  display: flex;
  gap: 0;
  align-items: flex-start;
  overflow: hidden;
  min-height: 520px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    min-height: unset;
  }
`;

/* ─── Left nav ──────────────────────────────────────────────────── */
const Nav = styled.nav`
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.border.subtle};
  padding: 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-self: stretch;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
    padding: 12px 8px;
    flex-direction: row;
  }
`;

const NavLabel = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 8px 12px 4px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.border.accent : 'transparent'};
  background: ${({ $active, theme }) => $active ? theme.colors.accent.violetAlpha : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.text.accent : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ $active, theme }) => $active ? theme.typography.weights.semibold : theme.typography.weights.normal};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.accent.violetAlpha : theme.colors.bg.glassHover};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex: 1;
    justify-content: center;
  }
`;

const NavIcon = styled.span`
  font-size: 1rem;
  line-height: 1;
`;

/* ─── Cart section in nav ───────────────────────────────────────── */
const CartSection = styled.div`
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const CartDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.subtle};
  margin-bottom: 4px;
`;

const CartItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 160px;
  overflow-y: auto;
  padding: 0 4px;
`;

const CartItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.bg.elevated};
`;

const CartItemName = styled.span`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CartItemQty = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
`;

const CartRemoveBtn = styled.button`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.full};
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  font-size: 0.65rem;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.accent.rose};
    background: rgba(251, 113, 133, 0.1);
  }
`;

const CartEmptyText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  padding: 6px 12px;
  text-align: center;
  font-style: italic;
`;

const CheckoutBtn = styled.button`
  width: 100%;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ $empty, theme }) => $empty ? 'transparent' : theme.colors.accent.violetAlpha};
  border: 1px solid ${({ $empty, theme }) => $empty ? theme.colors.border.subtle : theme.colors.border.accent};
  color: ${({ $empty, theme }) => $empty ? theme.colors.text.muted : theme.colors.text.accent};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: ${({ $empty }) => $empty ? 'default' : 'pointer'};
  transition: all 0.2s;
  margin-top: 6px;
  text-align: center;

  &:hover {
    background: ${({ $empty, theme }) => !$empty && theme.colors.accent.violet};
    color: ${({ $empty }) => (!$empty ? '#fff' : undefined)};
  }
`;

const CheckoutSuccess = styled.div`
  width: 100%;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: ${({ theme }) => theme.colors.accent.emerald};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  text-align: center;
  margin-top: 6px;
  animation: ${fadeUp} 0.25s ease;
`;

/* ─── Content area ──────────────────────────────────────────────── */
const Content = styled.div`
  flex: 1;
  min-width: 0;
  padding: 28px 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 20px 16px;
  }
`;

const ContentHeader = styled.div`
  margin-bottom: 28px;
  animation: ${fadeUp} 0.3s ease;
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['4xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

/* ─── In-Game grid ──────────────────────────────────────────────── */
const ItemGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${fadeUp} 0.35s ease;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: ${({ $cols }) => `repeat(${$cols}, 1fr)`};
  gap: 16px;
`;

const ItemBox = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  cursor: pointer;
  animation: ${fadeUp} 0.35s ease both;
  animation-delay: ${({ $i }) => $i * 60}ms;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.accent};
    transform: translateY(-3px);
    box-shadow: 0 10px 36px rgba(139, 92, 246, 0.15);
  }
`;

const ItemImageArea = styled.div`
  height: 160px;
  background: ${({ theme }) => theme.colors.bg.elevated};
  background-image: ${({ theme }) => theme.colors.gradient.cardSubtle};
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

  img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    filter: drop-shadow(0 0 18px rgba(139, 92, 246, 0.5));
    transition: transform 0.2s;
  }

  ${ItemBox}:hover & img {
    transform: scale(1.08);
  }
`;

const ItemBody = styled.div`
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ItemName = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ItemDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.5;
`;

const ItemFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
`;

const ItemPrice = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  background: ${({ theme }) => theme.colors.gradient.brandText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const BuyBtn = styled.button`
  padding: 6px 16px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $added, theme }) => $added ? 'rgba(52, 211, 153, 0.15)' : theme.colors.accent.violetAlpha};
  border: 1px solid ${({ $added, theme }) => $added ? 'rgba(52, 211, 153, 0.4)' : theme.colors.border.accent};
  color: ${({ $added, theme }) => $added ? theme.colors.accent.emerald : theme.colors.text.accent};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  transition: all 0.2s;
  min-width: 64px;

  &:hover {
    background: ${({ $added, theme }) => $added ? 'rgba(52, 211, 153, 0.25)' : theme.colors.accent.violet};
    color: ${({ $added }) => $added ? undefined : '#fff'};
  }
`;

/* ─── Coming Soon ───────────────────────────────────────────────── */
const ComingSoonWrap = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  padding: 80px 40px;
  text-align: center;
  animation: ${fadeUp} 0.35s ease;
`;

const ComingSoonIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const ComingSoonTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes['3xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 10px;
`;

const ComingSoonText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  max-width: 360px;
  margin: 0 auto;
  line-height: 1.65;
`;

/* ─── Data ──────────────────────────────────────────────────────── */
const INGAME_ITEMS = [
  { id: 1, name: '100 Lis',  desc: 'A small pouch of Lis to get you started.',       price: 100  },
  { id: 2, name: '200 Lis',  desc: 'Double up your Lis balance in one go.',           price: 200  },
  { id: 3, name: '500 Lis',  desc: 'A solid stack of Lis for serious fashionistas.',  price: 500  },
  { id: 4, name: '1000 Lis', desc: 'Premium bundle — get the most out of FV.',       price: 1000 },
  { id: 5, name: '2000 Lis', desc: 'Ultimate Lis bundle for the true style icon.',   price: 2000 },
];

const SECTIONS = [
  { key: 'ingame',   label: 'In-Game',  icon: '🎮' },
  { key: 'platform', label: 'Platform', icon: '🌐' },
];

/* ─── Page ──────────────────────────────────────────────────────── */
export default function StorePage() {
  const [active, setActive] = useState('ingame');
  const [addedId, setAddedId] = useState(null);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const { cartItems, totalItems, addToCart, removeFromCart, checkout } = useCart();

  const subtitles = {
    ingame:   'Spend your FashionVerse Coins on exclusive in-game items.',
    platform: 'Platform perks and upgrades — coming soon.',
  };

  function handleBuy(item) {
    addToCart(item);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1000);
  }

  function handleCheckout() {
    if (checkout()) {
      setCheckoutDone(true);
      setTimeout(() => setCheckoutDone(false), 2500);
    }
  }

  return (
    <PageWrap>
      <Header />
      <Body>
        <Panel>
          <Nav>
            <NavLabel>Store</NavLabel>
            {SECTIONS.map(s => (
              <NavItem key={s.key} $active={active === s.key} onClick={() => setActive(s.key)}>
                <NavIcon>{s.icon}</NavIcon>
                {s.label}
              </NavItem>
            ))}

            <CartSection>
              <CartDivider />
              <NavLabel>
                Cart{totalItems > 0 ? ` (${totalItems})` : ''}
              </NavLabel>

              {cartItems.length === 0 ? (
                <CartEmptyText>Empty</CartEmptyText>
              ) : (
                <CartItemsList>
                  {cartItems.map(item => (
                    <CartItemRow key={item.id}>
                      <CartItemName>{item.name}</CartItemName>
                      {item.qty > 1 && <CartItemQty>×{item.qty}</CartItemQty>}
                      <CartRemoveBtn
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        ✕
                      </CartRemoveBtn>
                    </CartItemRow>
                  ))}
                </CartItemsList>
              )}

              {checkoutDone ? (
                <CheckoutSuccess>✓ Purchase complete!</CheckoutSuccess>
              ) : (
                <CheckoutBtn
                  $empty={cartItems.length === 0}
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  {cartItems.length === 0 ? 'Cart is empty' : 'Checkout'}
                </CheckoutBtn>
              )}
            </CartSection>
          </Nav>

          <Content>
            <ContentHeader>
              <PageTitle>Store</PageTitle>
              <PageSubtitle>{subtitles[active]}</PageSubtitle>
            </ContentHeader>

            {active === 'ingame' && (
              <ItemGrid>
                <ItemRow $cols={3}>
                  {INGAME_ITEMS.slice(0, 3).map((item, i) => (
                    <ItemBox key={item.id} $i={i}>
                      <ItemImageArea><img src="/Lis.png" alt="Lis" /></ItemImageArea>
                      <ItemBody>
                        <ItemName>{item.name}</ItemName>
                        <ItemDesc>{item.desc}</ItemDesc>
                        <ItemFooter>
                          <ItemPrice>{item.price}</ItemPrice>
                          <BuyBtn
                            $added={addedId === item.id}
                            onClick={() => handleBuy(item)}
                          >
                            {addedId === item.id ? 'Added ✓' : 'Buy'}
                          </BuyBtn>
                        </ItemFooter>
                      </ItemBody>
                    </ItemBox>
                  ))}
                </ItemRow>
                <ItemRow $cols={2}>
                  {INGAME_ITEMS.slice(3, 5).map((item, i) => (
                    <ItemBox key={item.id} $i={i + 3}>
                      <ItemImageArea><img src="/Lis.png" alt="Lis" /></ItemImageArea>
                      <ItemBody>
                        <ItemName>{item.name}</ItemName>
                        <ItemDesc>{item.desc}</ItemDesc>
                        <ItemFooter>
                          <ItemPrice>{item.price}</ItemPrice>
                          <BuyBtn
                            $added={addedId === item.id}
                            onClick={() => handleBuy(item)}
                          >
                            {addedId === item.id ? 'Added ✓' : 'Buy'}
                          </BuyBtn>
                        </ItemFooter>
                      </ItemBody>
                    </ItemBox>
                  ))}
                </ItemRow>
              </ItemGrid>
            )}

            {active === 'platform' && (
              <ComingSoonWrap>
                <ComingSoonIcon>🚧</ComingSoonIcon>
                <ComingSoonTitle>Coming Soon</ComingSoonTitle>
                <ComingSoonText>
                  Platform store items are on the way. Check back soon for exclusive perks, badges, and more.
                </ComingSoonText>
              </ComingSoonWrap>
            )}
          </Content>
        </Panel>
      </Body>
      <Footer />
    </PageWrap>
  );
}
