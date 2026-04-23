import { useState } from 'react';
import { Cpu, Play, Eye, Zap, Wind, CheckCircle, Code, Terminal, AlertCircle } from 'lucide-react';
import { DetectionEvent } from '../types';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

interface AIDetectionPageProps {
  detectionHistory: DetectionEvent[];
}

const codeSnippets = {
  drowsiness: `# drowsiness_detection.py
import cv2, mediapipe as mp
from scipy.spatial import distance

mp_face = mp.solutions.face_mesh
face_mesh = mp_face.FaceMesh(
    min_detection_confidence=0.5
)

def eye_aspect_ratio(eye):
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def detect_drowsiness(frame):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)
    if results.multi_face_landmarks:
        # Extract eye landmarks & compute EAR
        ear = eye_aspect_ratio(get_eye_points(...))
        if ear < 0.25:  # Threshold
            return {"drowsy": True, "ear": ear}
    return {"drowsy": False, "ear": 1.0}`,

  accident: `# accident_classifier.py
import numpy as np
from scipy import signal

ACCEL_THRESHOLD = 4.0  # G-force
WINDOW_SIZE = 50

def classify_accident(accel_buffer):
    """
    Analyzes accelerometer data for
    sudden impact patterns.
    """
    magnitude = np.sqrt(
        accel_buffer[:, 0]**2 +
        accel_buffer[:, 1]**2 +
        accel_buffer[:, 2]**2
    )
    # Detect sudden spike using peak finder
    peaks, props = signal.find_peaks(
        magnitude,
        height=ACCEL_THRESHOLD,
        distance=10
    )
    if len(peaks) > 0:
        max_g = np.max(magnitude[peaks])
        return {
            "accident_detected": True,
            "max_g_force": float(max_g),
            "confidence": min(max_g / 10.0, 1.0)
        }
    return {"accident_detected": False}`,

  alcohol: `# alcohol_detector.py
import serial, time

SENSOR_PORT = '/dev/ttyUSB0'
BAC_THRESHOLD = 0.04  # Legal limit

class AlcoholSensor:
    def __init__(self):
        self.ser = serial.Serial(
            SENSOR_PORT, 9600, timeout=2
        )

    def read_bac(self):
        """Read MQ-3 sensor via Arduino"""
        self.ser.write(b'READ\\n')
        time.sleep(0.1)
        raw = self.ser.readline().decode().strip()
        voltage = float(raw) * (5.0 / 1023.0)
        # Convert voltage to BAC estimate
        bac = self._voltage_to_bac(voltage)
        return {
            "bac": round(bac, 3),
            "alert": bac > BAC_THRESHOLD,
            "raw_voltage": voltage
        }`,
};

type AiModule = 'drowsiness' | 'accident' | 'alcohol';

export default function AIDetectionPage({ detectionHistory }: AIDetectionPageProps) {
  const [activeModule, setActiveModule] = useState<AiModule>('drowsiness');
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const chartData = detectionHistory.slice(-20).map(d => ({
    time: format(d.timestamp, 'HH:mm'),
    drowsiness: Math.round(d.drowsinessLevel),
    alcohol: parseFloat((d.alcoholLevel * 100).toFixed(2)),
    risk: Math.round(d.accidentRisk),
  }));

  const handleTest = async (module: AiModule) => {
    setIsRunning(true);
    setTestResult(null);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    const results = {
      drowsiness: '{"drowsy": false, "ear": 0.31, "perclos": 0.12, "yawn_count": 1, "confidence": 0.87}',
      accident: '{"accident_detected": false, "max_g_force": 1.02, "pattern": "normal_riding", "confidence": 0.94}',
      alcohol: '{"bac": 0.00, "alert": false, "raw_voltage": 0.42, "sensor_status": "OK"}',
    };
    setTestResult(results[module]);
    setIsRunning(false);
  };

  const modules = [
    {
      id: 'drowsiness' as AiModule,
      label: 'Drowsiness Detection',
      emoji: '😴',
      icon: Eye,
      color: 'amber',
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      activeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      status: 'connected',
      accuracy: '94.2%',
      tech: 'MediaPipe FaceMesh · EAR Algorithm · PERCLOS',
      desc: 'Real-time eye tracking using MediaPipe FaceMesh. Computes Eye Aspect Ratio (EAR) and PERCLOS to detect fatigue-induced eye closure patterns.',
    },
    {
      id: 'accident' as AiModule,
      label: 'Accident Detection',
      emoji: '🚨',
      icon: Zap,
      color: 'red',
      colorClass: 'text-red-400 bg-red-500/10 border-red-500/20',
      activeClass: 'bg-red-500/15 border-red-500/30 text-red-300',
      status: 'connected',
      accuracy: '91.8%',
      tech: 'IMU Sensor · MPU-6050 · Peak Detection',
      desc: 'Analyzes 3-axis accelerometer data from MPU-6050 IMU to detect sudden G-force spikes and impact patterns indicating a crash.',
    },
    {
      id: 'alcohol' as AiModule,
      label: 'Alcohol Detection',
      emoji: '🍺',
      icon: Wind,
      color: 'orange',
      colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      activeClass: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
      status: 'pending',
      accuracy: '88.5%',
      tech: 'MQ-3 Gas Sensor · Arduino · Serial Communication',
      desc: 'MQ-3 alcohol gas sensor interfaced via Arduino. Reads breath alcohol concentration and converts voltage to BAC percentage.',
    },
  ];

  const activeModuleData = modules.find(m => m.id === activeModule)!;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          AI Detection Modules
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">OpenCV + MediaPipe + IMU Sensor Integration</p>
      </div>

      {/* Module Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {modules.map(module => {
          const isActive = activeModule === module.id;
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${isActive ? module.activeClass + ' border' : 'bg-gray-900/60 border-gray-800/60 hover:bg-gray-900'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{module.emoji}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${module.status === 'connected' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'}`}>
                  {module.status === 'connected' ? '● Connected' : '◐ Pending'}
                </span>
              </div>
              <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>{module.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">Accuracy: <span className="text-emerald-400 font-medium">{module.accuracy}</span></p>
            </button>
          );
        })}
      </div>

      {/* Active Module Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Info + Test */}
        <div className="bg-gray-900/80 border border-gray-800/60 rounded-2xl p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xl">{activeModuleData.emoji}</span>
              <h3 className="text-white font-bold">{activeModuleData.label}</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{activeModuleData.desc}</p>
          </div>

          <div className="p-3 rounded-xl bg-gray-800/50 space-y-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Technology Stack</p>
            <p className="text-sm text-cyan-300 font-mono">{activeModuleData.tech}</p>
          </div>

          {/* Flask API Route */}
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">Flask API Endpoint</p>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">POST</span>
              <span className="text-sm text-blue-300 font-mono">/api/ai/{activeModule}</span>
            </div>
          </div>

          {/* Test Button */}
          <button
            onClick={() => handleTest(activeModule)}
            disabled={isRunning}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
              isRunning
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                Running Detection...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Test Detection Endpoint
              </>
            )}
          </button>

          {/* Test Result */}
          {testResult && (
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Response — 200 OK</span>
              </div>
              <pre className="text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>

        {/* Code Preview */}
        <div className="bg-gray-950 border border-gray-800/60 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/60 bg-gray-900/50">
            <Code className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-400 font-medium">{activeModule}_detection.py</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
          </div>
          <div className="p-4 overflow-auto max-h-80">
            <pre className="text-xs font-mono text-gray-300 leading-relaxed">
              {codeSnippets[activeModule].split('\n').map((line, i) => (
                <div key={i} className="flex">
                  <span className="text-gray-700 select-none w-7 flex-shrink-0 text-right mr-4">{i + 1}</span>
                  <span className={
                    line.startsWith('#') ? 'text-gray-600' :
                    line.includes('def ') || line.includes('class ') ? 'text-blue-400' :
                    line.includes('import') ? 'text-purple-400' :
                    line.includes('"') || line.includes("'") ? 'text-emerald-400' :
                    line.includes('return') ? 'text-amber-400' :
                    'text-gray-300'
                  }>{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>

      {/* Live Detection Chart */}
      <div className="bg-gray-900/80 border border-gray-800/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-400" />
              Live AI Output — Last 20 Readings
            </h3>
            <p className="text-xs text-gray-500">Streaming from all connected helmets</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Streaming</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', fontSize: '11px' }} />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Alert Threshold', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} />
            <Line type="monotone" dataKey="drowsiness" stroke="#f59e0b" strokeWidth={2} dot={false} name="Drowsiness %" />
            <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={false} name="Accident Risk %" />
            <Line type="monotone" dataKey="alcohol" stroke="#f97316" strokeWidth={2} dot={false} name="Alcohol (×100)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Integration Status */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300 mb-1">AI Module → Flask Integration Pending</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              The AI scripts in <code className="bg-gray-800 px-1 py-0.5 rounded text-amber-300">/ai_module/</code> are standalone. Next step: add a WebSocket or HTTP POST call from each Python script to Flask endpoint (e.g., <code className="bg-gray-800 px-1 py-0.5 rounded text-blue-300">POST /api/ai/drowsiness</code>) with the detection result JSON. Flask will then trigger Firebase logging and Twilio SMS automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
