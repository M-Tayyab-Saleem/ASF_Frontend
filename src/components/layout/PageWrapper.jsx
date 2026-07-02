import { Header } from './Header';

export const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F2F9F8] text-text-primary relative overflow-hidden">
      {/* Background Blobs for Glassmorphism depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-dark/10 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};
