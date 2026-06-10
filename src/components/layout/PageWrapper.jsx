import { Header } from './Header';

export const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-text-primary">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
};
