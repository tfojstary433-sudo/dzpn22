'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { standings as defaultStandings } from '@/lib/data';

export function LeagueTable({ isInTab = false }: { isInTab?: boolean } = {}) {
  const standings = defaultStandings;
  const content = (
    <>
      <div className="max-w-4xl mx-auto space-y-3">
        {standings.map((standing, index) => {
          let gradientColor = '#3b82f6';
          if (standing.position === 1) {
            gradientColor = '#FFD700'; // Złoty
          } else if (standing.position === 2) {
            gradientColor = '#C0C0C0'; // Srebrny
          } else if (standing.position === 3) {
            gradientColor = '#CD7F32'; // Brązowy
          } else if (standing.position >= 11) {
            gradientColor = '#ef4444'; // Czerwony dla spadku
          }
          
          return (
            <Link 
              href={standing.team ? `/klub/${standing.team.id}` : '#'} 
              key={`standing-${standing.position}`}
              className={`block ${standing.team ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div 
                className="relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.01] border border-white/5"
                style={{
                  background: standing.team ? `linear-gradient(to right, 
                    ${gradientColor}44 0%, 
                    ${gradientColor}22 20%,
                    #0a0a0a 60%,
                    #000000 100%
                  )` : '#0a0a0a'
                }}
              >
                <div className="relative z-10 px-5 py-4 flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-black text-base shrink-0 ${
                    standing.position === 1 ? 'bg-yellow-500 text-black' :
                    standing.position === 2 ? 'bg-gray-400 text-black' :
                    standing.position === 3 ? 'bg-orange-700 text-white' :
                    standing.position >= 11 ? 'bg-red-500 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {standing.position}
                  </div>
                  
                  {standing.team ? (
                    <>
                      <div className="relative shrink-0">
                        <div 
                          className="absolute inset-0 blur-xl opacity-40"
                          style={{ backgroundColor: standing.team.color }}
                        />
                        <Image
                          src={standing.team.logo}
                          alt={standing.team.name}
                          width={40}
                          height={40}
                          className="relative z-10"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-white text-xl uppercase tracking-tight truncate">
                          {standing.team.name}
                        </h3>
                      </div>
                      
                      <div className="hidden md:flex items-center gap-4 text-xs">
                        <div className="text-center">
                          <div className="text-gray-500 text-[10px] font-bold">M</div>
                          <div className="text-white font-bold">{standing.played}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 text-[10px] font-bold">W</div>
                          <div className="text-green-400 font-bold">{standing.won}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 text-[10px] font-bold">R</div>
                          <div className="text-yellow-400 font-bold">{standing.drawn}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 text-[10px] font-bold">P</div>
                          <div className="text-red-400 font-bold">{standing.lost}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 text-[10px] font-bold">+/-</div>
                          <div className={`font-bold ${
                            standing.goalDifference > 0 ? 'text-green-400' :
                            standing.goalDifference < 0 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-lg shrink-0">
                        <span className="text-xl font-black text-white">
                          {standing.points}
                        </span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">PKT</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-600 text-sm font-bold">-</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-black text-black text-sm">1</div>
          <span className="text-white font-bold">Mistrz</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center font-black text-black text-sm">2</div>
          <span className="text-white font-bold">Wicemistrz</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-700 rounded-full flex items-center justify-center font-black text-white text-sm">3</div>
          <span className="text-white font-bold">3. miejsce</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-black text-white text-sm">11</div>
          <span className="text-white font-bold">Spadek</span>
        </div>
      </div>
    </>
  );

  if (isInTab) {
    return <div className="container mx-auto px-4">{content}</div>;
  }

  return (
    <section id="tabela" className="py-16">
      <div className="container mx-auto px-4">
        {content}
      </div>
    </section>
  );
}
