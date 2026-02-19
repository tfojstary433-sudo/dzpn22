'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const type = searchParams.get('type');
  const cost = searchParams.get('cost');

  useEffect(() => {
    // Clear cart on success
    localStorage.removeItem('pff_cart');
    
    // Redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push('/sklep');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-transparent text-white font-inter relative overflow-hidden flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/10 rounded-3xl border border-white/10 p-12 backdrop-blur-2xl text-center shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Płatność Udana!
          </h1>
          
          <p className="text-white/60 text-lg mb-8 font-medium">
            Dziękujemy za zakup. Twoje przedmioty/tokeny zostaną dodane do Twojego konta w ciągu kilku minut.
          </p>

          <div className="space-y-4">
            <Link 
              href="/sklep"
              className="block w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase rounded-2xl transition-all border border-white/10"
            >
              Powrót do sklepu
            </Link>
            <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
              Automatyczne przekierowanie za 10 sekund...
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
