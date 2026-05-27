import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-colors duration-300">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />

      <div className="flex flex-col items-center gap-6 relative z-10">
        {/* Glowing dynamic spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200/50 dark:border-white/5" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary animate-spin" />
          <div className="absolute inset-2.5 rounded-full bg-background flex items-center justify-center shadow-inner">
            <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#6ab2ff] to-[#00bcd3] animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold font-poppins text-slate-800 dark:text-slate-100 tracking-wide animate-pulse">
            Loading Cockpit
          </h3>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest animate-pulse">
            Securing Connection
          </p>
        </div>
      </div>
    </div>
  );
}
