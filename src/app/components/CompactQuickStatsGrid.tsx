import React from 'react';
import type { LucideIcon } from './ui/icons';

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  iconBgColor?: string;
  onClick?: () => void;
}

interface CompactQuickStatsGridProps {
  stats: StatItem[];
  columns?: number;
  compact?: boolean;
}

export function CompactQuickStatsGrid({
  stats,
  columns = 4,
  compact = true
}: CompactQuickStatsGridProps) {
  return (
    <div
      className={`grid gap-2 sm:gap-3 ${
        columns === 4
          ? 'grid-cols-2 sm:grid-cols-4'
          : columns === 3
            ? 'grid-cols-2 sm:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-2'
      }`}
    >
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            onClick={stat.onClick}
            className={`
              bg-white border-[0.8px] border-[#E5E7EB] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]
              rounded-[12px] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)]
              hover:border-[#7A1E1E] transition-all
              ${stat.onClick ? 'cursor-pointer' : ''}
              ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}
            `}
          >
            <div className={`flex flex-col gap-2 ${compact ? 'h-20 sm:h-24' : 'h-24 sm:h-32'}`}>
              {/* Icon Section */}
              <div className="flex items-center">
                <div
                  className={`
                    rounded-full flex items-center justify-center flex-shrink-0
                    ${compact ? 'w-6 h-6' : 'w-8 h-8'}
                  `}
                  style={{
                    backgroundColor: `${stat.iconBgColor || '#7A1E1E'}15`
                  }}
                >
                  <Icon
                    className={compact ? 'w-3 h-3' : 'w-4 h-4'}
                    style={{ color: stat.iconColor || '#7A1E1E' }}
                  />
                </div>
              </div>

              {/* Label & Value Section */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <p className={`text-[#6B7280] font-medium truncate ${
                  compact ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-[11px]'
                }`}>
                  {stat.label}
                </p>
                <p className={`text-[#1A1A1A] font-bold text-nowrap ${
                  compact ? 'text-[12px] sm:text-[16px]' : 'text-[14px] sm:text-[18px]'
                }`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
