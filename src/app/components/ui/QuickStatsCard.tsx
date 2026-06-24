import React from 'react';
import { Card, CardContent } from './card';
import type { LucideIcon } from './icons';

interface QuickStatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  iconBgColor?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export function QuickStatsCard({ 
  icon: Icon, 
  label, 
  value, 
  iconColor = '#7A1E1E',
  iconBgColor = '#7A1E1E',
  onClick,
  clickable = true
}: QuickStatsCardProps) {
  return (
    <Card 
      className={`bg-white border border-[#E5E7EB] shadow-[0_1px_8px_rgba(0,0,0,0.06)] rounded-[12px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all ${
        clickable ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.();
        }
      } : undefined}
    >
      <CardContent className="px-5 py-4 sm:px-5 sm:py-4">
        <div className="hidden sm:flex items-center space-x-2 mb-1">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconBgColor}15` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
          </div>
        </div>
        <p className="text-[#64748B] text-[11px] leading-none mb-1 truncate">{label}</p>
        <p className="text-[#0F172A] text-[24px] leading-none font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}