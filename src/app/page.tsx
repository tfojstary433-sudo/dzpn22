import { MainNavbar } from '@/components/main-navbar';
import { LandingHero } from '@/components/landing-hero';
import { Footer } from '@/components/footer';
import { CountyCupDraw } from '@/components/county-cup-draw';

export default function Home() {
  return (
    <main className="bg-black">
      <MainNavbar />
      <LandingHero />
      <Footer />
    </main>
  );
}
