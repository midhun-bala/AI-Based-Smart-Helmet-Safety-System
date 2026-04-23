import { useState } from 'react';
import { Code2, CheckCircle, Clock, AlertCircle, Play, Copy, Check } from 'lucide-react';
import { mockApiEndpoints } from '../data/mockData';
import { format } from 'date-fns';

type TestResult = {
  status: number;
  body: string;
  time: number;
} | null;

export default function APIMonitorPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [activeBody, setActiveBody] = useState(`{
  "phone": "+91XXXXXXXXXX",
  "message": "Test alert from SmartHelmet Dashboard"
}`);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTest = async (path: string) => {
    setTesting(path);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const mockResponses: Record<string, { status: number; body: string }> = {
      '/health': { status: 200, body: '{"status": "ok", "flask": "running", "uptime": "2h 34m", "version": "1.0.0"}' },
      '/api/alerts/sms': { status: 200, body: '{"success": true, "sid": "SM1234567890abcdef", "to": "+91XXXXXXXXXX", "status": "queued"}' },
      '/api/ai/drowsiness': { status: 200, body: '{"drowsy": false, "ear": 0.31, "perclos": 0.12, "confidence": 0.94, "timestamp": "2025-01-15T10:30:00Z"}' },
      '/api/ai/accident': { status: 200, body: '{"accident_detected": false, "max_g": 1.02, "pattern": "normal", "confidence": 0.91}' },
      '/api/ai/alcohol': { status: 200, body: '{"bac": 0.00, "alert": false, "sensor_ok": true, "raw_voltage": 0.42}' },
      '/api/firebase/log': { status: 200, body: '{"logged": true, "document_id": "abc123xyz", "collection": "events", "timestamp": "2025-01-15T10:30:00Z"}' },
      '/api/helmets': { status: 501, body: '{"error": "Not implemented", "message": "Endpoint under development"}' },
      '/api/alerts/history': { status: 501, body: '{"error": "Not implemented", "message": "Requires Firebase credentials"}' },
    };
    const resp = mockResponses[path] ?? { status: 404, body: '{"error": "Not found"}' };
    setTestResults(prev => ({
      ...prev,
      [path]: { ...resp, time: Math.round(50 + Math.random() * 400) },
    }));
    setTesting(null);
  };

  const methodColor = {
    GET: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    POST: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    PUT: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    DELETE: 'text-red-400 bg-red-500/15 border-red-500/30',
  };

  const statusColor = (status: number) =>
    status >= 200 && status < 300 ? 'text-emerald-400' : status >= 500 ? 'text-red-400' : 'text-amber-400';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-green-400" />
          API Monitor
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Flask backend at <span className="font-mono text-blue-400">http://127.0.0.1:5000</span></p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-2xl font-bold text-emerald-400">{mockApiEndpoints.filter(e => e.status === 'active').length}</p>
          <p className="text-xs text-gray-500">Active Endpoints</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-2xl font-bold text-amber-400">{mockApiEndpoints.filter(e => e.status === 'pending').length}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
          <p className="text-2xl font-bold text-blue-400">
            {Math.round(mockApiEndpoints.filter(e => e.responseTime).reduce((sum, e) => sum + (e.responseTime ?? 0), 0) / mockApiEndpoints.filter(e => e.responseTime).length)}ms
          </p>
          <p className="text-xs text-gray-500">Avg Response</p>
        </div>
      </div>

      {/* Send SMS Test Panel */}
      <div className="bg-gray-900/80 border border-gray-800/60 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Play className="w-4 h-4 text-blue-400" />
          Live API Tester
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Request Body (JSON)</p>
            <textarea
              value={activeBody}
              onChange={e => setActiveBody(e.target.value)}
              rows={6}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-sm font-mono text-gray-300 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">cURL Command</p>
            <div className="relative bg-gray-950 border border-gray-700 rounded-xl p-3">
              <code className="text-xs text-gray-400 font-mono leading-relaxed">
                curl -X POST http://127.0.0.1:5000/api/alerts/sms \<br />
                {'  '}-H "Content-Type: application/json" \<br />
                {'  '}-d '{JSON.stringify({ phone: "+91XXXXXXXXXX", message: "Test alert!" })}'
              </code>
              <button
                onClick={() => handleCopy(`curl -X POST http://127.0.0.1:5000/api/alerts/sms -H "Content-Type: application/json" -d '${activeBody}'`, 'curl')}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition"
              >
                {copied === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoint List */}
      <div className="space-y-2">
        {mockApiEndpoints.map((ep) => {
          const result = testResults[ep.path];
          const isTesting = testing === ep.path;
          return (
            <div key={ep.path} className={`bg-gray-900/80 border rounded-2xl overflow-hidden transition-all ${ep.status === 'active' ? 'border-gray-800/60' : 'border-amber-900/40'}`}>
              <div className="flex items-center gap-3 p-4">
                {/* Method Badge */}
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex-shrink-0 font-mono ${methodColor[ep.method]}`}>
                  {ep.method}
                </span>

                {/* Path */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm text-white font-mono">{ep.path}</code>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ep.status === 'active' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'}`}>
                      {ep.status === 'active' ? '● Active' : '◐ Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{ep.description}</p>
                </div>

                {/* Meta */}
                <div className="hidden sm:flex items-center gap-4 text-xs text-gray-600 flex-shrink-0">
                  {ep.responseTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ep.responseTime}ms
                    </div>
                  )}
                  {ep.lastCalled && (
                    <span>{format(ep.lastCalled, 'HH:mm:ss')}</span>
                  )}
                </div>

                {/* Test Button */}
                <button
                  onClick={() => handleTest(ep.path)}
                  disabled={isTesting}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition flex-shrink-0 ${
                    isTesting
                      ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                  }`}
                >
                  {isTesting ? (
                    <div className="w-3 h-3 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  {isTesting ? 'Testing...' : 'Test'}
                </button>
              </div>

              {/* Result */}
              {result && (
                <div className={`border-t px-4 py-3 ${result.status >= 200 && result.status < 300 ? 'border-emerald-900/40 bg-emerald-500/5' : 'border-red-900/40 bg-red-500/5'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {result.status >= 200 && result.status < 300
                      ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      : <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                    <span className={`text-xs font-bold ${statusColor(result.status)}`}>
                      HTTP {result.status}
                    </span>
                    <span className="text-xs text-gray-600">· {result.time}ms</span>
                  </div>
                  <div className="relative">
                    <pre className="text-xs font-mono text-gray-300 overflow-x-auto">{result.body}</pre>
                    <button
                      onClick={() => handleCopy(result.body, ep.path)}
                      className="absolute top-0 right-0 w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-white"
                    >
                      {copied === ep.path ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
