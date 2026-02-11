
import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  FileSpreadsheet, 
  Globe, 
  ShieldCheck,
  MonitorSmartphone,
  Zap,
  Copy,
  ClipboardCheck,
  ListChecks,
  Monitor,
  Share2,
  Server
} from 'lucide-react';

const Guide: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const fields = [
    "Name", "Gender", "Age", "Place", "Aadhar No", "Group Leader", 
    "JKP ID", "From Date", "To Date", "AM/PM", "Phone", "Event", 
    "No of Days", "Amount"
  ];

  const appsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var data = JSON.parse(e.postData.contents);
    var timestamp = Utilities.formatDate(new Date(), "GMT+5:30", "dd/MM/yyyy HH:mm:ss");

    sheet.appendRow([
      timestamp,
      data.name,
      data.gender,
      data.age,
      data.place,
      data.aadharNo,
      data.groupLeader,
      data.jkpId,
      data.fromDate,
      data.toDate,
      data.amPm,
      data.phone,
      data.event,
      data.noOfDays,
      data.amount
    ]);
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12 pb-32">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold mb-4 border border-indigo-100 uppercase tracking-widest">
          <MonitorSmartphone size={14} /> System Configuration
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">System Setup Guide</h2>
        <p className="text-slate-500 text-lg">Follow these steps to enable multi-PC cloud synchronization.</p>
      </div>

      {/* NEW SECTION: MULTI-PC SHARING */}
      <section className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Share2 className="text-white" size={32} />
          <h3 className="text-2xl font-black uppercase tracking-tight">How to run on other PCs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2"><Server size={18} /> Option 1: Web Hosting (Best)</h4>
            <p className="text-sm text-emerald-50">Is app ke files ko <b>GitHub Pages</b> ya <b>Vercel</b> par upload karein. Aapko ek permanent link mil jayega jise kisi bhi PC par khola ja sakta hai.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2"><Monitor size={18} /> Option 2: Pre-Configure IDs</h4>
            <p className="text-sm text-emerald-50">`services/syncService.ts` mein <b>DEFAULT_CONFIG</b> ke andar apni Sheet ID aur Apps Script URL fix kar dein. Isse har naye PC par settings nahi daalni padegi.</p>
          </div>
        </div>
      </section>

      <section className="bg-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-amber-400" size={32} />
            <h3 className="text-2xl font-black uppercase tracking-tight">Method A: Apps Script (RECOMMENDED)</h3>
          </div>
          <p className="text-indigo-100 mb-8 font-medium italic">Direct Cloud Saving: Har entry turant Sheet mein save hoti hai.</p>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center font-bold shrink-0">1</div>
              <p className="text-sm">Google Sheet mein <b>Extensions > Apps Script</b> kholiye.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <p className="text-sm mb-3">Ye code paste karein:</p>
                <div className="relative bg-slate-950 p-4 rounded-xl border border-white/10 font-mono text-[10px] text-emerald-400">
                  <pre className="whitespace-pre-wrap">{appsScriptCode}</pre>
                  <button 
                    onClick={copyCode}
                    className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  >
                    {copied ? <ClipboardCheck size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center font-bold shrink-0">3</div>
              <p className="text-sm"><b>Deploy > New Deployment</b> karein. <b>Web App</b> select karein. Access: <b>Anyone</b>.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 bg-slate-900 text-white flex items-center gap-4">
          <div className="bg-emerald-500 p-2 rounded-lg"><FileSpreadsheet size={24} /></div>
          <div>
            <h3 className="font-bold text-lg">Sheet Setup</h3>
          </div>
        </div>
        <div className="p-8 space-y-4">
          <p className="text-sm text-slate-600">Ensure these columns exist in Row 1 of your Sheet:</p>
          <div className="flex flex-wrap gap-2">
            {["Timestamp", ...fields].map(f => (
              <span key={f} className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600">{f}</span>
            ))}
          </div>
          <div className="pt-4 space-y-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Crucial Step:</p>
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <ArrowRight size={14} className="text-indigo-500" /> <b>File > Share > Publish to Web > CSV</b> (Necessary for reading data).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Guide;
