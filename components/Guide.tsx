
import React from 'react';
import { 
  CheckCircle2, 
  PlayCircle,
  AlertTriangle,
  Layout,
  Settings as SettingsIcon,
  ExternalLink,
  Info,
  PartyPopper,
  Link as LinkIcon,
  Search,
  Terminal
} from 'lucide-react';

const Guide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12 pb-32">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-full text-xs font-bold mb-4 border border-rose-100 uppercase tracking-widest">
          <AlertTriangle size={14} /> Troubleshooting Mode
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Workflow Debugging Guide</h2>
        <p className="text-slate-500 text-lg font-medium">Agar "Red X" aa raha hai, toh asli wajah yahan check karein.</p>
      </div>

      {/* HOW TO READ LOGS */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border border-slate-700">
        <div className="flex items-center gap-4 mb-8">
          <Terminal size={32} className="text-indigo-400" />
          <h3 className="text-xl font-black uppercase tracking-tight">Asli Error Kaise Dekhein?</h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
             <div className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
             <p className="text-sm"><b>Actions</b> tab mein jayein aur us failed run (Red X) par click karein.</p>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
             <div className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
             <p className="text-sm">Left side mein <b>"build"</b> job par click karein.</p>
          </div>
          <div className="flex items-start gap-4 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
             <div className="bg-rose-600 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
             <p className="text-sm">Wahan <b>"Run npm run build"</b> wala step kholiye. Wahan lal rang mein likha hoga ki kya cheez missing hai.</p>
          </div>
        </div>
      </section>

      {/* QUICK FIXES */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <Info size={28} className="text-indigo-600" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sahi Tarika (Best Practice)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-6 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Build Config</p>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Maine <code className="bg-white px-1">vite.config.ts</code> aur <code className="bg-white px-1">index.html</code> ko update kiya hai. Ab ye GitHub ke "Build" process ke liye compatible hain.
              </p>
           </div>
           <div className="p-6 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Step</p>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Sare badlav apply karke GitHub par <b>Commit</b> karein. Naya run automatically shuru ho jayega.
              </p>
           </div>
        </div>
      </section>

      {/* SUCCESS CHECK */}
      <section className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <CheckCircle2 size={32} className="text-emerald-200" />
          <h3 className="text-xl font-black uppercase tracking-tight">Run Green Hone Par</h3>
        </div>
        <p className="text-sm font-bold mb-4">Settings > Pages mein jayein, aapko apna live link wahan mil jayega:</p>
        <div className="bg-black/20 p-4 rounded-2xl font-mono text-[11px] break-all border border-white/20">
           https://ajayghase-cmyk.github.io/New-Satsangi-entry-system/
        </div>
      </section>
    </div>
  );
};

export default Guide;
