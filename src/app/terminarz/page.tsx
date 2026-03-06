import { Navbar } from '@/components/navbar';
import { MatchSchedule } from '@/components/match-schedule';
import { Footer } from '@/components/footer';
import { DateBar } from '@/components/date-bar';

export default function TerminarzPage() {
  return (
    <>
      <Navbar />
      <div className="relative py-10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-900/30 via-blue-800/40 to-blue-900/30 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-16 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"></div>
                <img 
                  src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png" 
                  alt="Logo" 
                  className="h-14 w-auto"
                />
              </div>
              
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                TERMINARZ 2025/2026
              </h1>
              
              <div className="w-1 h-16 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      <MatchSchedule />
      <DateBar />
      <Footer />
    </>
  );
}
