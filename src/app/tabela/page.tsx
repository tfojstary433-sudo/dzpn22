import { Navbar } from '@/components/navbar';
import { LeagueTable } from '@/components/league-table';
import { Footer } from '@/components/footer';
import { DateBar } from '@/components/date-bar';
import { RecentResultsSidebar, SponsorsSidebar } from '@/components/table-sidebars';

export default function TabelaPage() {
  return (
    <>
      <Navbar />
      <div className="relative py-10">
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
      
      <div className="relative min-h-screen">
        
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
