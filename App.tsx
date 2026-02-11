
import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  History, 
  BrainCircuit, 
  Search,
  ShieldCheck,
  BookOpen,
  BarChart3,
  RefreshCw,
  Settings,
  Printer,
  Globe,
  CheckCircle2,
  CloudLightning
} from 'lucide-react';
import { Visitor, VisitorStatus } from './types';
import Dashboard from './components/Dashboard';
import CheckInForm from './components/CheckInForm';
import VisitorLog from './components/VisitorLog';
import AIInsights from './components/AIInsights';
import Guide from './components/Guide';
import EventAnalytics from './components/EventAnalytics';
import PrintManager from './components/PrintManager';
import SettingsView from './components/SettingsView';
import { fetchSheetData, submitToGoogleForm, parseCustomDate } from './services/syncService';

const LOCAL_STORAGE_KEY = 'vms_pro_local_data_v2';
const DELETED_IDS_KEY = 'vms_pro_deleted_ids_v2';
const DIRTY_RECORDS_KEY = 'vms_pro_dirty_records_v2';

const SyncStatusIndicator = memo(({ isSyncing, isSilent }: { isSyncing: boolean; isSilent: boolean }) => {
  const [seconds, setSeconds] = useState(10);
  useEffect(() => {
    const timer = setInterval(() => setSeconds(prev => (prev <= 1 ? 10 : prev - 1)), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => { if (isSyncing) setSeconds(10); }, [isSyncing]);

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 ${isSyncing ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}>
      <Globe size={10} className={isSyncing || isSilent ? 'animate-spin' : ''} />
      <span className="uppercase tracking-widest">
        {isSyncing ? 'Syncing...' : isSilent ? 'Live Update' : `Sync in ${seconds}s`}
      </span>
    </div>
  );
});

const App: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [dirtyIds, setDirtyIds] = useState<Map<string, number>>(new Map()); // id -> timestamp
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checkin' | 'logs' | 'ai' | 'guide' | 'events' | 'print-queue' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSilentSyncing, setIsSilentSyncing] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const [printQueue, setPrintQueue] = useState<Visitor[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'cloud'} | null>(null);

  useEffect(() => {
    const storedV2 = localStorage.getItem(LOCAL_STORAGE_KEY);
    const storedV1 = localStorage.getItem('vms_pro_local_data');
    let dataToSet: Visitor[] = [];

    if (storedV2) {
      try { dataToSet = JSON.parse(storedV2); } catch (e) {}
    } else if (storedV1) {
      try { dataToSet = JSON.parse(storedV1); } catch (e) {}
    }

    if (Array.isArray(dataToSet)) {
      setVisitors(dataToSet.sort((a, b) => new Date(b.checkInTimestamp).getTime() - new Date(a.checkInTimestamp).getTime()));
    }

    const storedDeleted = localStorage.getItem(DELETED_IDS_KEY);
    if (storedDeleted) {
      try {
        const parsed = JSON.parse(storedDeleted);
        if (Array.isArray(parsed)) setDeletedIds(new Set(parsed));
      } catch (e) {}
    }

    const storedDirty = localStorage.getItem(DIRTY_RECORDS_KEY);
    if (storedDirty) {
      try {
        const parsed = JSON.parse(storedDirty);
        setDirtyIds(new Map(parsed));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(visitors));
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(deletedIds)));
    localStorage.setItem(DIRTY_RECORDS_KEY, JSON.stringify(Array.from(dirtyIds.entries())));
  }, [visitors, deletedIds, dirtyIds]);

  const mergeAndSetVisitors = useCallback((serverData: Visitor[]) => {
    setVisitors(prev => {
      const now = Date.now();
      const validServerData = serverData.filter(v => !deletedIds.has(v.id));
      const serverFingerprints = new Set(validServerData.map(v => `${v.name}-${v.phone}`.toLowerCase()));
      
      // Clean up old dirty flags (older than 2 minutes)
      const newDirtyIds = new Map(dirtyIds);
      for (const [id, ts] of newDirtyIds.entries()) {
        // Fix: Explicitly cast ts to number to avoid arithmetic operation errors
        if (now - (ts as number) > 120000) newDirtyIds.delete(id);
      }
      setDirtyIds(newDirtyIds);

      // Protect entries that are:
      // 1. Newly created locally (local-)
      // 2. Recently updated locally (in dirtyIds map)
      const pendingLocal = prev.filter(v => {
        const isNew = v.id.startsWith('local-');
        const isRecentlyUpdated = newDirtyIds.has(v.id);
        const isNotOnServerYet = !serverFingerprints.has(`${v.name}-${v.phone}`.toLowerCase());
        
        return isNew || (isRecentlyUpdated && isNotOnServerYet);
      });

      // Filter out server records that conflict with our pending/dirty local records
      const pendingFingerprints = new Set(pendingLocal.map(v => `${v.name}-${v.phone}`.toLowerCase()));
      const filteredServerData = validServerData.filter(v => !pendingFingerprints.has(`${v.name}-${v.phone}`.toLowerCase()));

      const combined = [...pendingLocal, ...filteredServerData];
      
      return combined.sort((a, b) => {
        const timeA = new Date(a.checkInTimestamp).getTime() || 0;
        const timeB = new Date(b.checkInTimestamp).getTime() || 0;
        if (timeA !== timeB) return timeB - timeA;
        
        const visitA = parseCustomDate(a.fromDate)?.getTime() || 0;
        const visitB = parseCustomDate(b.fromDate)?.getTime() || 0;
        return visitB - visitA;
      });
    });
  }, [deletedIds, dirtyIds]);

  const syncWithSheet = useCallback(async (isSilent = false) => {
    if (isSyncing || (isSilent && isSilentSyncing)) return;
    if (isSilent) setIsSilentSyncing(true); else setIsSyncing(true);
    try {
      const sheetData = await fetchSheetData();
      if (sheetData && sheetData.length > 0) {
        mergeAndSetVisitors(sheetData);
      }
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setIsSyncing(false);
      setIsSilentSyncing(false);
    }
  }, [isSyncing, isSilentSyncing, mergeAndSetVisitors]);

  useEffect(() => {
    syncWithSheet(false);
    const interval = setInterval(() => syncWithSheet(true), 15000); 
    return () => clearInterval(interval);
  }, [syncWithSheet]);

  const showToast = (message: string, type: 'success' | 'cloud' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCheckIn = async (formData: Omit<Visitor, 'id' | 'status' | 'checkInTimestamp'>, shouldAddToQueue: boolean, stayOnPage: boolean) => {
    const nowISO = new Date().toISOString();
    const nowTS = Date.now();
    const tempId = editingVisitor?.id || `local-${nowTS}`;
    
    const newVisitor: Visitor = { 
      ...formData, 
      id: tempId, 
      status: VisitorStatus.IN, 
      checkInTimestamp: editingVisitor ? editingVisitor.checkInTimestamp : nowISO 
    };

    // Mark as dirty so sync doesn't overwrite it immediately
    setDirtyIds(prev => new Map(prev).set(tempId, nowTS));

    setVisitors(prev => {
      const filtered = prev.filter(v => v.id !== tempId);
      const newList = [newVisitor, ...filtered];
      return newList.sort((a, b) => new Date(b.checkInTimestamp).getTime() - new Date(a.checkInTimestamp).getTime());
    });

    showToast(editingVisitor ? "Updating in Cloud..." : "Saving to Cloud...", 'cloud');
    setEditingVisitor(null);
    
    const success = await submitToGoogleForm(newVisitor);
    if (success) {
      showToast("Success! Saved to Sheet.", 'success');
      // Delay sync slightly to allow Sheet to update
      setTimeout(() => syncWithSheet(true), 4000);
    } else {
      showToast("Sync Delayed - Retrying in background", 'cloud');
    }

    if (shouldAddToQueue) setPrintQueue(prev => [...prev, newVisitor]);
    if (!stayOnPage) setActiveTab('logs');
  };

  const handleCancelEdit = () => {
    setEditingVisitor(null);
    setActiveTab('logs');
  };

  const handleOpenNewEntry = () => {
    setEditingVisitor(null);
    setActiveTab('checkin');
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Hide this record? (Local view only)")) {
      setDeletedIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setVisitors(prev => prev.filter(v => v.id !== id));
      showToast("Record hidden");
    }
  };

  const filteredVisitors = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return visitors;
    return visitors.filter(v => 
      v.name.toLowerCase().includes(term) || v.phone.includes(term) || v.aadharNo.includes(term)
    );
  }, [visitors, searchTerm]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white fixed h-full hidden lg:block border-r border-slate-800 z-30">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg"><ShieldCheck className="w-6 h-6" /></div>
            <h1 className="text-xl font-bold tracking-tight">Visitor Pro</h1>
          </div>
          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={<UserPlus size={18} />} label={editingVisitor ? "Updating..." : "New Entry"} active={activeTab === 'checkin' && !editingVisitor} onClick={handleOpenNewEntry} />
            <NavItem icon={<Printer size={18} />} label="Print Queue" active={activeTab === 'print-queue'} onClick={() => setActiveTab('print-queue')} badge={printQueue.length || null} />
            <NavItem icon={<History size={18} />} label="History Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} badge={visitors.length} />
            <NavItem icon={<BarChart3 size={18} />} label="Analytics" active={activeTab === 'events'} onClick={() => setActiveTab('events')} />
            <NavItem icon={<BrainCircuit size={18} />} label="AI Insights" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
            <div className="pt-8 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">System</div>
            <NavItem icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            <NavItem icon={<BookOpen size={18} />} label="Setup Guide" active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} />
          </nav>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-4 md:p-8 mb-20 lg:mb-0">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                {editingVisitor ? 'Update Record' : activeTab.replace('-', ' ')}
              </h2>
              <SyncStatusIndicator isSyncing={isSyncing} isSilent={isSilentSyncing} />
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">
              Cloud Master Database • {visitors.length} Total Records
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => syncWithSheet(false)} className="p-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 px-4 h-11 shadow-sm active:scale-95 transition-all group hover:border-indigo-300">
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="text-xs font-bold font-sans">Force Sync</span>
            </button>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Global Search..." className="w-full pl-10 pr-4 py-2 h-11 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </header>

        <div className="max-w-full">
          {activeTab === 'dashboard' && <Dashboard visitors={visitors} onCheckOut={id => setVisitors(v => v.map(vi => vi.id === id ? {...vi, status: VisitorStatus.OUT} : vi))} onEdit={v => { setEditingVisitor(v); setActiveTab('checkin'); }} onAddToQueue={v => setPrintQueue(p => [...p, v])} />}
          {activeTab === 'checkin' && <CheckInForm visitors={visitors} onCheckIn={handleCheckIn} initialData={editingVisitor} onCancel={handleCancelEdit} onEditFromSearch={v => { setEditingVisitor(v); setActiveTab('checkin'); }} />}
          {activeTab === 'logs' && <VisitorLog visitors={filteredVisitors} onEdit={v => { setEditingVisitor(v); setActiveTab('checkin'); }} onDelete={handleDelete} onAddToQueue={v => setPrintQueue(p => [...p, v])} />}
          {activeTab === 'events' && <EventAnalytics visitors={visitors} />}
          {activeTab === 'ai' && <AIInsights visitors={visitors} />}
          {activeTab === 'guide' && <Guide />}
          {activeTab === 'settings' && <SettingsView onSyncNow={() => syncWithSheet(false)} onManualData={mergeAndSetVisitors} />}
          {activeTab === 'print-queue' && <PrintManager queue={printQueue} allVisitors={visitors} onRemove={id => setPrintQueue(q => q.filter(v => v.id !== id))} onClear={() => setPrintQueue([])} onAdd={v => setPrintQueue(p => [...p, v])} />}
        </div>
      </main>

      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-right-10 duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 ${toast.type === 'success' ? 'bg-white border-emerald-500 text-emerald-800' : 'bg-indigo-600 border-indigo-400 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> : <CloudLightning size={20} className="animate-pulse" />}
            <span className="text-sm font-black uppercase tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden flex justify-around py-3 z-50">
        <MobileNavItem icon={<LayoutDashboard size={20} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<UserPlus size={20} />} active={activeTab === 'checkin'} onClick={handleOpenNewEntry} />
        <MobileNavItem icon={<History size={20} />} active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
        <MobileNavItem icon={<Settings size={20} />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, badge }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
    <div className="flex items-center gap-3">{icon} <span className="text-sm font-medium">{label}</span></div>
    {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>{badge}</span>}
  </button>
);

const MobileNavItem = ({ icon, active, onClick }: any) => (
  <button onClick={onClick} className={`p-2 rounded-xl transition-all ${active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>{icon}</button>
);

export default App;
