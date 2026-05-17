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
      className={`bg-white border-[#E5E7EB] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all ${
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
      <CardContent className="p-2 sm:p-3">
        <div className="hidden sm:flex items-center space-x-2 mb-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconBgColor}15` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
          </div>
        </div>
        <p className="text-[#6B7280] text-[10px] sm:text-[11px] leading-[13px] sm:leading-[15px] truncate">{label}</p>
        <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}