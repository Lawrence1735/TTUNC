import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../ui/utils';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'table' | 'cards';
  count?: number;
  className?: string;
  message?: string;
}

/**
 * LoadingState Component
 * ISO 9241: Provides clear feedback to users during async operations
 * Includes proper ARIA attributes for screen readers
 */
export function LoadingState({
  type = 'spinner',
  count = 3,
  className,
  message = 'Loading...'
}: LoadingStateProps) {
  if (type === 'spinner') {
    return (
      <div
        className={cn("flex flex-col items-center justify-center py-12", className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#7A1E1E] border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true"></div>
        <p className="text-muted-foreground text-sm sm:text-base">{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={cn("space-y-3", className)} role="status" aria-label="Loading table data">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
        <span className="sr-only">Loading table data...</span>
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)} role="status" aria-label="Loading content">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
        <span className="sr-only">Loading content...</span>
      </div>
    );
  }

  // skeleton type
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
