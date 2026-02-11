
import React, { useState, useEffect } from 'react';
import { Save, Cloud, Database, FileText, CheckCircle2, AlertCircle, Zap, Terminal, Copy, ClipboardCheck, Wifi, WifiOff, ExternalLink, RefreshCw, Info, ArrowRight, MousePointer2, List, AlertTriangle, RotateCcw } from 'lucide-react';
import { saveConfig, SyncConfig, getDebugInfo, processCsvData, DEFAULT_CONFIG } from '../services/syncService';

interface SettingsViewProps {
  onSyncNow: () => void;
  onManualData?: (data: any[]) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onSyncNow, onManualData }) => {
  const [config, setConfig] = useState<SyncConfig>(DEFAULT_CONFIG);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [debugData, setDebugData] = useState(getDebugInfo());
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [manualText, setManualText] = useState("");
  const [showMappings, setShowMappings] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('vms_sync_config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          mappings: { ...DEFAULT_CONFIG.mappings, ...(parsed.mappings || {}) }
        });
      } catch (e) {
        console.error("Config load failed", e);
      }
    }
    
    const interval = setInterval(() => {
      setDebugData(getDebugInfo());
      setIsOnline(navigator.onLine);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    saveConfig(config);
    
    setTimeout(() => {
      setSaveStatus('saved');
      onSyncNow();
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset to default IDs?")) {
      setConfig(DEFAULT_CONFIG);
      saveConfig(DEFAULT_CONFIG);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      onSyncNow();
    }
  };

  const handleManualSync = () => {
    if (!manualText) return;
    try {
      const visitors = processCsvData(manualText);
      if (onManualData) onManualData(visitors);
      alert(`Success! Manually synced ${visitors.length} visitors.`);
      setManualText("");
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const copyDebugInfo = () => {
    const text = `LOGS:\n${debugData.logs.join('\n')}\n\nRAW RESPONSE:\n${debugData.lastRawResponse}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateMapping = (field: keyof SyncConfig['mappings'], val: string) => {
    setConfig({
      ...config,
      mappings: { ...config.mappings, [field]: val }
    });
  };

  const hasSyncError = debugData.logs.some(log => log.toLowerCase().includes('failed') || log.toLowerCase().includes('error'));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {hasSyncError && (
        <div className="bg-rose-600 text-white p-6 rounded-3xl border-4 border-rose-800 shadow-xl flex items-start gap-4">
          <AlertTriangle size={48} className="shrink-0" />
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Sync Problem!</h3>
            <p className="text-sm font-bold mt-1">Check Guide Method A or B for correct Sheet sharing.</p>
          </div>
        </div>
      )}

      <div className={`p-4 rounded-2xl flex items-center justify-between border ${isOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
        <div className="flex items-center gap-3">
          {isOnline ? <Wifi size={20} className="text-emerald-500" /> : <WifiOff size={20} className="text-rose-500" />}
          <div>
            <p className="text-sm font-bold">{isOnline ? 'Internet Active' : 'Offline'}</p>
            <p className="text-[10px] opacity-70">Cloud Sync Monitoring Active</p>
          </div>
        </div>
        <button onClick={onSyncNow} className="p-2 hover:bg-white rounded-lg transition-all text-indigo-600">
           <RefreshCw size={18} className={saveStatus === 'saving' ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Cloud className="text-indigo-400" /> Cloud Sync Config
            </h3>
            <p className="text-slate-400 text-sm mt-1">Master Settings for Sheet & Form</p>
          </div>
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
              saveStatus === 'saved' ? 'bg-emerald-500 text-white scale-105' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? <><CheckCircle2 size={18}/> Updated</> : <><Save size={18}/> Save Config</>}
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Database size={16} /> Google Sheet ID
              </label>
              <input 
                type="text" 
                value={config.sheetId}
                onChange={(e) => setConfig({...config, sheetId: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                placeholder="Paste Sheet ID here..."
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Zap size={16} className="text-amber-500" /> Apps Script URL (Method A)
              </label>
              <input 
                type="text" 
                value={config.appsScriptUrl}
                onChange={(e) => setConfig({...config, appsScriptUrl: e.target.value})}
                className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-mono"
                placeholder="Paste Web App URL here..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <FileText size={16} /> Google Form ID (Method B)
            </label>
            <input 
              type="text" 
              value={config.formId}
              onChange={(e) => setConfig({...config, formId: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
              placeholder="Paste Form ID here..."
            />
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => setShowMappings(!showMappings)}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-all"
              >
                <List size={16} /> {showMappings ? 'Hide' : 'Show'} Field Mappings
              </button>
              
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-700 transition-all px-3 py-1.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>
            
            {showMappings && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                {(Object.keys(config.mappings) as Array<keyof SyncConfig['mappings']>).map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{key}</label>
                    <input 
                      type="text" 
                      value={config.mappings[key]}
                      onChange={(e) => updateMapping(key, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sync Engine Logs</h4>
            <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[10px] h-40 overflow-y-auto text-emerald-400 space-y-1 border border-slate-700">
               {debugData.logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
            <button 
             onClick={copyDebugInfo}
             className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200"
            >
              {copied ? "Copied!" : "Copy Diagnostic Info"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
