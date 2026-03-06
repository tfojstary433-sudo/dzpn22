import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#001a4d] to-[#000a2d] text-white font-sans">
      {/* Sponsors Bar */}
      <div className="bg-black/40 py-3 overflow-hidden w-full border-t border-white/5">
        <div className="flex gap-6 items-center whitespace-nowrap animate-scroll" style={{ width: 'max-content' }}>
          {[...Array(8)].map((_, group) => (
            <div key={group} className="flex gap-6 items-center flex-shrink-0">
              <Image src="https://i.ibb.co/gL0mLH1m/Clash-MMALogo.png" alt="Clash MMA" width={80} height={50} className="h-12 w-auto" />
              <Image src="https://i.ibb.co/XxHbj8Cd/04be6464-9300-4243-b4ee-6054050870e7.png" alt="Sponsor 2" width={80} height={50} className="h-12 w-auto" />
              <Image src="https://i.ibb.co/MxFqjSYj/7u7logo-1.png" alt="7u7" width={80} height={50} className="h-12 w-auto" />
              <Image src="https://i.ibb.co/xbrWSnb/Przezroczyste-PFF.png" alt="PFF" width={80} height={50} className="h-12 w-auto" />
            </div>
          ))}
        </div>
      </div>

      <div className="py-12 relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.02) 50px, rgba(255,255,255,0.02) 100px)`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Logo */}
            <div className="flex flex-col gap-4">
              <Image
                src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png"
                alt="Ekstraklasa"
                width={150}
                height={40}
                className="brightness-0 invert"
              />
              <p className="text-gray-400 text-xs leading-relaxed">
                Oficjalna strona Polskiej Federacji Futbolu Ekstraklasa
              </p>
            </div>

            {/* Mapa Strony */}
            <div>
              <h3 className="font-black text-sm mb-4 text-blue-400 uppercase tracking-wider">Mapa Strony</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Aktualności
                </Link></li>
                <li><Link href="/terminarz" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Terminarz
                </Link></li>
                <li><Link href="/tabela" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Tabela
                </Link></li>
                <li><Link href="/statystyki" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Statystyki
                </Link></li>
                <li><Link href="/kluby" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Kluby
                </Link></li>
                <li><Link href="/sklep" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Sklep
                </Link></li>
              </ul>
            </div>

            {/* Turnieje */}
            <div>
              <h3 className="font-black text-sm mb-4 text-blue-400 uppercase tracking-wider">Turnieje</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Puchar Polski
                </Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Superpuchar Polski
                </Link></li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-black text-sm mb-4 text-blue-400 uppercase tracking-wider">Social Media</h3>
              <div className="flex gap-3">
                <a href="https://discord.gg/R7y6ZnczP4" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#5865F2] transition-all hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.572.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.072.072 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.072.072 0 0 1 .078.01c.12.098.246.196.373.291a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@polskafederacjafutbolu_" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#000000] transition-all hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.09.76-.01 1.55.25 2.27.45 1.04 1.48 1.8 2.59 1.91.75.07 1.51-.04 2.18-.39.86-.42 1.52-1.17 1.82-2.06.18-.54.21-1.1.21-1.66-.02-5.3-.01-10.61-.01-15.92z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs">
            <p className="text-gray-400">2025 © POLSKA FEDERACJA FUTBOLU • WSZYSTKIE PRAWA ZASTRZEŻONE</p>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Polityka Prywatności</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Regulamin</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Ustawienia Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
