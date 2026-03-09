'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CheckCircle2, Package, Coins } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams?.get('type');
  const cost = searchParams?.get('cost');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('discord_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <main className="container mx-auto px-4 pt-48 pb-24 text-center">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 blur-[100px] rounded-full scale-150 animate-pulse" />
          <div className="relative bg-green-500/10 border border-green-500/30 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-12 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-green-400" />
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-6xl font-black uppercase tracking-tighter">
            Płatność <span className="text-green-400">Pomyślna!</span>
          </h1>
          <p className="text-xl text-white/60 leading-relaxed font-medium">
            Dziękujemy za zakup! Twoje zamówienie jest teraz przetwarzane.
            {type === 'cart' && cost && ` Wydano ${cost} tokenów.`}
            {type === 'cart' && !cost && " Twoje produkty zostaną wkrótce aktywowane na Twoim koncie."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl space-y-4">
            <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold">Moje Przedmioty</h3>
            <p className="text-white/40 text-sm">Twoje zakupione przedmioty pojawią się w ekwipunku w grze oraz w profilu.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl space-y-4">
            <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold">Saldo Tokenów</h3>
            <p className="text-white/40 text-sm">Nowe saldo zostanie zaktualizowane natychmiast po przetworzeniu płatności.</p>
          </div>
        </div>

        <div className="pt-12">
          <button 
            onClick={() => router.push('/sklep')}
            className="bg-white hover:bg-white/90 text-black font-black px-12 py-5 rounded-2xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            Wróć do sklepu
          </button>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-transparent text-white font-sans relative">
      {/* Background with same style as other pages */}
      <div className="fixed inset-0 z-0 bg-transparent">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
          style={{ backgroundImage: 'url(https://i.ibb.co/mCNVZdMn/osr-4.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-900/20 to-transparent" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-2xl font-black animate-pulse uppercase tracking-widest text-[#00ccff]">Ładowanie statusu...</div>
          </div>
        }>
          <SuccessContent />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}
