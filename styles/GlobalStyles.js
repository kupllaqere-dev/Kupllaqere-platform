'use client';
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    font-size: 16px;
  }

  body {
    background-color: ${({ theme }) => theme.colors.bg.root};
    background-image: url('/bg.png');
    background-attachment: fixed;
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily.base};
    font-weight: 600;
    line-height: ${({ theme }) => theme.typography.lineHeights.normal};
    min-height: 100dvh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.typography.fontFamily.display};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    letter-spacing: 0.03em;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    outline: none;
  }

  img {
    max-width: 100%;
    display: block;
  }

  ul, ol {
    list-style: none;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.bg.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(200, 121, 65, 0.38);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(200, 121, 65, 0.62);
  }

  ::selection {
    background: rgba(200, 121, 65, 0.30);
    color: #f5ece0;
  }
`;

export default GlobalStyles;
