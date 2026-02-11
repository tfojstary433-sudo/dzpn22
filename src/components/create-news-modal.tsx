'use client';

import { useState } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { saveNews } from '@/lib/firebase';

interface CreateNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateNewsModal({ isOpen, onClose, onSuccess }: CreateNewsModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'EKSTRAKLASA',
    image: '',
    description: '',
    content: '',
    author: 'Redakcja PFF'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await saveNews({
      ...formData,
      isVertical: false,
      date: new Date().toLocaleString('pl-PL', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    });

    setIsSubmitting(false);
    if (success) {
      setFormData({
        title: '',
        category: 'EKSTRAKLASA',
        image: '',
        description: '',
        content: '',
        author: 'Redakcja PFF'
      });
      onSuccess();
      onClose();
    } else {
      alert('Wystąpił błąd podczas zapisywania artykułu.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1117] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Dodaj Artykuł</h2>
            <p className="text-white/40 text-sm mt-1 uppercase font-bold tracking-widest">Panel Mediów PFF</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6 text-white/40" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Tytuł Artykułu</label>
              <input 
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Wprowadź tytuł..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Kategoria</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
              >
                <option value="EKSTRAKLASA">EKSTRAKLASA</option>
                <option value="TRANSFERY">TRANSFERY</option>
                <option value="WYNIKI">WYNIKI</option>
                <option value="OGŁOSZENIE">OGŁOSZENIE</option>
                <option value="WYWIAD">WYWIAD</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">URL Zdjęcia</label>
            <div className="relative">
              <input 
                required
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://i.ibb.co/..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <Upload className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Krótki Opis</label>
            <textarea 
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Krótki wstęp do artykułu..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Treść Artykułu</label>
            <textarea 
              required
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Pełna treść artykułu (możesz używać Enterów dla nowych akapitów)..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black uppercase italic tracking-widest py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 group"
            >
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {isSubmitting ? 'Publikowanie...' : 'Opublikuj Artykuł'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
