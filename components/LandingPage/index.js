'use client';
import Header from '@/components/Header';
import NewsCarousel from '@/components/NewsCarousel';
import ForumPreview from '@/components/ForumPreview';
import Sidebar from '@/components/Sidebar';
import RewardsSection from '@/components/RewardsSection';
import Footer from '@/components/Footer';
import { PageContainer, ContentGrid } from '@/components/Layout';

export default function LandingPage() {
  return (
    <>
      <Header />
      <PageContainer>
        <NewsCarousel />
        <ContentGrid>
          <ForumPreview />
          <Sidebar />
        </ContentGrid>
        <RewardsSection />
      </PageContainer>
      <Footer />
    </>
  );
}
