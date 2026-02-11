'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-[#00ccff] font-black uppercase tracking-wider">
              Polityka Prywatności
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
                Niniejsza Polityka Prywatności opisuje zasady przetwarzania danych osobowych użytkowników strony 
                internetowej <strong className="text-[#00ccff]">pff24.pl</strong> (dalej: „Serwis").
              </p>
              <p className="text-lg leading-relaxed">
                Dbamy o prywatność użytkowników i przetwarzamy dane wyłącznie w zakresie niezbędnym 
                do działania Serwisu.
              </p>
            </div>

            {/* Administrator */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Administrator danych
              </h2>
              <div className="bg-white/5 rounded-xl p-6 space-y-2">
                <p className="text-lg">
                  <strong className="text-white">pako7u7_official__</strong>
                </p>
                <p className="text-white/60">
                  Kontakt: <a href="https://discord.gg/sXFGNXJaYT" target="_blank" rel="noopener noreferrer" className="text-[#5865F2] hover:underline">https://discord.gg/sXFGNXJaYT</a>
                </p>
              </div>
            </section>

            {/* Zakres zbieranych danych */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Zakres zbieranych danych
              </h2>
              <p className="text-lg leading-relaxed">
                W ramach działania Serwisu oraz procesu autoryzacji konta Roblox możemy przetwarzać 
                następujące dane:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li> nazwę użytkownika Roblox (username),</li>
                <li> identyfikator użytkownika Roblox (User ID),</li>
                <li> publiczne informacje o profilu Roblox (np. avatar, data utworzenia konta),</li>
                <li> adres IP (w celach technicznych i bezpieczeństwa),</li>
                <li> podstawowe dane techniczne przeglądarki (logi serwera).</li>
              </ul>
              <p className="text-lg leading-relaxed mt-4">
                Serwis <strong className="text-red-400">nie zbiera</strong>:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li> haseł do kont Roblox,</li>
                <li> danych płatniczych,</li>
                <li> prywatnych wiadomości,</li>
                <li> danych wrażliwych.</li>
              </ul>
            </section>

            {/* Sposób pozyskiwania danych */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Sposób pozyskiwania danych
              </h2>
              <p className="text-lg leading-relaxed">Dane są pozyskiwane:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li> bezpośrednio od użytkownika w momencie dobrowolnej autoryzacji konta Roblox,</li>
                <li> automatycznie poprzez oficjalne API platformy Roblox,</li>
                <li> automatycznie poprzez mechanizmy techniczne Serwisu (np. logi serwera).</li>
              </ul>
            </section>

            {/* Cel przetwarzania danych */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Cel przetwarzania danych
              </h2>
              <p className="text-lg leading-relaxed">Dane przetwarzane są w celu:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li> umożliwienia działania funkcjonalności Serwisu,</li>
                <li> identyfikacji konta Roblox użytkownika,</li>
                <li> zapewnienia bezpieczeństwa i poprawnego działania strony,</li>
                <li> kontaktu z użytkownikiem w sprawach technicznych (jeśli wymagane).</li>
              </ul>
            </section>

            {/* Podstawa prawna przetwarzania */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Podstawa prawna przetwarzania
              </h2>
              <p className="text-lg leading-relaxed">Dane przetwarzane są na podstawie:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li> zgody użytkownika (art. 6 ust. 1 lit. a RODO),</li>
                <li> prawnie uzasadnionego interesu administratora (art. 6 ust. 1 lit. f RODO) w zakresie 
                  bezpieczeństwa i utrzymania Serwisu.</li>
              </ul>
            </section>

            {/* Przechowywanie danych */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Przechowywanie danych
              </h2>
              <p className="text-lg leading-relaxed">
                Dane przechowywane są tylko przez okres niezbędny do realizacji celu, dla którego zostały zebrane.
                Po cofnięciu autoryzacji lub na żądanie użytkownika dane mogą zostać usunięte.
              </p>
            </section>

            {/* Udostępnianie danych */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Udostępnianie danych
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li> Dane nie są sprzedawane ani przekazywane podmiotom trzecim.</li>
                <li> Dane mogą być udostępnione wyłącznie, gdy wymagają tego przepisy prawa.</li>
              </ul>
            </section>

            {/* Prawa użytkownika */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Prawa użytkownika
              </h2>
              <p className="text-lg leading-relaxed">Użytkownik ma prawo do:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li> dostępu do swoich danych,</li>
                <li> ich poprawiania,</li>
                <li> żądania usunięcia danych („prawo do bycia zapomnianym"),</li>
                <li> ograniczenia przetwarzania,</li>
                <li> cofnięcia zgody w dowolnym momencie,</li>
                <li> wniesienia skargi do organu nadzorczego.</li>
              </ul>
            </section>

            {/* Cofnięcie autoryzacji */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Cofnięcie autoryzacji
              </h2>
              <p className="text-lg leading-relaxed">
                Użytkownik może w każdej chwili cofnąć autoryzację Serwisu poprzez ustawienia swojego 
                konta Roblox lub kontakt z administratorem Serwisu.
              </p>
            </section>

            {/* Zabezpieczenia danych */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Zabezpieczenia danych
              </h2>
              <p className="text-lg leading-relaxed">
                Administrator stosuje odpowiednie środki techniczne i organizacyjne w celu ochrony danych 
                przed nieautoryzowanym dostępem, utratą lub modyfikacją.
              </p>
            </section>

            {/* Zmiany Polityki Prywatności */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Zmiany Polityki Prywatności
              </h2>
              <p className="text-lg leading-relaxed">
                Administrator zastrzega sobie prawo do zmiany niniejszej Polityki Prywatności. 
                Aktualna wersja będzie dostępna na stronie Serwisu.
              </p>
            </section>

            {/* Kontakt */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide border-b border-[#00ccff]/30 pb-2">
                Kontakt
              </h2>
              <p className="text-lg leading-relaxed">
                W sprawach związanych z ochroną danych osobowych prosimy o kontakt:
              </p>
              <div className="flex justify-center mt-6">
                <a
                  href="https://discord.gg/sXFGNXJaYT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-[#5865F2]/25"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.19812924a.077.077 0 01-.0066.127.3728.6 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                  Skontaktuj się z nami na Discordzie
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
              href="/tos"
              className="text-white/60 hover:text-[#00ccff] font-medium transition-colors"
            >
              Regulamin (ToS)
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
