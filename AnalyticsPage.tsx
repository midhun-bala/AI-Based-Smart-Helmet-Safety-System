import { useState, useEffect, useCallback } from 'react';
import { Alert, HelmetDevice, DetectionEvent, SystemMetrics } from '../types';
import { mockAlerts, mockHelmets, generateDetectionHistory, mockSystemMetrics } from '../data/mockData';

export function useRealTimeData() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [helmets, setHelmets] = useState<HelmetDevice[]>(mockHelmets);
  const [detectionHistory, setDetectionHistory] = useState<DetectionEvent[]>(generateDetectionHistory());
  const [metrics, setMetrics] = useState<SystemMetrics>(mockSystemMetrics);
  const [newAlertPulse, setNewAlertPulse] = useState(false);
  const [liveMode, setLiveMode] = useState(true);

  const generateRandomAlert = useCallback((): Alert => {
    const types: Array<'drowsiness' | 'accident' | 'alcohol'> = ['drowsiness', 'accident', 'alcohol'];
    const severities: Alert['severity'][] = ['critical', 'warning', 'info'];
    const locations = ['NH-48, Bangalore', 'Ring Road, Hyderabad', 'NICE Road, Bangalore', 'MG Road, Pune'];
    const messages = {
      drowsiness: ['Eye closure detected > 2.5s', 'PERCLOS ratio exceeded 0.25', 'Yawn sequence detected x3'],
      accident: ['Sudden deceleration detected', 'Impact G-force > 3.2G', 'Roll-over motion pattern detected'],
      alcohol: ['BAC estimate: 0.04%', 'Breath sensor positive reading', 'Chemical sensor alert — ethanol traces'],
    };
    const type = types[Math.floor(Math.random() * types.length)] as 'drowsiness' | 'accident' | 'alcohol';
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const helmetIds = mockHelmets.filter(h => h.isActive).map(h => h.id);
    return {
      id: `ALT-${Date.now()}`,
      type,
      severity,
      message: messages[type][Math.floor(Math.random() * 3)],
      timestamp: new Date(),
      location: locations[Math.floor(Math.random() * locations.length)],
      helmetId: helmetIds[Math.floor(Math.random() * helmetIds.length)],
      acknowledged: false,
      smsSent: severity === 'critical',
      firebaseLogged: true,
    };
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!liveMode) return;

    const alertInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        const newAlert = generateRandomAlert();
        setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
        setNewAlertPulse(true);
        setTimeout(() => setNewAlertPulse(false), 2000);
        setMetrics(prev => ({ ...prev, totalAlerts: prev.totalAlerts + 1 }));
      }
    }, 8000);

    const helmetInterval = setInterval(() => {
      setHelmets(prev => prev.map(h => ({
        ...h,
        drowsinessScore: h.isActive
          ? Math.max(0, Math.min(100, h.drowsinessScore + (Math.random() - 0.48) * 10))
          : h.drowsinessScore,
        battery: h.isActive
          ? Math.max(0, h.battery - Math.random() * 0.1)
          : h.battery,
        lastSeen: h.isActive ? new Date() : h.lastSeen,
        accelerometerData: h.isActive ? {
          x: parseFloat(((Math.random() - 0.5) * 1.5).toFixed(2)),
          y: parseFloat(((Math.random() - 0.5) * 1.5).toFixed(2)),
          z: parseFloat((9.8 + (Math.random() - 0.5) * 0.4).toFixed(2)),
        } : h.accelerometerData,
      })));
    }, 3000);

    const historyInterval = setInterval(() => {
      setDetectionHistory(prev => {
        const newPoint: DetectionEvent = {
          timestamp: new Date(),
          drowsinessLevel: Math.floor(Math.random() * 80) + 5,
          alcoholLevel: parseFloat((Math.random() * 0.08).toFixed(3)),
          accidentRisk: Math.floor(Math.random() * 60) + 5,
        };
        return [...prev.slice(1), newPoint];
      });
    }, 5000);

    const metricsInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        firebaseEvents: prev.firebaseEvents + Math.floor(Math.random() * 3),
        smsSent: prev.smsSent + (Math.random() < 0.1 ? 1 : 0),
      }));
    }, 4000);

    return () => {
      clearInterval(alertInterval);
      clearInterval(helmetInterval);
      clearInterval(historyInterval);
      clearInterval(metricsInterval);
    };
  }, [liveMode, generateRandomAlert]);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const sendTestSms = useCallback((helmetId: string) => {
    setMetrics(prev => ({ ...prev, smsSent: prev.smsSent + 1 }));
    const newAlert: Alert = {
      id: `ALT-TEST-${Date.now()}`,
      type: 'system',
      severity: 'info',
      message: `Test SMS sent for ${helmetId} — Twilio API responded 200 OK`,
      timestamp: new Date(),
      helmetId,
      acknowledged: false,
      smsSent: true,
      firebaseLogged: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  return {
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
  };
}
