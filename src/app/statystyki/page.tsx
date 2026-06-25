import { MainNavbar } from '@/components/main-navbar';
import { Statistics } from '@/components/statistics';
import { Footer } from '@/components/footer';
import Image from 'next/image';

export default function StatystykiPage() {
  return (
    <main className="bg-[#020617] min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <MainNavbar />
      
      {/* Background Section */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png"
          alt="Stadium Background"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        
        {/* Blue/Red Splashes based on new logo */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-32">
        <main className="container mx-auto px-4 pb-16">
          <Statistics />
        </main>
      </div>
      <Footer />
    </main>
  );
}
