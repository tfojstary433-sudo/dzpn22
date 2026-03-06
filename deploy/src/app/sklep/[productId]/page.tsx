'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const productDetails: { [key: string]: any } = {
  'unprzerwa': {
    name: 'UNPRZERWA',
    description: 'Usuwa aktywną przerwę w grze',
    type: 'quantity',
    pricePerUnit: 10,
    minQuantity: 1,
    maxQuantity: 100,
  },
  'unwarn': {
    name: 'UNWARN',
    description: 'Usuwa ostrzeżenie z konta',
    type: 'quantity',
    pricePerUnit: 30,
    minQuantity: 1,
    maxQuantity: 100,
  },
  'szatnia-2': {
    name: 'Szatnia Poziom II',
    description: 'Odblokowuje szatnię na poziomie II dla Twojego klubu',
    type: 'fixed',
    price: 50,
  },
  'stroje-dodatkowe': {
    name: 'Dodatkowe Stroje',
    description: 'Odblokowuje dodatkowe stroje dla Twojego klubu',
    type: 'fixed',
    price: 15,
  },
  'vip-trial-1': {
    name: 'VIP Trial I (7 dni)',
    description: 'Subskrypcja VIP na 7 dni + 10 bonus tokenów',
    type: 'fixed',
    price: '15,99 zł',
    currency: 'pln',
  },
  'vip-trial-2': {
    name: 'VIP Trial II (14 dni)',
    description: 'Subskrypcja VIP na 14 dni + 15 bonus tokenów',
    type: 'fixed',
    price: '22,50 zł',
    currency: 'pln',
  },
  'unban': {
    name: 'UNBAN',
    description: 'Odblokowanie banowania z serwera',
    type: 'fixed',
    price: '50 zł',
    currency: 'pln',
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

  const totalPrice = product.type === 'quantity' ? product.pricePerUnit * quantity : product.price;
  const isPLN = product.currency === 'pln';

  const handlePurchase = () => {
    setLoading(true);
    setMessage(null);

    if (isPLN) {
      setMessage({ type: 'error', text: 'Płatności w PLN wymagają odrębnego systemu płatności' });
      setLoading(false);
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <div className="relative py-12 overflow-hidden bg-gradient-to-b from-[#003087] to-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => router.push('/sklep')}
            className="text-white/40 hover:text-white transition-colors uppercase font-black mb-8"
          >
            ← Powrót do sklepu
          </button>

          <div className="max-w-3xl">
            <h1 className="text-5xl font-black uppercase mb-4 bg-gradient-to-r from-white via-[#00ccff] to-white bg-clip-text text-transparent">
              {product.name}
            </h1>
            <p className="text-white/60 text-lg">{product.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="max-w-2xl">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
              <span className="text-white/40 uppercase font-bold">Twoje tokeny:</span>
              <div className="flex items-center gap-2">
                <img src="https://i.ibb.co/355TzsFG/ssss.png" alt="Token" className="w-6 h-6" />
                <span className="text-2xl font-black text-[#00ccff]">{balance}</span>
              </div>
            </div>

            {product.type === 'quantity' && (
              <div className="mb-8">
                <label className="block text-white/40 uppercase font-bold mb-4">Ilość (1-{product.maxQuantity})</label>
                <input
                  type="number"
                  min={product.minQuantity}
                  max={product.maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.minQuantity, Math.min(product.maxQuantity, parseInt(e.target.value) || 1)))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white font-black text-2xl text-center focus:outline-none focus:border-[#00ccff]"
                />
              </div>
            )}

            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <span className="text-white/40 uppercase font-bold">Do zapłaty:</span>
                <div className="flex items-center gap-3">
                  {!isPLN && <img src="https://i.ibb.co/355TzsFG/ssss.png" alt="Token" className="w-6 h-6" />}
                  <span className="text-3xl font-black text-[#00ccff]">
                    {isPLN ? totalPrice : totalPrice}
                  </span>
                  {isPLN && <span className="text-sm font-bold">zł</span>}
                </div>
              </div>
            </div>
          </div>

          {!isPLN && balance < totalPrice && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 mb-8 text-red-400 font-bold">
              Niewystarczająca ilość tokenów!
            </div>
          )}

          <button
            onClick={() => setConfirmModal(true)}
            disabled={loading || (!isPLN && balance < totalPrice)}
            className="w-full bg-[#00ccff] hover:bg-[#00ccff]/80 disabled:bg-white/20 text-black font-black py-4 rounded-2xl uppercase text-lg transition-all"
          >
            {loading ? 'Przetwarzanie...' : 'Kup teraz'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#00ccff]/30 rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-black uppercase mb-4 text-[#00ccff]">Potwierdzenie Zakupu</h2>
            
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-6">
              <p className="text-white/40 text-sm uppercase font-bold mb-2">Produkt</p>
              <p className="text-2xl font-black text-white mb-2">{product.name}</p>
              {product.type === 'quantity' && <p className="text-white/60">Ilość: {quantity}</p>}
              
              <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                <span className="text-white/40 uppercase font-bold">Koszt:</span>
                <div className="flex items-center gap-2">
                  {!isPLN && <img src="https://i.ibb.co/355TzsFG/ssss.png" alt="Token" className="w-5 h-5" />}
                  <span className="text-2xl font-black text-[#00ccff]">
                    {isPLN ? totalPrice : totalPrice}
                  </span>
                  {isPLN && <span className="text-sm font-bold">zł</span>}
                </div>
              </div>

              {!isPLN && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                  <span className="text-white/40 uppercase font-bold">Posiadasz:</span>
                  <span className="text-xl font-black text-[#00ff88]">{balance}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1 bg-[#00ccff] hover:bg-[#00ccff]/80 disabled:bg-white/20 text-black font-black py-3 rounded-2xl uppercase transition-all"
              >
                {loading ? '...' : 'Potwierdź'}
              </button>
              <button
                onClick={() => setConfirmModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black py-3 rounded-2xl uppercase transition-all"
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
