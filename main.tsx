import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'cyan';
  pulse?: boolean;
}

const colorMap = {
  blue: {
    bg: 'from-blue-500/20 to-blue-600/10',
    icon: 'text-blue-400',
    iconBg: 'bg-blue-500/15 border-blue-500/20',
    badge: 'bg-blue-500/15 text-blue-400',
    border: 'border-blue-500/10',
  },
  emerald: {
    bg: 'from-emerald-500/20 to-emerald-600/10',
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/20',
    badge: 'bg-emerald-500/15 text-emerald-400',
    border: 'border-emerald-500/10',
  },
  amber: {
    bg: 'from-amber-500/20 to-amber-600/10',
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border-amber-500/20',
    badge: 'bg-amber-500/15 text-amber-400',
    border: 'border-amber-500/10',
  },
  red: {
    bg: 'from-red-500/20 to-red-600/10',
    icon: 'text-red-400',
    iconBg: 'bg-red-500/15 border-red-500/20',
    badge: 'bg-red-500/15 text-red-400',
    border: 'border-red-500/10',
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-600/10',
    icon: 'text-purple-400',
    iconBg: 'bg-purple-500/15 border-purple-500/20',
    badge: 'bg-purple-500/15 text-purple-400',
    border: 'border-purple-500/10',
  },
  cyan: {
    bg: 'from-cyan-500/20 to-cyan-600/10',
    icon: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border-cyan-500/20',
    badge: 'bg-cyan-500/15 text-cyan-400',
    border: 'border-cyan-500/10',
  },
};

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color, pulse }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`relative bg-gray-900/80 border ${c.border} rounded-2xl p-5 overflow-hidden group hover:bg-gray-900 transition-all duration-300`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-40`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl ${c.iconBg} border flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
          {pulse && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs text-emerald-400 font-medium">LIVE</span>
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-white mb-1 tabular-nums">{value}</p>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
        {trend && (
          <div className={`mt-3 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${c.badge}`}>
            <span>{trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
            <span className="opacity-70">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
