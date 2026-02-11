import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function ONasPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-inter">
      <Navbar />
      
      <div className="relative py-24 overflow-hidden bg-gradient-to-b from-[#003087] to-[#0a0a0a]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%),
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
            `
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-black/40 rounded-3xl border border-white/10 p-12 backdrop-blur-md text-center min-h-[300px] flex items-center justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#00ccff] to-transparent rounded-full opacity-50"></div>
          </div>
        </div>
      </div>

      <div 
        className="relative py-20 bg-fixed bg-center bg-cover min-h-[400px]"
        style={{ backgroundImage: 'url(https://i.ibb.co/G4rD13m6/tlo.png)' }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 relative z-10 flex justify-center">
             <div className="w-full max-w-5xl h-64 border border-white/5 bg-white/5 rounded-3xl backdrop-blur-sm opacity-20"></div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
