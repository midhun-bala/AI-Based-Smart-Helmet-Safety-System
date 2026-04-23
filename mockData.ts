import { AlertTriangle, Zap, Wind, Info, Check, X, MessageSquare, Database } from 'lucide-react';
import { Alert } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
  compact?: boolean;
}

const typeConfig = {
  drowsiness: {
    icon: Wind,
    label: 'Drowsiness',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  accident: {
    icon: Zap,
    label: 'Accident',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    dot: 'bg-red-400',
  },
  alcohol: {
    icon: AlertTriangle,
    label: 'Alcohol',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    dot: 'bg-orange-400',
  },
  system: {
    icon: Info,
    label: 'System',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    dot: 'bg-blue-400',
  },
};

const severityConfig = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export default function AlertCard({ alert, onAcknowledge, onDismiss, compact }: AlertCardProps) {
  const tc = typeConfig[alert.type];
  const Icon = tc.icon;

  if (compact) {
    return (
      <div className={`flex items-start gap-3 p-3 rounded-xl border ${tc.bg} transition-all`}>
        <div className={`w-8 h-8 rounded-lg bg-gray-900/50 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${tc.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${severityConfig[alert.severity]}`}>
              {alert.severity}
            </span>
            <span className="text-xs text-gray-500">{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
          </div>
          <p className="text-sm text-gray-200 leading-snug truncate">{alert.message}</p>
        </div>
        {!alert.acknowledged && (
          <button onClick={() => onAcknowledge(alert.id)} className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative p-4 rounded-2xl border bg-gray-900/60 border-gray-800/60 transition-all hover:bg-gray-900/90 ${!alert.acknowledged ? 'ring-1 ring-inset ' + (alert.severity === 'critical' ? 'ring-red-500/30' : alert.severity === 'warning' ? 'ring-amber-500/20' : 'ring-blue-500/20') : ''}`}>
      {/* Severity stripe */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />

      <div className="pl-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium ${tc.bg} ${tc.color}`}>
              <Icon className="w-3.5 h-3.5" />
              {tc.label}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${severityConfig[alert.severity]}`}>
              {alert.severity}
            </span>
            {!alert.acknowledged && (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unacknowledged
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!alert.acknowledged && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition"
              >
                <Check className="w-3.5 h-3.5" /> Ack
              </button>
            )}
            <button
              onClick={() => onDismiss(alert.id)}
              className="w-7 h-7 rounded-lg bg-gray-800/60 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-gray-500 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-gray-200 text-sm leading-relaxed mb-3">{alert.message}</p>

        <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
          <span className="font-mono text-gray-600">{alert.id}</span>
          {alert.helmetId && <span>🪖 {alert.helmetId}</span>}
          {alert.location && <span>📍 {alert.location}</span>}
          <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
          <div className="flex items-center gap-3 ml-auto">
            <span className={`flex items-center gap-1 ${alert.smsSent ? 'text-emerald-400' : 'text-gray-600'}`}>
              <MessageSquare className="w-3 h-3" />
              {alert.smsSent ? 'SMS Sent' : 'No SMS'}
            </span>
            <span className={`flex items-center gap-1 ${alert.firebaseLogged ? 'text-blue-400' : 'text-gray-600'}`}>
              <Database className="w-3 h-3" />
              {alert.firebaseLogged ? 'Logged' : 'Not Logged'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
