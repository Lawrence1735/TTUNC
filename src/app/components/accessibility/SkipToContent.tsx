import React from 'react';

/**
 * SkipToContent Component
 * WCAG 2.1 Requirement: Provides a skip link for keyboard users to bypass navigation
 * Positioned off-screen until focused via Tab key
 */
export function SkipToContent({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#7A1E1E] focus:text-white focus:rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-[#7A1E1E] focus:outline-none transition-all"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}
