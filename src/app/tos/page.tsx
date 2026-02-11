'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';

export default function ToSPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest mb-4">
              Terms of Service
            </h1>
            <p className="text-[#00ccff] font-black uppercase tracking-wider">
              Regulamin
            </p>
          </div>

          {/* Content */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-white/80 space-y-8">
            {/* Last Updated */}
            <div className="text-center pb-6 border-b border-white/10">
              <p className="text-white/60">
                <strong className="text-white">Ostatnia aktualizacja:</strong> 29.01.2026
              </p>
            </div>

            {/* Introduction */}
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                Niniejszy regulamin (dalej: „Regulamin") określa zasady korzystania ze strony internetowej{' '}
                <strong className="text-[#00ccff]">pff24.pl</strong> (dalej: „Serwis"), która umożliwia użytkownikom 
                dobrowolną autoryzację konta Roblox w celu pobrania podstawowych informacji o koncie.
              </p>
              <p className="text-lg leading-relaxed">
                Korzystając z Serwisu, akceptujesz niniejszy Regulamin w całości. Jeśli nie zgadzasz się z 
                jego postanowieniami, nie korzystaj z Serwisu.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                1. Informacje ogólne
              </h2>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>
                  Serwis nie jest w żaden sposób powiązany, sponsorowany ani zatwierdzony przez{' '}
                  <strong>Roblox Corporation</strong>.
                </li>
                <li>
                  Roblox jest zastrzeżonym znakiem towarowym Roblox Corporation.
                </li>
                <li>
                  Właścicielem i operatorem Serwisu jest{' '}
                  <strong className="text-[#00ccff]">pako7u7_official__</strong>, kontakt (Użytkownik Discord):{' '}
                  <strong className="text-[#00ccff]">pako7u7_official__</strong>.
                </li>
              </ol>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                2. Zakres usługi
              </h2>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>
                  Serwis umożliwia użytkownikowi autoryzację konta Roblox za pomocą oficjalnych mechanizmów 
                  udostępnianych przez platformę Roblox.
                </li>
                <li>
                  Celem autoryzacji jest wyłącznie pobranie podstawowych informacji o koncie użytkownika.
                </li>
                <li>
                  Serwis <strong className="text-red-400">nie umożliwia</strong>:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li> dostępu do hasła użytkownika,</li>
                    <li> zmiany ustawień konta Roblox,</li>
                    <li> wykonywania jakichkolwiek działań na koncie Roblox w imieniu użytkownika.</li>
                  </ul>
                </li>
              </ol>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                3. Zakres zbieranych danych
              </h2>
              <p className="text-lg leading-relaxed">
                W ramach autoryzacji Serwis może pobierać następujące informacje:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li> nazwę użytkownika (username),</li>
                <li> identyfikator użytkownika (User ID),</li>
                <li> publiczne informacje o profilu (np. avatar, data utworzenia konta),</li>
                <li> inne publicznie dostępne dane udostępniane przez API Roblox.</li>
              </ul>
              <p className="text-lg leading-relaxed mt-4">
                Serwis <strong className="text-red-400">nie zbiera</strong>:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li> haseł,</li>
                <li> danych płatniczych,</li>
                <li> prywatnych wiadomości,</li>
                <li> historii logowania.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                4. Przetwarzanie danych
              </h2>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li> Dane pobierane są wyłącznie w celu działania funkcjonalności Serwisu.</li>
                <li> Dane nie są sprzedawane ani udostępniane podmiotom trzecim.</li>
                <li> Użytkownik może w każdej chwili cofnąć autoryzację poprzez ustawienia swojego konta Roblox.</li>
                <li> Dane mogą zostać usunięte na żądanie użytkownika, poprzez kontakt z administratorem Serwisu.</li>
              </ol>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                5. Odpowiedzialność
              </h2>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li> Serwis jest udostępniany „tak jak jest" (as-is).</li>
                <li> Administrator nie ponosi odpowiedzialności za:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li> przerwy w działaniu Serwisu,</li>
                    <li> zmiany w API Roblox,</li>
                    <li> szkody wynikające z korzystania z Serwisu.</li>
                  </ul>
                </li>
                <li> Użytkownik korzysta z Serwisu na własną odpowiedzialność.</li>
              </ol>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                6. Obowiązki użytkownika
              </h2>
              <p className="text-lg leading-relaxed">Użytkownik zobowiązuje się do:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li> korzystania z Serwisu zgodnie z prawem,</li>
                <li> niepodejmowania prób nadużyć, obejścia zabezpieczeń lub ingerencji w działanie Serwisu.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                7. Zmiany Regulaminu
              </h2>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li> Administrator zastrzega sobie prawo do zmiany niniejszego Regulaminu w dowolnym momencie.</li>
                <li> Aktualna wersja Regulaminu będzie zawsze dostępna na stronie Serwisu.</li>
              </ol>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                8. Prawo właściwe
              </h2>
              <p className="text-lg leading-relaxed">
                Do niniejszego Regulaminu ma zastosowanie prawo{' '}
                <strong>Rzeczypospolitej Polskiej</strong>.
              </p>
            </section>

            {/* Section 9 - Contact */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                9. Kontakt
              </h2>
              <p className="text-lg leading-relaxed">
                W sprawach związanych z Serwisem prosimy o kontakt na ticketcie na serwerze Discord:
              </p>
              <div className="flex justify-center mt-6">
                <a
                  href="https://discord.gg/sXFGNXJaYT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-[#5865F2]/25"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                  Dołącz do nas na Discordzie
                </a>
              </div>
            </section>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-white/10">
            <Link
              href="/polityka-prywatnosci"
              className="text-white/60 hover:text-[#00ccff] font-medium transition-colors"
            >
              Polityka Prywatności
            </Link>
            <Link
              href="/cookies"
              className="text-white/60 hover:text-[#00ccff] font-medium transition-colors"
            >
              Polityka Cookies
            </Link>
            <Link
              href="/kontakt"
              className="text-white/60 hover:text-[#00ccff] font-medium transition-colors"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
