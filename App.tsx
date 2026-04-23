import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AlertsPage from './pages/AlertsPage';
import HelmetsPage from './pages/HelmetsPage';
import AIDetectionPage from './pages/AIDetectionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import APIMonitorPage from './pages/APIMonitorPage';
import FirebaseLogsPage from './pages/FirebaseLogsPage';
import SettingsPage from './pages/SettingsPage';
import { useRealTimeData } from './hooks/useRealTimeData';
import { Bell, Power } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    alerts,
    helmets,
    detectionHistory,
    metrics,
    newAlertPulse,
    liveMode,
    setLiveMode,
    acknowledgeAlert,
    dismissAlert,
    sendTestSms,
  } = useRealTimeData();

  const unreadCount = alerts.filter(a => !a.acknowledged).length;

  const pageTitle: Record<string, string> = {
    dashboard: 'System Dashboard',
    alerts: 'Alerts & Events',
    helmets: 'Helmet Devices',
    ai: 'AI Detection',
    analytics: 'Analytics',
    api: 'API Monitor',
    database: 'Firebase Logs',
    settings: 'Configuration',
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 h-16 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800/60 flex items-center px-4 lg:px-6 gap-4 z-20">
          <div className="flex-1 min-w-0 pl-10 lg:pl-0">
            <h1 className="text-base font-bold text-white truncate">{pageTitle[activeTab]}</h1>
            <p className="text-xs text-gray-500 hidden sm:block">AI-Based Smart Helmet Safety System</p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Live Toggle */}
            <button
              onClick={() => setLiveMode(!liveMode)}
              className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
                liveMode
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}
            >
              <Power className="w-3 h-3" />
              {liveMode ? 'Live Mode ON' : 'Live Mode OFF'}
            </button>

            {/* Alert Bell */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`relative w-9 h-9 rounded-lg flex items-center justify-center border transition ${
                newAlertPulse
                  ? 'bg-red-500/15 border-red-500/30 text-red-400 animate-pulse'
                  : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Server Status */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-gray-800">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-gray-500">Flask</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-xs text-gray-500">Firebase</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-xs text-gray-500">Twilio</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                alerts={alerts}
                helmets={helmets}
                detectionHistory={detectionHistory}
                metrics={metrics}
                newAlertPulse={newAlertPulse}
                onAcknowledge={acknowledgeAlert}
                onDismiss={dismissAlert}
              />
            )}
            {activeTab === 'alerts' && (
              <AlertsPage
                alerts={alerts}
                onAcknowledge={acknowledgeAlert}
                onDismiss={dismissAlert}
              />
            )}
            {activeTab === 'helmets' && (
              <HelmetsPage
                helmets={helmets}
                onSendTest={sendTestSms}
              />
            )}
            {activeTab === 'ai' && (
              <AIDetectionPage detectionHistory={detectionHistory} />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsPage detectionHistory={detectionHistory} />
            )}
            {activeTab === 'api' && (
              <APIMonitorPage />
            )}
            {activeTab === 'database' && (
              <FirebaseLogsPage />
            )}
            {activeTab === 'settings' && (
              <SettingsPage />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
