import React from 'react';
import { Card, CardContent } from './card';

interface DashboardQuickStatCardProps {
  label: string;
  value: string | number;
  onClick?: () => void;
  mutedWhenZero?: boolean;
  className?: string;
}

export function DashboardQuickStatCard({
  label,
  value,
  onClick,
  mutedWhenZero = true,
  className = '',
}: DashboardQuickStatCardProps) {
  const isZeroValue =
    mutedWhenZero && (String(value).trim() === '0' || String(value).trim() === '0%');

  const cardClass = [
    'bg-white border border-[#E2E8F0] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] transition-all pointer-events-auto',
    onClick ? 'cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E]' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className={cardClass}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <CardContent className="px-2 py-2 sm:px-3 sm:py-2 pointer-events-auto">
        <p className="text-[10px] text-[#64748B] leading-tight">{label}</p>
        <p
          className={`text-[12px] sm:text-[14px] font-bold leading-tight ${
            isZeroValue ? 'text-[#CBD5E1]' : 'text-[#0F172A]'
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
