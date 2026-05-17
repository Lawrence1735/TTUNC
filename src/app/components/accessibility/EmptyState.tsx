import React, { ReactNode } from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState Component
 * ISO 25010: Graceful degradation when no data is available
 * Provides clear messaging and optional action
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="mb-4 text-muted-foreground opacity-50" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[#7A1E1E] hover:bg-[#5A0E0E] text-white min-h-[44px] min-w-[44px] px-6"
          aria-label={action.label}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
