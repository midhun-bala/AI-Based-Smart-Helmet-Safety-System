import { Battery, Wifi, WifiOff, MapPin, User, Send, Activity } from 'lucide-react';
import { HelmetDevice } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface HelmetCardProps {
  helmet: HelmetDevice;
  onSendTest: (id: string) => void;
}

function BatteryIcon({ level }: { level: number }) {
  const color = level > 60 ? 'text-emerald-400' : level > 30 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className={`flex items-center gap-1.5 ${color}`}>
      <Battery className="w-3.5 h-3.5" />
      <span className="text-xs font-mono">{Math.round(level)}%</span>
    </div>
  );
}

function DrowsinessGauge({ score }: { score: number }) {
  const color = score < 30 ? 'bg-emerald-500' : score < 60 ? 'bg-amber-400' : 'bg-red-500';
  const label = score < 30 ? 'Normal' : score < 60 ? 'Moderate' : 'High';
  const textColor = score < 30 ? 'text-emerald-400' : score < 60 ? 'text-amber-400' : 'text-red-400';
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-500">Drowsiness Score</span>
        <span className={`text-xs font-bold ${textColor}`}>{Math.round(score)}% · {label}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function HelmetCard({ helmet, onSendTest }: HelmetCardProps) {
  const statusConfig = {
    online: { dot: 'bg-emerald-400 animate-pulse', text: 'text-emerald-400', label: 'Online', icon: Wifi },
    offline: { dot: 'bg-red-500', text: 'text-red-400', label: 'Offline', icon: WifiOff },
    connecting: { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400', label: 'Connecting...', icon: Wifi },
  };
  const sc = statusConfig[helmet.status];
  const StatusIcon = sc.icon;

  return (
    <div className={`bg-gray-900/70 border rounded-2xl p-5 hover:bg-gray-900 transition-all duration-300 ${
      helmet.status === 'online' ? 'border-gray-700/60' :
      helmet.status === 'offline' ? 'border-red-900/40' : 'border-amber-900/40'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
            <span className={`text-xs font-medium ${sc.text}`}>{sc.label}</span>
            <StatusIcon className={`w-3.5 h-3.5 ${sc.text}`} />
          </div>
          <h3 className="text-white font-bold text-base">{helmet.name}</h3>
          <p className="text-xs font-mono text-gray-600 mt-0.5">{helmet.id}</p>
        </div>
        <BatteryIcon level={helmet.battery} />
      </div>

      {/* Rider Info */}
      <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-gray-800/40">
        <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
          <User className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{helmet.rider}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            {helmet.location}
          </div>
        </div>
      </div>

      {/* Drowsiness Gauge */}
      <div className="mb-4">
        <DrowsinessGauge score={helmet.drowsinessScore} />
      </div>

      {/* Alcohol Level */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="text-gray-500">Alcohol Level (BAC)</span>
        <span className={`font-mono font-bold ${helmet.alcoholLevel > 0.05 ? 'text-red-400' : helmet.alcoholLevel > 0.02 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {helmet.alcoholLevel.toFixed(3)}%
          {helmet.alcoholLevel > 0.05 ? ' ⚠️' : helmet.alcoholLevel === 0 ? ' ✅' : ''}
        </span>
      </div>

      {/* Accelerometer */}
      <div className="mb-4 p-2.5 rounded-xl bg-gray-800/40">
        <div className="flex items-center gap-1.5 mb-2">
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-gray-500">Accelerometer (m/s²)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['x', 'y', 'z'] as const).map(axis => (
            <div key={axis} className="text-center">
              <p className="text-xs text-gray-600 uppercase">{axis}</p>
              <p className="text-sm font-mono text-purple-300">{helmet.accelerometerData[axis].toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">
          {helmet.isActive ? `Updated ${formatDistanceToNow(helmet.lastSeen, { addSuffix: true })}` : `Last seen ${formatDistanceToNow(helmet.lastSeen, { addSuffix: true })}`}
        </span>
        <button
          onClick={() => onSendTest(helmet.id)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition"
        >
          <Send className="w-3 h-3" />
          Test SMS
        </button>
      </div>
    </div>
  );
}
