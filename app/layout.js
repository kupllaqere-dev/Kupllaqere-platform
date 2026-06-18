import { Raleway, Cinzel } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'FashionVerse — Dress-Up & Social Gaming Community',
  description:
    'Join millions of players in the ultimate browser-based dress-up and social gaming experience. Design outfits, compete in events, join clans, and show off your style.',
  keywords: 'dress up game, fashion game, multiplayer, community, browser game',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${raleway.variable} ${cinzel.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
