'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const STAFF = [
  { 
    name: 'pako7u7_official', 
    role: 'CEO', 
    image: 'https://i.ibb.co/xKJxkX43/obraz-2026-02-01-151352402.png' 
  },
  { 
    name: 'Zeusinho', 
    role: 'CEO', 
    image: 'https://i.ibb.co/FkWD0jfR/obraz-2026-02-01-151444575.png' 
  },
  { 
    name: 'pikelowski77', 
    role: 'ZARZĄD', 
    image: 'https://i.ibb.co/MknTFcRs/obraz-2026-02-01-151525881.png' 
  },
  { 
    name: 'diranee', 
    role: 'ZARZĄD', 
    image: 'https://i.ibb.co/fGCRhLkM/obraz-2026-02-01-151625390.png' 
  },
];

function StaffCard({ member }: { member: typeof STAFF[0] }) {
  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00ccff]/10 blur-[50px] group-hover:bg-[#00ccff]/20 transition-colors"></div>
      
      <div className="relative z-10 text-center">
        <div className="w-24 h-24 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00ccff] to-transparent rounded-2xl opacity-20 group-hover:rotate-12 transition-transform duration-500"></div>
          <div className="w-full h-full rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
            <img src={member.image} alt={member.name} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
          </div>
        </div>
        
        <h3 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-[#00ccff] transition-colors">
          {member.name}
        </h3>
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#00ccff]">
          {member.role}
        </div>
      </div>
    </div>
  );
}

export default function ONasPage() {
  return (
    <div className="min-h-screen bg-[#050b14] text-white font-inter overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section - Identical style to Home page */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{ backgroundImage: 'url(https://i.ibb.co/mCNVZdMn/osr-4.png)' }}
          />
          {/* Deep blue gradient overlay like in actual home page */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050b14]/80 via-[#050b14]/40 to-[#050b14]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            {/* Title with styling from image */}
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-8 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              O NAS
            </h1>

            {/* Logo positioned under title */}
            <div className="relative mb-12">
              <img 
                src="https://i.ibb.co/BVcP3NmR/image.png" 
                alt="PFF Logo" 
                className="h-40 md:h-64 w-auto drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]"
              />
            </div>

            {/* Separator line */}
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#00ccff] to-transparent mb-12" />

            {/* Main Text - No container, directly on background */}
            <div className="space-y-6 text-center">
              <p className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight drop-shadow-2xl max-w-4xl mx-auto text-white">
                Polish Football Federation (PFF) to dynamicznie rozwijająca się organizacja w świecie Roblox, 
                skupiająca pasjonatów wirtualnej piłki nożnej.
              </p>
              <p className="text-lg md:text-2xl font-bold uppercase tracking-widest text-white/70 drop-shadow-xl">
                Naszą misją jest tworzenie profesjonalnego środowiska dla graczy, klubów i sędziów.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section - Transparent Glass style */}
      <div className="py-32 relative z-10 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 drop-shadow-lg">Nasi Partnerzy</h2>
            <div className="w-24 h-1 bg-[#00ccff] mx-auto mb-6 opacity-50" />
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl flex flex-col md:flex-row items-center gap-12 hover:bg-white/10 transition-all duration-500">
              <div className="w-32 h-32 md:w-56 md:h-56 bg-black/40 rounded-[2.5rem] border border-white/10 flex items-center justify-center p-8 shadow-2xl overflow-hidden group">
                <img 
                  src="https://i.ibb.co/60fmDyQr/7u7logo.png" 
                  alt="SevenUltimate'7 Logo" 
                  className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-4xl font-black italic uppercase mb-4 text-white">SevenUltimate'7</h3>
                <p className="text-white/60 text-xl leading-relaxed font-medium">
                  Marka tworząca profesjonalne koszulki dla naszej federacji, dbająca o unikalny wygląd każdej drużyny na wirtualnym boisku.
                </p>
                <div className="mt-8 inline-flex items-center gap-3 px-6 py-2 bg-[#00ccff]/10 border border-[#00ccff]/20 rounded-full text-[#00ccff] text-xs font-black uppercase tracking-widest">
                  <span className="w-2 h-2 bg-[#00ccff] rounded-full animate-pulse" />
                  Producent Odzieży
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Section - Using the same background style as Hero but with more blur */}
      <div className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ backgroundImage: 'url(https://i.ibb.co/mCNVZdMn/osr-4.png)' }}
          />
          <div className="absolute inset-0 bg-[#050b14]/90 backdrop-blur-2xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4 text-white">
              Zarząd Projektu
            </h2>
            <p className="text-[#00ccff] uppercase tracking-[0.4em] text-sm font-black">Fundamenty PFF</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {STAFF.map((member) => (
              <StaffCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
