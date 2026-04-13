import React from 'react';
import { cn } from "@/lib/utils";

interface DownloadCounterProps {
  remaining: number;
  max: number;
  loading?: boolean;
}

export function DownloadCounter({ remaining, max, loading }: DownloadCounterProps) {
  if (loading) {
     return <span className="text-xs text-muted-foreground animate-pulse border px-2 py-1 rounded-md">Verifying...</span>;
  }

  const isLow = remaining === 1;
  const isExhausted = remaining <= 0; // Capture negative edgecases safely

  return (
    <div className={cn(
      "text-xs font-semibold px-2 py-1 rounded-md border transition-colors",
      isExhausted ? "bg-red-50 text-red-600 border-red-200" :
      isLow ? "bg-amber-50 text-amber-600 border-amber-200" :
      "bg-slate-50 text-slate-500 border-slate-200"
    )}>
      {Math.max(0, remaining)}/{max} uses left
    </div>
  );
}
