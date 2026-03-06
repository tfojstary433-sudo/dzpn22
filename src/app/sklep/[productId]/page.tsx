'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const productDetails: { [key: string]: any } = {
  'unprzerwa': {
    name: 'UNPRZERWA',
    description: 'Usuwa aktywną przerwę w grze, pozwalając Ci na natychmiastowy powrót do rozgrywki bez zbędnego oczekiwania.',
    howToClaim: 'Po zakupie, przerwa zostanie automatycznie usunięta z Twojego konta w grze. Jeśli tak się nie stanie, zrestartuj grę.',
    type: 'quantity',
    pricePerUnit: 10,
    minQuantity: 1,
    maxQuantity: 100,
    images: [
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png',
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png',
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
    ]
  },
  'unwarn': {
    name: 'UNWARN',
    description: 'Usuwa ostrzeżenie z konta, przywracając Twoją reputację do czystego stanu.',
    howToClaim: 'Ostrzeżenie zostanie usunięte automatycznie w ciągu 5 minut od zakupu.',
    type: 'quantity',
    pricePerUnit: 30,
    minQuantity: 1,
    maxQuantity: 100,
    images: [
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png',
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
    ]
  },
  'szatnia-2': {
    name: 'Szatnia Poziom II',
    description: 'Odblokowuje luksusową szatnię na poziomie II dla Twojego klubu, oferującą więcej miejsca i lepsze udogodnienia.',
    howToClaim: 'Lider klubu musi wejść do panelu zarządzania klubem w grze, aby aktywować nową szatnię.',
    type: 'fixed',
    price: 50,
    images: [
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png',
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
    ]
  },
  'stroje-dodatkowe': {
    name: 'Dodatkowe Stroje',
    description: 'Odblokowuje zestaw unikalnych strojów dla Twojego klubu, pozwalając na lepszą personalizację drużyny.',
    howToClaim: 'Nowe stroje będą dostępne w edytorze strojów Twojego klubu zaraz po zakupie.',
    type: 'fixed',
    price: 16,
    images: [
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png',
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
    ]
  },
  'unban': {
    name: 'UNBAN',
    description: 'Zdejmuje blokadę konta (ban) z serwerów gry, umożliwiając ponowne dołączenie do społeczności.',
    howToClaim: 'Blokada zostanie zdjęta automatycznie po sfinalizowaniu płatności.',
    type: 'fixed',
    price: 70,
    currency: 'pln',
    images: [
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png',
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
    ]
  },
  'baner-klubowy': {
    name: 'BANER KLUBOWY',
    description: 'Dodaj własny baner klubowy na ośrodku treningowym, aby zaznaczyć obecność swojej drużyny.',
    howToClaim: 'Prześlij grafikę baneru poprzez formularz w panelu klubu po dokonaniu zakupu.',
    type: 'fixed',
    price: 30,
    images: [
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png',
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
    ]
  },
  'wlasny-stadion': {
    name: 'WŁASNY STADION',
    description: 'Odblokowuje możliwość posiadania i personalizacji własnego stadionu piłkarskiego.',
    howToClaim: 'Skontaktuj się z administracją poprzez Discord po zakupie, aby rozpocząć proces budowy stadionu.',
    type: 'fixed',
    price: 240,
    images: [
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png',
      'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
    ]
  },
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId as string;
  const product = productDetails[productId];

  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [confirmModal, setConfirmModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('discord_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      fetch(`/api/user/tokens?id=${userData.id}`)
        .then(res => res.json())
        .then(data => {
          setBalance(data.balance || 0);
        })
        .catch(err => console.error('Error fetching tokens:', err));
    }
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-4">Produkt nie znaleziony</h1>
          <button 
            onClick={() => router.push('/sklep')}
            className="bg-[#00ccff] hover:bg-[#00ccff]/80 text-black font-black px-8 py-3 rounded-xl uppercase"
          >
            Wróć do sklepu
          </button>
        </div>
      </div>
    );
  }

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const totalPrice = product.type === 'quantity' ? product.pricePerUnit * quantity : product.price;
  const isPLN = product.currency === 'pln';

  const handlePurchase = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Musisz być zalogowany, aby dokonać zakupu' });
      return;
    }

    setLoading(true);
    setMessage(null);

    if (isPLN) {
      try {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            cart: [{
              id: productId,
              name: product.name,
              description: product.description,
              image: product.images[0],
              price: totalPrice,
              quantity: quantity,
              type: 'pln-product'
            }],
            customerEmail: user.email,
          }),
        });

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setMessage({ type: 'error', text: data.error || 'Błąd podczas tworzenia płatności' });
        }
      } catch (error) {
        console.error('Checkout error:', error);
        setMessage({ type: 'error', text: 'Błąd podczas połączenia z serwerem płatności' });
      } finally {
        setLoading(false);
      }
      return;
    }

    fetch('/api/user/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        action: 'purchase',
        itemId: productId,
        amount: totalPrice,
        quantity,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMessage({ type: 'error', text: data.error });
        } else {
          setBalance(data.balance);
          setMessage({ type: 'success', text: `Zakupiono ${product.name}!` });
          setTimeout(() => router.push('/sklep'), 2000);
        }
      })
      .catch(err => {
        console.error('Purchase error:', err);
        setMessage({ type: 'error', text: 'Błąd podczas zakupu' });
      })
      .finally(() => {
        setLoading(false);
        setConfirmModal(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-24">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/sklep')}
          className="group flex items-center gap-2 text-white/40 hover:text-[#00ccff] transition-all uppercase font-black mb-12 text-sm tracking-widest"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          Powrót do sklepu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Media & Description */}
          <div className="lg:col-span-7 space-y-12">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-12 backdrop-blur-3xl overflow-hidden group">
                <img 
                  src={product.images[activeImage]} 
                  alt={product.name} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-24 h-24 rounded-2xl border-2 transition-all overflow-hidden flex-shrink-0 ${
                        activeImage === idx ? 'border-[#00ccff] scale-95' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="space-y-8">
              <div>
                <h1 className="text-6xl font-black uppercase mb-6 leading-none tracking-tighter">
                  {product.name}
                </h1>
                <div className="h-1 w-24 bg-[#00ccff] rounded-full"></div>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-[#00ccff] uppercase font-black tracking-widest text-sm mb-4">Opis Produktu</h3>
                <p className="text-xl text-white/70 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              {product.howToClaim && (
                <div className="space-y-8">
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-24 h-24 text-[#00ccff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-[#00ccff] uppercase font-black tracking-widest text-sm mb-4">Jak odebrać?</h3>
                    <p className="text-lg text-white/80 leading-relaxed relative z-10">
                      {product.howToClaim}
                    </p>
                  </div>

                  {/* Banner Carousel Section */}
                  <div className="relative aspect-[21/9] rounded-[2rem] overflow-hidden border border-white/10 group">
                    {/* Background with blur to match 'Start' style */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110"
                      style={{ backgroundImage: `url(${product.images[currentBannerIndex]})` }}
                    />
                    
                    {/* Content Layer */}
                    <div className="relative h-full w-full backdrop-blur-md bg-black/20 flex items-center justify-center p-8">
                      <img 
                        src={product.images[currentBannerIndex]} 
                        alt={`${product.name} banner ${currentBannerIndex + 1}`} 
                        className="h-full w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Navigation Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button 
                          onClick={prevBanner}
                          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button 
                          onClick={nextBanner}
                          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Dots indicator */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {product.images.map((_: any, idx: number) => (
                        <div 
                          key={idx}
                          className={`h-1.5 transition-all duration-300 rounded-full ${
                            currentBannerIndex === idx ? 'w-8 bg-[#00ccff]' : 'w-2 bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl">
                {/* Balance Info */}
                <div className="flex items-center justify-between mb-10 p-6 bg-black/40 rounded-3xl border border-white/5">
                  <span className="text-white/40 uppercase font-bold text-sm tracking-widest">Twoje saldo</span>
                  <div className="flex items-center gap-3">
                    <img src="https://i.ibb.co/355TzsFG/ssss.png" alt="Token" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(0,204,255,0.5)]" />
                    <span className="text-3xl font-black text-[#00ccff]">{balance}</span>
                  </div>
                </div>

                {message && (
                  <div className={`mb-8 p-6 rounded-2xl border animate-in fade-in slide-in-from-top-4 duration-500 ${
                    message.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <p className="font-bold flex items-center gap-2">
                      {message.type === 'success' ? '✓' : '✕'} {message.text}
                    </p>
                  </div>
                )}

                {/* Purchase Form */}
                <div className="space-y-8">
                  {product.type === 'quantity' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-white/40 uppercase font-black text-xs tracking-[0.2em]">Wybierz ilość</label>
                        <span className="text-[#00ccff] font-black">{quantity} / {product.maxQuantity}</span>
                      </div>
                      <div className="relative group">
                        <input
                          type="number"
                          min={product.minQuantity}
                          max={product.maxQuantity}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(product.minQuantity, Math.min(product.maxQuantity, parseInt(e.target.value) || 1)))}
                          className="w-full bg-black/60 border-2 border-white/10 rounded-2xl px-8 py-5 text-white font-black text-3xl focus:outline-none focus:border-[#00ccff] transition-all appearance-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                          <button onClick={() => setQuantity(q => Math.min(product.maxQuantity, q + 1))} className="text-white/20 hover:text-[#00ccff]">▲</button>
                          <button onClick={() => setQuantity(q => Math.max(product.minQuantity, q - 1))} className="text-white/20 hover:text-[#00ccff]">▼</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-8 bg-gradient-to-br from-[#00ccff]/10 to-transparent border border-[#00ccff]/20 rounded-3xl">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-white/40 uppercase font-black text-xs tracking-widest block">Suma do zapłaty</span>
                        <div className="flex items-center gap-3">
                          {!isPLN && <img src="https://i.ibb.co/355TzsFG/ssss.png" alt="Token" className="w-8 h-8" />}
                          <span className="text-5xl font-black text-white">
                            {totalPrice}
                          </span>
                          {isPLN && <span className="text-xl font-bold text-white/60">PLN</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isPLN && balance < totalPrice && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 font-bold text-center text-sm">
                      Brakuje Ci {totalPrice - balance} tokenów do tego zakupu
                    </div>
                  )}

                  <button
                    onClick={() => setConfirmModal(true)}
                    disabled={loading || (!isPLN && balance < totalPrice)}
                    className="group relative w-full overflow-hidden rounded-2xl p-[2px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00ccff_0%,#003087_50%,#00ccff_100%)]" />
                    <div className="relative flex h-full w-full items-center justify-center rounded-[14px] bg-[#0a0a0a] px-8 py-5 text-xl font-black uppercase tracking-widest text-[#00ccff] group-hover:bg-[#00ccff] group-hover:text-black transition-all">
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                          Przetwarzanie
                        </div>
                      ) : 'Kup teraz'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Trust Badge / Support */}
              <div className="p-6 text-center">
                <p className="text-white/30 text-sm font-medium">
                  Masz problem z zakupem? <br />
                  Skontaktuj się z nami na <a href="#" className="text-[#00ccff] hover:underline">Discordzie</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f0f0f] border border-[#00ccff]/30 rounded-[3rem] p-12 max-w-xl w-full shadow-[0_0_100px_rgba(0,204,255,0.1)]">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[#00ccff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#00ccff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-4xl font-black uppercase mb-2 tracking-tighter">Potwierdź zamówienie</h2>
              <p className="text-white/40 font-medium">Upewnij się, że wszystko się zgadza przed finalizacją.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] mb-10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/40 font-bold uppercase text-xs tracking-widest">Produkt</span>
                <span className="text-xl font-black text-white">{product.name}</span>
              </div>
              {product.type === 'quantity' && (
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-bold uppercase text-xs tracking-widest">Ilość</span>
                  <span className="text-xl font-black text-[#00ccff]">{quantity}x</span>
                </div>
              )}
              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-white/40 font-bold uppercase text-xs tracking-widest">Całkowity koszt</span>
                <div className="flex items-center gap-2">
                  {!isPLN && <img src="https://i.ibb.co/355TzsFG/ssss.png" alt="Token" className="w-6 h-6" />}
                  <span className="text-3xl font-black text-[#00ccff]">
                    {totalPrice}
                  </span>
                  {isPLN && <span className="text-lg font-bold text-white/60">PLN</span>}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="flex-[2] bg-[#00ccff] hover:bg-[#00ccff]/80 disabled:bg-white/20 text-black font-black py-5 rounded-2xl uppercase text-lg transition-all"
              >
                {loading ? 'Finalizacja...' : 'Potwierdzam zakup'}
              </button>
              <button
                onClick={() => setConfirmModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-2xl uppercase transition-all"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
