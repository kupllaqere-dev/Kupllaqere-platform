'use client';
import { ThemeProvider } from 'styled-components';
import StyledComponentsRegistry from '@/lib/StyledComponentsRegistry';
import GlobalStyles from '@/styles/GlobalStyles';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { CartProvider } from '@/features/cart/CartProvider';
import theme from '@/styles/theme';

export default function Providers({ children }) {
  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
