import React from 'react';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  wide?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, wide = false }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start p-2 sm:p-6 bg-radial from-[#380917] via-[#240610] to-[#120207] text-white selection:bg-[#d4af37] selection:text-[#1a050c]">
      {/* Background Golden Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#881337]/20 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#d4af37]/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Banner Status Bar */}
      <header className={`w-full ${wide ? 'max-w-6xl' : 'max-w-4xl'} mx-auto flex items-center justify-between sm:justify-start mb-3 sm:mb-6 z-10 transition-all px-1`}>
        {/* Brand Name & Description without logo */}
        <div className="text-left">
          <h1 className="font-luxury font-bold text-xl sm:text-3xl tracking-widest text-[#fceec7]">
            CONQUISTARIA
          </h1>
          <p className="text-[10px] sm:text-xs text-[#d4af37] font-medium tracking-wider uppercase mt-0.5">
            Planejamento financeiro
          </p>
        </div>
      </header>

      {/* Main Card Container */}
      <main className={`w-full ${wide ? 'max-w-6xl' : 'max-w-md'} z-10 transition-all duration-300`}>
        <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border sm:border-2 border-[#d4af37]/50 overflow-hidden transition-all duration-300">
          {/* Top Gold Stripe */}
          <div className="h-1.5 sm:h-2 w-full bg-gradient-to-r from-[#b3891b] via-[#f3d982] to-[#b3891b]" />

          {/* Card Body */}
          <div className="p-3 sm:p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Footer Instructions & Credits */}
      <footer className={`w-full ${wide ? 'max-w-6xl' : 'max-w-md'} mt-4 sm:mt-6 text-center z-10 text-[11px] sm:text-xs text-rose-200/80 space-y-1 pb-4`}>
        <p className="flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#d4af37]" />
          <span>CONQUISTARIA • Planejamento Financeiro</span>
        </p>
      </footer>
    </div>
  );
};

