'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { newsArticles } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';

export default function NewsDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const article = newsArticles.find(a => a.id === parseInt(id));

  if (!article) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">Artykuł nie został znaleziony</p>
            <Link href="/" className="text-blue-500 hover:text-blue-400 font-semibold">
              Powrót do strony głównej
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <article className="min-h-screen">
        <div className="relative w-full h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10"></div>
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          
          <div className="absolute bottom-0 left-0 right-0 z-20 container mx-auto px-4 pb-12">
            <div className="max-w-4xl mx-auto">
              <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold mb-6 inline-flex items-center gap-2 group">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Powrót do aktualności
              </Link>
              
              <span className="inline-block px-4 py-1 bg-blue-600 text-white text-xs font-bold uppercase mb-4 rounded">
                {article.category}
              </span>
              
              <h1 className="text-6xl font-black text-white leading-tight drop-shadow-2xl">
                {article.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#1a1f2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 shadow-2xl">
              <div className="prose prose-invert prose-lg max-w-none">
                <div className="space-y-6 text-gray-300">
                  <p className="text-xl leading-relaxed first-letter:text-7xl first-letter:font-bold first-letter:text-blue-500 first-letter:mr-3 first-letter:float-left">
                    Pierwszy sezon Ekstraklasy PFF w Roblox – wszystko dopiero się zaczyna. Pierwszy sezon Ekstraklasy Polskiej Federacji Futbolu w Roblox to start zupełnie nowego projektu, który ma na celu stworzenie miejsca dla wszystkich fanów piłki nożnej w wirtualnym świecie. To moment, w którym liga dopiero nabiera kształtów, a każdy zawodnik ma szansę zapisać się w jej historii od samego początku. Nie ma jeszcze gwiazd, legend ani faworytów — są za to pasja, rywalizacja i otwarte drzwi dla nowych graczy, którzy chcą spróbować swoich sił na boisku.
                  </p>
                  
                  <h2 className="text-3xl font-bold text-white mt-8 mb-4">Główne informacje</h2>
                  <p className="text-lg leading-relaxed">
                    Ekstraklasa PFF w Roblox wystartowała jako pierwsza oficjalna liga organizowana przez Polską Federację Futbolu. Sezon inauguracyjny to etap budowania zasad, struktur i drużyn, które w przyszłości stworzą silną i rozpoznawalną ligę. Rozgrywki są otwarte na nowych zawodników, a każdy mecz to okazja do nauki, rozwoju umiejętności i dobrej zabawy. Liczy się zaangażowanie, współpraca zespołowa i chęć gry — nie doświadczenie.
                  </p>
                  
                  <div className="bg-blue-900/30 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
                    <p className="text-lg italic text-blue-200">
                      "To idealny moment, aby dołączyć. Każdy zaczyna z tego samego poziomu."
                    </p>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mt-8 mb-4">Szczegóły</h2>
                  <p className="text-lg leading-relaxed">
                    Pierwszy sezon to czas eksperymentów i wspólnego tworzenia ligi. Kluby dopiero się formują, a zawodnicy mają realny wpływ na atmosferę, styl gry i przyszłość rozgrywek. Każdy gol, każda asysta i każdy mecz budują historię Ekstraklasy PFF od samych podstaw. Jeśli szukasz miejsca, gdzie możesz pograć w piłkę w Roblox, poznać nowych ludzi i stać się częścią rozwijającej się społeczności — Ekstraklasa PFF to idealne miejsce na start. To nie jest liga gotowa — to liga, którą tworzymy razem.
                  </p>

                  <div className="mt-12 pt-8 border-t border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Opublikowano: 10.01.2026, 17:15</span>
                      <span>•</span>
                      <span>Autor: Redakcja PFF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-white mb-6">Powiązane artykuły</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {newsArticles.filter(a => a.id !== article.id).slice(0, 3).map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id}
                    href={`/aktualnosc/${relatedArticle.id}`}
                    className="group"
                  >
                    <div className="bg-[#1a1f2e] rounded-lg overflow-hidden border border-gray-700/50 hover:border-blue-500 transition-all">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={relatedArticle.image}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <span className="text-xs font-semibold text-cyan-400 mb-2 inline-block">
                          {relatedArticle.category}
                        </span>
                        <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors line-clamp-2">
                          {relatedArticle.title}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
}
