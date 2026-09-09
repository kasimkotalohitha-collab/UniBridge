import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'purple' | 'pink' | 'emerald' | 'amber' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'purple',
}) => {
  const iconVariants = {
    purple: 'bg-brand-50 text-brand-600 border-brand-200/60',
    pink: 'bg-pastel-pink-50 text-pastel-pink-500 border-pastel-pink-200/60',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    amber: 'bg-amber-50 text-amber-600 border-amber-200/60',
    slate: 'bg-slate-50 text-slate-600 border-slate-200/60',
  };

  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {value}
          </h3>
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-2xl flex items-center justify-center border transition-transform duration-150',
            iconVariants[variant]
          )}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                'font-medium',
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
