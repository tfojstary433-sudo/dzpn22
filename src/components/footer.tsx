import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, MessageSquare } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-transparent text-white font-sans border-t border-white/5">
      {/* Sponsors Bar */}
      <div className="bg-transparent py-4 overflow-hidden w-full border-b border-white/5">
        <div className="flex gap-16 items-center whitespace-nowrap animate-scroll" style={{ width: 'max-content' }}>
          {[...Array(12)].map((_, group) => (
            <div key={group} className="flex gap-16 items-center flex-shrink-0 px-8">
              <Image src="https://i.ibb.co/6709CW7Z/obraz-2026-06-13-132954945.png" alt="Biblioteka" width={100} height={60} className="h-12 w-auto object-contain" suppressHydrationWarning={true} />
              <Image src="https://i.ibb.co/Rkz8MRSy/IMG-4837.png" alt="Liga" width={100} height={60} className="h-12 w-auto object-contain" suppressHydrationWarning={true} />
              <Image src="https://i.ibb.co/x8fmmv9x/obraz-2026-06-13-133150563.png" alt="7U7" width={100} height={60} className="h-12 w-auto object-contain" suppressHydrationWarning={true} />
            </div>
          ))}
        </div>
      </div>

      <div className="py-16 relative overflow-hidden bg-transparent backdrop-blur-sm">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Logo & Description */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="h-20 w-48 relative">
                  <Image
                    src="https://i.ibb.co/Rkz8MRSy/IMG-4837.png"
                    alt="Liga Logo"
                    fill
                    className="object-contain object-left"
                  />
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-medium">
                Oficjalna strona Działdowskiej Ligi Piłki Nożnej. Dołącz do nas i twórz historię sportu w naszym regionie.
              </p>
            </div>

            {/* Mapa Strony */}
            <div>
              <h3 className="font-black text-sm mb-6 text-blue-500 uppercase tracking-widest">MAPA STRONY</h3>
              <ul className="space-y-4 text-sm">
                <li><Link href="/tabela" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full scale-0 group-hover:scale-100 transition-transform"></span>Tabela
                </Link></li>
                <li><Link href="/terminarz" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full scale-0 group-hover:scale-100 transition-transform"></span>Terminarz
                </Link></li>
                <li><Link href="/kluby" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full scale-0 group-hover:scale-100 transition-transform"></span>Kluby
                </Link></li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-black text-sm mb-6 text-blue-500 uppercase tracking-widest">SOCIAL MEDIA</h3>
              <div className="flex gap-4">
                <Link href="https://facebook.com/profile.php?id=61573191964716" target="_blank" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all hover:scale-110 group">
                  <Facebook className="w-6 h-6 text-gray-400 group-hover:text-white" />
                </Link>
                <Link href="https://instagram.com/dlpn_1liga/" target="_blank" className="text-gray-400 hover:text-white transition-colors w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-pink-600 transition-all hover:scale-110 group">
                  <Instagram className="w-6 h-6 group-hover:text-white" />
                </Link>
              </div>
            </div>

            {/* Contact Info (Extra) */}
            <div>
              <h3 className="font-black text-sm mb-6 text-blue-500 uppercase tracking-widest">KONTAKT</h3>
              <p className="text-gray-400 text-sm italic">
                Pytania? Napisz do nas przez social media lub skontaktuj się z administratorem ligi.
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] md:text-xs">
            <p className="text-gray-500 font-bold uppercase tracking-widest">
              2026 © DZIAŁDOWSKA LIGA PIŁKI NOŻNEJ • PRAWA STRZEŻONE
            </p>
            <div className="flex gap-8">
              <Link href="/polityka-prywatnosci" className="text-gray-500 hover:text-white transition-colors">POLITYKA PRYWATNOŚCI</Link>
              <Link href="/tos" className="text-gray-500 hover:text-white transition-colors">REGULAMIN</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
