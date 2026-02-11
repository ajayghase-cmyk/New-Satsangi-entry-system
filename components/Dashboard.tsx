
import React, { useState } from 'react';
import { Users, LogIn, Calendar, DollarSign, Printer, Edit2, IdCard, ListPlus, Database, X, Eye, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { Visitor, VisitorStatus } from '../types';
import { formatDateToCustom, getSpreadsheetUrl } from '../services/syncService';

interface DashboardProps {
  visitors: Visitor[];
  onCheckOut: (id: string) => void;
  onEdit: (visitor: Visitor) => void;
  onAddToQueue: (visitor: Visitor) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ visitors, onCheckOut, onEdit, onAddToQueue }) => {
  const [showSheetData, setShowSheetData] = useState(false);
  
  const activeVisitors = visitors.filter(v => v.status === VisitorStatus.IN);
  const totalRevenue = visitors.reduce((sum, v) => sum + v.amount, 0);
  const lastVisitor = visitors[0]; 

  const printTSCLabel = (v: Visitor) => {
    const cleanAadhar = v.aadharNo.replace(/-/g, '');
    const maskedAadhar = cleanAadhar.length >= 12 
      ? `XXXX-XXXX-${cleanAadhar.slice(-4)}`
      : v.aadharNo.replace(/\d(?=\d{4})/g, "X");

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Card - ${v.name}</title>
          <style>
            @page { size: 70mm 45mm; margin: 0; }
            html, body { margin: 0; padding: 0; width: 70mm; height: 45mm; overflow: hidden; background: #fff; font-family: 'Helvetica', sans-serif; box-sizing: border-box; }
            .label { width: 70mm; height: 45mm; padding: 3mm 4mm; box-sizing: border-box; display: flex; flex-direction: column; page-break-after: always; }
            .header { border-bottom: 1.2pt solid #000; margin-bottom: 2mm; padding-bottom: 0.8mm; flex-shrink: 0; }
            .header h1 { margin: 0; font-size: 13pt; text-transform: uppercase; font-weight: 900; }
            .content { display: flex; flex-direction: column; gap: 1mm; flex: 1; overflow: hidden; }
            .item { display: flex; font-size: 8.5pt; line-height: 1.1; align-items: baseline; }
            .lbl { font-weight: 900; width: 17mm; flex-shrink: 0; text-transform: uppercase; font-size: 7.5pt; }
            .val { flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-weight: 500; }
            @media print { html, body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header"><h1>VISITOR CARD</h1></div>
            <div class="content">
              <div class="item"><span class="lbl">NAME:</span> <span class="val" style="font-size: 10.5pt; font-weight: 900;">${v.name}</span></div>
              <div class="item"><span class="lbl">PLACE:</span> <span class="val">${v.place}</span></div>
              <div class="item"><span class="lbl">AADHAR:</span> <span class="val">${maskedAadhar}</span></div>
              <div class="item"><span class="lbl">LEADER:</span> <span class="val">${v.groupLeader || '-'}</span></div>
              <div class="item"><span class="lbl">JKP ID:</span> <span class="val">${v.jkpId || '-'}</span></div>
              <div class="item"><span class="lbl">DATES:</span> <span class="val">${formatDateToCustom(v.fromDate)} to ${formatDateToCustom(v.toDate)}</span></div>
            </div>
          </div>
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cloud Database Controls</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live synchronization with Google Sheets</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowSheetData(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 py-3 px-6 bg-slate-900 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 hover:bg-slate-800"
          >
            <Eye size={18} /> View Raw Data
          </button>
          <a 
            href={getSpreadsheetUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 md:flex-none flex items-center justify-center gap-3 py-3 px-6 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 hover:bg-emerald-700"
          >
            <ExternalLink size={18} /> Open Master Sheet
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users size={20} />} title="Cloud Records" value={visitors.length} color="indigo" />
        <StatCard icon={<LogIn size={20} />} title="Current In" value={activeVisitors.length} color="orange" />
        <StatCard icon={<DollarSign size={20} />} title="Total Collection" value={`₹${totalRevenue.toLocaleString()}`} color="emerald" />
        <StatCard icon={<Calendar size={20} />} title="Unique Events" value={new Set(visitors.map(v => v.event)).size} color="violet" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-80 shrink-0">
          <div className="space-y-4 sticky top-8">
            <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl overflow-hidden">
              <div className="bg-indigo-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <IdCard size={20} />
                  <h3 className="font-bold text-lg">Quick Print</h3>
                </div>
                <p className="text-indigo-100 text-xs">Latest cloud record</p>
              </div>
              <div className="p-6">
                {lastVisitor ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Most Recent Entry</p>
                      <h4 className="font-bold text-slate-900 mb-1 truncate">{lastVisitor.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{lastVisitor.place}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => printTSCLabel(lastVisitor)}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                      >
                        <Printer size={18} /> Print Now
                      </button>
                      <button 
                        onClick={() => onAddToQueue(lastVisitor)}
                        className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-2xl font-bold transition-all hover:bg-indigo-50"
                      >
                        <ListPlus size={18} /> Add to Queue
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Printer className="mx-auto text-slate-200 mb-4" size={40} />
                    <p className="text-slate-400 text-sm italic">No records to print</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-800">In-Building Monitor</h3>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                LIVE
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Visitor</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Days</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">No active visitors.</td>
                  </tr>
                ) : (
                  activeVisitors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                            {v.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{v.name}</div>
                            <div className="text-[10px] text-slate-400">{v.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">{v.event}</div>
                        <div className="text-[10px] text-slate-400">{v.place}</div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-sm font-bold text-indigo-600">{v.noOfDays} Days</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onAddToQueue(v)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Add to Queue">
                            <ListPlus size={16} />
                          </button>
                          <button onClick={() => printTSCLabel(v)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Print Now">
                            <Printer size={16} />
                          </button>
                          <button onClick={() => onEdit(v)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => onCheckOut(v.id)} className="px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg border border-red-100">
                            OUT
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showSheetData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8">
          <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Database className="text-indigo-600" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Master Cloud Database</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Viewing {visitors.length} entries directly from Sheet</p>
                </div>
              </div>
              <button onClick={() => setShowSheetData(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                <X size={24} className="text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-slate-100 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                    <th className="px-4 py-3">Sr.</th>
                    <th className="px-4 py-3">Dates (Stay Period)</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Place</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Aadhar</th>
                    <th className="px-4 py-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visitors.map((v, i) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-indigo-700">
                            <Calendar size={12} />
                            {formatDateToCustom(v.fromDate)}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 ml-3.5">
                            <ArrowRight size={10} />
                            {formatDateToCustom(v.toDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-black text-slate-900 uppercase">{v.name}</td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">{v.place}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-600">{v.phone}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-600">{v.aadharNo}</td>
                      <td className="px-4 py-3 text-right text-sm font-black text-indigo-600">₹{v.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
              <span>Cloud Storage Active</span>
              <div className="flex items-center gap-4">
                <a href={getSpreadsheetUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all">
                  <ExternalLink size={14} /> Open Spreadsheet
                </a>
                <button onClick={() => setShowSheetData(false)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">Close Viewer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = React.memo(({ icon, title, value, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100'
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colors[color]}`}>{icon}</div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
});

export default Dashboard;
