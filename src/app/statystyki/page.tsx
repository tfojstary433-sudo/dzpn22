import { Navbar } from '@/components/navbar';
import { Statistics } from '@/components/statistics';
import { Footer } from '@/components/footer';

export default function StatystykiPage() {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage: 'url(https://i.ibb.co/mCNVZdMn/osr-4.png)',
      }}
    >
      <div className="relative z-10">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-16">
          <Statistics />
        </main>
        <Footer />
      </div>
    </div>
  );
}
