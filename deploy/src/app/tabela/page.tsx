import { Navbar } from '@/components/navbar';
import { LeagueTable } from '@/components/league-table';
import { Footer } from '@/components/footer';
import { DateBar } from '@/components/date-bar';
import { RecentResultsSidebar, SponsorsSidebar } from '@/components/table-sidebars';

export default function TabelaPage() {
  return (
    <>
      <Navbar />
      <div className="relative py-10 overflow-hidden bg-[#003087]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%),
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
            `
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-900/30 via-blue-800/40 to-blue-900/30 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4">
                <div className="w-1 h-20 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"></div>
                <img 
                  src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png" 
                  alt="Logo" 
                  className="h-20 w-auto"
                />
                <div className="w-1 h-20 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://i.ibb.co/G4rD13m6/tlo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Recent Results */}
            <aside className="lg:w-1/4">
              <RecentResultsSidebar />
            </aside>

            {/* Middle - Table */}
            <main className="lg:w-1/2">
              <LeagueTable />
            </main>

            {/* Right Sidebar - Sponsors */}
            <aside className="lg:w-1/4">
              <SponsorsSidebar />
            </aside>
          </div>
        </div>
      </div>
      
      <DateBar />
      <Footer />
    </>
  );
}
