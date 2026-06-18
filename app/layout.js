import { Montserrat } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['600'],
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
    <html lang="en" className={montserrat.variable}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
