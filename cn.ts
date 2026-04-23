import { useState } from 'react';
import { Bell, Filter, CheckCheck, RefreshCw } from 'lucide-react';
import AlertCard from '../components/AlertCard';
import { Alert, AlertType, AlertSeverity } from '../types';

interface AlertsPageProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}

export default function AlertsPage({ alerts, onAcknowledge, onDismiss }: AlertsPageProps) {
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [showUnacked, setShowUnacked] = useState(false);

  const filtered = alerts.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (showUnacked && a.acknowledged) return false;
    return true;
  });

  const unackedCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-400" />
            Alerts & Events
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {alerts.length} total · {unackedCount} unacknowledged · {criticalCount} critical
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUnacked(!showUnacked)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition ${showUnacked ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Unacked Only
          </button>
          <button
            onClick={() => alerts.filter(a => !a.acknowledged).forEach(a => onAcknowledge(a.id))}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Ack All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'drowsiness', 'accident', 'alcohol', 'system'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition capitalize ${typeFilter === t ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'bg-gray-800/60 border-gray-700 text-gray-500 hover:text-white'}`}
            >
              {t === 'all' ? 'All Types' : t === 'drowsiness' ? '😴 Drowsiness' : t === 'accident' ? '🚨 Accident' : t === 'alcohol' ? '🍺 Alcohol' : '⚙️ System'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 ml-2">
          {(['all', 'critical', 'warning', 'info'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition capitalize ${severityFilter === s ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : 'bg-gray-800/60 border-gray-700 text-gray-500 hover:text-white'}`}
            >
              {s === 'all' ? 'All Severity' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
          { label: 'Warning', count: alerts.filter(a => a.severity === 'warning').length, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { label: 'SMS Sent', count: alerts.filter(a => a.smsSent).length, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Firebase Logged', count: alerts.filter(a => a.firebaseLogged).length, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`flex items-center justify-between p-3 rounded-xl border ${color}`}>
            <span className="text-xs font-medium">{label}</span>
            <span className="text-lg font-bold">{count}</span>
          </div>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No alerts match the current filters</p>
          </div>
        ) : (
          filtered.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledge}
              onDismiss={onDismiss}
            />
          ))
        )}
      </div>
    </div>
  );
}
