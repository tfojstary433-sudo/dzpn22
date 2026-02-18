'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { RobloxAvatar } from '@/components/roblox-avatar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const tokenPackages = [
  {
    id: 'pkg-small',
    type: 'tokens',
    name: 'BRĄZOWY PAKIET',
    logo: 'https://i.ibb.co/35CBs6hY/obraz-2026-01-22-144514080.png',
    regularTokens: 50,
    bonusTokens: 10,
    price: 25,
    pln: '25 zł',
  },
  {
    id: 'pkg-medium',
    type: 'tokens',
    name: 'SREBRNY PAKIET',
    logo: 'https://i.ibb.co/5hLZTwbG/obraz-2026-01-22-144537167.png',
    regularTokens: 80,
    bonusTokens: 20,
    price: 40,
    pln: '40 zł',
  },
  {
    id: 'pkg-large',
    type: 'tokens',
    name: 'ZŁOTY PAKIET',
    logo: 'https://i.ibb.co/Hp94m0x8/obraz-2026-01-22-144558424.png',
    regularTokens: 150,
    bonusTokens: 50,
    price: 75,
    pln: '75 zł',
  },
  {
    id: 'pkg-xlarge',
    type: 'tokens',
    name: 'DIAMENTOWY PAKIET',
    logo: 'https://i.ibb.co/twzxFRCs/obraz-2026-01-22-144623517.png',
    regularTokens: 200,
    bonusTokens: 100,
    price: 100,
    pln: '100 zł',
  },
];

const products = [
  {
    id: 'unprzerwa',
    type: 'product',
    name: 'UNPRZERWA',
    price: 10, // 10 Tokenów (~5 zł)
    pln: '10 Tokenów',
    description: 'Usuwa aktywną przerwę w grze.',
    category: 'unprzerwa',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
  {
    id: 'unwarn',
    type: 'product',
    name: 'UNWARN',
    price: 30, // 30 Tokenów (~15 zł)
    pln: '30 Tokenów',
    description: 'Usuwa ostrzeżenie z konta.',
    category: 'unwarn',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
  {
    id: 'szatnia-2',
    type: 'product',
    name: 'Szatnia Poziom II',
    price: 50, // 50 Tokenów (~25 zł)
    pln: '50 Tokenów',
    description: 'Odblokowuje szatnię na poziomie II dla Twojego klubu.',
    category: 'szatnia',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
  {
    id: 'stroje-dodatkowe',
    type: 'product',
    name: 'Dodatkowe Stroje',
    price: 16, // 16 Tokenów (~8 zł)
    pln: '16 Tokenów',
    description: 'Odblokowuje dodatkowe stroje dla Twojego klubu.',
    category: 'stroje',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
  {
    id: 'unban',
    type: 'pln-product',
    name: 'UNBAN',
    price: 70, // 70 PLN
    pln: '70 zł',
    description: 'Odblokowanie banowania z serwera.',
    category: 'unban',
    badge: 'PREMIUM',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
  {
    id: 'baner-klubowy',
    type: 'product',
    name: 'BANER KLUBOWY',
    price: 30, 
    pln: '30 Tokenów',
    description: 'Dodaj własny baner klubowy na ośrodku treningowym.',
    category: 'baner',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
  {
    id: 'wlasny-stadion',
    type: 'product',
    name: 'WŁASNY STADION',
    price: 240,
    pln: '240 Tokenów',
    description: 'Odblokowuje możliwość posiadania własnego stadionu.',
    category: 'stadion',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
];

const vipPackages = [];

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const normalToken = "https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png";
const successImages = [
  "https://i.ibb.co/35CBs6hY/obraz-2026-01-22-144514080.png",
  "https://i.ibb.co/5hLZTwbG/obraz-2026-01-22-144537167.png",
  "https://i.ibb.co/Hp94m0x8/obraz-2026-01-22-144558424.png",
  "https://i.ibb.co/twzxFRCs/obraz-2026-01-22-144623517.png"
];

function FallingTokens({ isSuccess }: { isSuccess: boolean }) {
  const [items, setItems] = useState<{ id: number; left: number; duration: number; delay: number; size: number; img: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newItem = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
        size: isSuccess ? 120 + Math.random() * 150 : 60 + Math.random() * 60,
        img: isSuccess ? successImages[Math.floor(Math.random() * successImages.length)] : normalToken
      };
      setItems(prev => [...prev.slice(-30), newItem]);
    }, isSuccess ? 100 : 400);

    return () => clearInterval(interval);
  }, [isSuccess]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {items.map(item => (
        <img
          key={item.id}
          src={item.img}
          alt=""
          className="absolute top-[-100px] opacity-40"
          style={{
            left: `${item.left}%`,
            width: `${item.size}px`,
            height: 'auto',
            animation: `fall ${item.duration}s linear ${item.delay}s forwards`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function SklepPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState({ balance: 0, items: {} });
  const [tab, setTab] = useState<'tokens' | 'products'>('tokens');
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<any | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [robloxUsername, setRobloxUsername] = useState<string>('');
  const [settingRoblox, setSettingRoblox] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('discord_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setRobloxUsername(userData.robloxUsername || '');

      fetch(`/api/user/tokens?id=${userData.id}`)
        .then(res => res.json())
        .then(data => {
          setBalance(data);
        })
        .catch(err => console.error('Error fetching tokens:', err));
    }

    const savedCart = localStorage.getItem('pff_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    if (!savedUser) {
      const clientId = "1448788697653973082";
      const redirectUri = encodeURIComponent("https://pff24.pl/callback");
      window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=identify+email+guilds+guilds.members.read&state=discord`;
    }
  }, []);

  const updateCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem('pff_cart', JSON.stringify(newCart));
  };

  const addToCart = (item: any) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      updateCart(cart.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i));
    } else {
      updateCart([...cart, { ...item, quantity: 1 }]);
    }
    setMessage({ type: 'success', text: 'Dodano do koszyka!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const removeFromCart = (id: string) => {
    updateCart(cart.filter(i => i.id !== id));
  };

  const handleCheckout = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Musisz być zalogowany, aby dokonać zakupu' });
      return;
    }

    if (cart.length === 0) return;

    setLoading(true);
    setMessage(null);

    const hasStripeItems = cart.some(item => item.type === 'tokens' || item.type === 'vip' || item.type === 'pln-product');

    if (hasStripeItems) {
      try {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            cart: cart,
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
    } else {
      const totalCost = cart.reduce((acc, i) => acc + (i.price * (i.quantity || 1)), 0);
      
      if (balance.balance < totalCost) {
        setMessage({ type: 'error', text: 'Niewystarczająca ilość tokenów' });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/user/tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            action: 'removeTokens',
            amount: totalCost,
            items: cart
          }),
        });
        const data = await res.json();
        
        if (data.error) {
          setMessage({ type: 'error', text: data.error });
        } else {
          setBalance(data);
          setMessage({ type: 'success', text: 'Zakup pomyślny!' });
          setPurchaseSuccess(true);
          setTimeout(() => setPurchaseSuccess(false), 5000);
          updateCart([]);
          setShowCart(false);
          window.open(`/sklep/sukces?type=cart&cost=${totalCost}`, '_blank');
        }
      } catch (err) {
        console.error('Purchase error:', err);
        setMessage({ type: 'error', text: 'Błąd podczas zakupu' });
      } finally {
        setLoading(false);
      }
    }
  };

  const saveRobloxUsername = async () => {
    if (!robloxUsername.trim()) return;

    setSettingRoblox(true);
    try {
      // Get Roblox ID from username
      const response = await fetch(`/api/roblox/avatar?username=${encodeURIComponent(robloxUsername.trim())}`);
      if (response.ok) {
        const data = await response.json();
        // Update user data
        const updatedUser = { ...user, robloxUsername: robloxUsername.trim(), robloxId: data.robloxId };
        localStorage.setItem('discord_user', JSON.stringify(updatedUser));
        localStorage.setItem('roblox_id', data.robloxId);
        setUser(updatedUser);
        setMessage({ type: 'success', text: 'Nazwa Roblox zapisana!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Nieprawidłowa nazwa użytkownika Roblox' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Błąd podczas zapisywania' });
      setTimeout(() => setMessage(null), 3000);
    }
    setSettingRoblox(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-inter relative overflow-hidden">
      <Navbar />
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-blue-600/20 blur-[180px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] pointer-events-none -z-10" />

      {/* Falling Tokens Animation */}
      <FallingTokens isSuccess={purchaseSuccess} />

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-2xl font-black uppercase tracking-tight">Twój Koszyk</h3>
              <button onClick={() => setShowCart(false)} className="text-white/40 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <img src={item.logo || item.image} alt="" className="w-16 h-16 object-contain" />
                  <div className="flex-1">
                    <h4 className="font-black uppercase text-sm">{item.name}</h4>
                    <p className="text-xs text-white/40">{item.description || (item.regularTokens ? `${item.regularTokens} tokenów` : '')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-400">{item.pln || `${item.price} Tokenów`}</p>
                    <div className="flex items-center gap-2 mt-2 justify-end">
                      <button 
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
                          } else {
                            removeFromCart(item.id);
                          }
                        }}
                        className="w-6 h-6 flex items-center justify-center bg-white/5 rounded-md hover:bg-white/10 border border-white/10"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateCart(cart.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i))}
                        className="w-6 h-6 flex items-center justify-center bg-white/5 rounded-md hover:bg-white/10 border border-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-12 text-white/20 font-bold uppercase">Koszyk jest pusty</div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase">Suma do zapłaty:</p>
                  <div className="flex flex-col">
                    {cart.some(i => i.type === 'tokens' || i.type === 'vip' || i.type === 'pln-product') && (
                      <p className="text-2xl font-black text-white">
                        {cart.filter(i => i.type === 'tokens' || i.type === 'vip' || i.type === 'pln-product').reduce((acc, i) => acc + (i.price * (i.quantity || 1)), 0).toFixed(2)} zł
                      </p>
                    )}
                    {cart.some(i => i.type === 'product') && (
                      <p className="text-2xl font-black text-[#00ccff]">
                        {cart.filter(i => i.type === 'product').reduce((acc, i) => acc + (i.price * (i.quantity || 1)), 0)} Tokenów
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className="px-10 py-4 bg-blue-400 hover:bg-blue-300 disabled:bg-white/10 text-black font-black uppercase rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(0,204,255,0.3)]"
                >
                  {loading ? 'PRZETWARZANIE...' : 'ZAPŁAĆ TERAZ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative py-12">
        <div className="container mx-auto px-4 relative z-10">
          {/* Centered Title Section */}
          <div className="mb-12 flex justify-center">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              SKLEP
            </h2>
          </div>

          <div className="max-w-4xl mx-auto bg-white/10 rounded-3xl border border-white/10 p-8 backdrop-blur-2xl text-center shadow-2xl">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 bg-gradient-to-r from-white via-blue-400 to-white bg-clip-text text-transparent">
              SKLEP PFF
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium">
              Zdobądź unikalne bonusy i ulepszenia dla swojego klubu korzystając z PFF Tokens.
            </p>
            
            <div className="mt-8 flex flex-col items-center gap-4">
              {user ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(0,204,255,0.1)]">
                    <div className="w-10 h-10 rounded-full border-2 border-[#00ccff] overflow-hidden">
                      <RobloxAvatar username={user.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white/40 uppercase">Zalogowany jako</p>
                      <p className="text-lg font-black text-white">{user.global_name || user.username}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(0,204,255,0.1)]">
                      <span className="text-sm font-bold text-white/40 uppercase">Twoje Tokeny:</span>
                      <div className="flex items-center gap-2">
                        <img src="https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png" alt="PFF Token" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-black text-[#00ccff]">{balance.balance}</span>
                      </div>
                    </div>

                    {/* Roblox Username */}
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(0,204,255,0.1)]">
                      <span className="text-sm font-bold text-white/40 uppercase">Roblox:</span>
                      <input
                        type="text"
                        value={robloxUsername}
                        onChange={(e) => setRobloxUsername(e.target.value)}
                        placeholder="Nazwa użytkownika"
                        className="bg-transparent text-white placeholder-white/40 outline-none border-none text-sm font-medium"
                      />
                      <button
                        onClick={saveRobloxUsername}
                        disabled={settingRoblox || !robloxUsername.trim()}
                        className="px-3 py-1 bg-[#00ccff] hover:bg-[#00ccff]/80 disabled:bg-white/20 text-black font-black text-xs uppercase rounded-lg transition-all"
                      >
                        {settingRoblox ? '...' : 'Zapisz'}
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      localStorage.removeItem('discord_user');
                      setUser(null);
                    }}
                    className="text-xs text-white/40 hover:text-white transition-colors uppercase font-bold"
                  >
                    Wyloguj się
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-[#00ccff] border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-white/40 font-black uppercase tracking-widest text-xs">Logowanie przez Discord...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {user && (
        <>
          {/* Message alert */}
          {message && (
            <div className={`mx-4 mt-4 p-4 rounded-2xl border ${message?.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
              {message?.text}
            </div>
          )}

          {/* Tabs */}
          <div className="sticky top-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-2">
                  <button
                    onClick={() => setTab('tokens')}
                    className={`px-6 py-4 uppercase font-black text-sm tracking-tight transition-all whitespace-nowrap ${tab === 'tokens' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/40 hover:text-white'}`}
                  >
                    Kup Tokeny
                  </button>
                  <button
                    onClick={() => setTab('products')}
                    className={`px-6 py-4 uppercase font-black text-sm tracking-tight transition-all whitespace-nowrap ${tab === 'products' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/40 hover:text-white'}`}
                  >
                    Produkty
                  </button>
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={() => setShowCart(true)}
                    className="relative p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                  >
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-blue-400 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {cart.length}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="py-20">
            <div className="container mx-auto px-4 relative z-10">
              <div className="space-y-12">
                {tab === 'tokens' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {tokenPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="group relative bg-white/10 border border-white/10 rounded-3xl p-6 hover:border-blue-400/50 transition-all duration-500 hover:translate-y-[-8px] flex flex-col backdrop-blur-2xl shadow-xl"
                        >
                          <div className="absolute -inset-1 bg-gradient-to-b from-blue-400/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                          <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-6 flex justify-center">
                              <img src={pkg.logo} alt={pkg.name} className="h-32 object-contain group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="mb-4">
                              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">
                                {pkg.name}
                              </h3>
                              <div className="flex flex-col gap-1 text-sm">
                                <p className="text-white/60">{pkg.regularTokens} Tokeny</p>
                                <p className="text-green-400 font-bold">+{pkg.bonusTokens} Bonus</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                              <span className="text-xl font-black text-blue-400">{pkg.pln}</span>

                              <button
                                onClick={() => addToCart({ ...pkg, type: 'tokens' })}
                                className="px-5 py-2.5 bg-blue-400 hover:bg-blue-300 text-black font-black text-sm uppercase rounded-xl transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,204,255,0.3)]"
                              >
                                DODAJ
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Custom Recharge */}
                    <div className="max-w-2xl mx-auto bg-white/10 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-xl">
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                        <img src="https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png" alt="" className="w-8 h-8" />
                        Doładuj dowolną ilość
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            placeholder="Wpisz ilość tokenów..."
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black focus:border-blue-400/50 transition-all outline-none"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-black">PFF</div>
                        </div>
                        <button
                          onClick={() => {
                            const amount = parseInt(customAmount);
                            if (amount > 0) {
                              addToCart({
                                id: 'custom-tokens',
                                type: 'tokens',
                                name: `Własna Ilość Tokenów (${amount})`,
                                price: amount * 0.5,
                                pln: `${(amount * 0.5).toFixed(2)} zł`,
                                regularTokens: amount,
                                bonusTokens: 0,
                                logo: "https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png"
                              });
                            }
                          }}
                          className="px-8 py-4 bg-gradient-to-r from-blue-400 to-blue-600 text-black font-black uppercase rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(0,204,255,0.3)]"
                        >
                          DODAJ DO KOSZYKA
                        </button>
                      </div>
                      {customAmount && !isNaN(parseInt(customAmount)) && (
                        <p className="mt-4 text-white/40 font-bold">
                          Koszt: <span className="text-white">{(parseInt(customAmount) * 0.5).toFixed(2)} zł</span>
                        </p>
                      )}
                    </div>
                  </>
                )}

                {tab === 'products' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="group relative bg-white/10 border border-white/10 rounded-3xl p-6 hover:border-blue-400/50 transition-all duration-500 hover:translate-y-[-8px] flex flex-col backdrop-blur-2xl shadow-xl"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-b from-blue-400/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex flex-col h-full">
                          <div 
                            className="cursor-pointer"
                            onClick={() => router.push(`/sklep/${product.id}`)}
                          >
                            <div className="mb-6 flex justify-center">
                              <img src={product.image} alt={product.name} className="h-32 object-contain group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="mb-4">
                              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-white/60 text-sm">{product.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                            <div className="flex items-center gap-1">
                              {product.type === 'pln-product' ? (
                                <span className="text-xl font-black text-blue-400">{product.pln}</span>
                              ) : (
                                <>
                                  <img src="https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png" alt="Token" className="w-4 h-4" />
                                  <span className="text-xl font-black text-blue-400">{product.price}</span>
                                </>
                              )}
                            </div>

                            <button
                              onClick={() => addToCart(product)}
                              className="px-5 py-2.5 bg-blue-400 hover:bg-blue-300 text-black font-black text-sm uppercase rounded-xl transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,204,255,0.3)]"
                            >
                              DODAJ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
