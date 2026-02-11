
import React, { useState } from 'react';
import { Printer, Trash2, Search, Plus, Trash, UserSearch } from 'lucide-react';
import { Visitor } from '../types';
import { formatDateToCustom } from '../services/syncService';

interface PrintManagerProps {
  queue: Visitor[];
  allVisitors: Visitor[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onAdd: (visitor: Visitor) => void;
}

const PrintManager: React.FC<PrintManagerProps> = ({ queue, allVisitors, onRemove, onClear, onAdd }) => {
  const [search, setSearch] = useState('');

  const searchResults = allVisitors.filter(v => {
    const term = search.toLowerCase();
    return search.length > 1 && 
    (v.name.toLowerCase().includes(term) || 
     v.phone.includes(term) || 
     v.aadharNo.includes(term)) &&
    !queue.find(qv => qv.id === v.id);
  }).slice(0, 10);

  const printBatch = () => {
    if (queue.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cardsHtml = queue.map(v => {
      const cleanAadhar = v.aadharNo.replace(/-/g, '');
      const maskedAadhar = cleanAadhar.length >= 12 
        ? `XXXX-XXXX-${cleanAadhar.slice(-4)}`
        : v.aadharNo.replace(/\d(?=\d{4})/g, "X");

      return `
        <div class="label">
          <div class="header">
            <h1>VISITOR CARD</h1>
          </div>
          <div class="content">
            <div class="item"><span class="lbl">NAME:</span> <span class="val" style="font-size: 10.5pt; font-weight: 900;">${v.name}</span></div>
            <div class="item"><span class="lbl">PLACE:</span> <span class="val">${v.place}</span></div>
            <div class="item"><span class="lbl">AADHAR:</span> <span class="val">${maskedAadhar}</span></div>
            <div class="item"><span class="lbl">LEADER:</span> <span class="val">${v.groupLeader || '-'}</span></div>
            <div class="item"><span class="lbl">JKP ID:</span> <span class="val">${v.jkpId || '-'}</span></div>
            <div class="item"><span class="lbl">DATES:</span> <span class="val">${formatDateToCustom(v.fromDate)} to ${formatDateToCustom(v.toDate)}</span></div>
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Batch Print (${queue.length} Cards)</title>
          <style>
            @page { size: 70mm 45mm; margin: 0; }
            html, body { margin: 0; padding: 0; background: #fff; font-family: 'Helvetica', sans-serif; }
            .label {
              width: 70mm; height: 45mm; padding: 3mm 4mm; box-sizing: border-box;
              display: flex; flex-direction: column; page-break-after: always;
              overflow: hidden;
            }
            .header { border-bottom: 1.2pt solid #000; margin-bottom: 2mm; padding-bottom: 0.8mm; flex-shrink: 0; }
            .header h1 { margin: 0; font-size: 13pt; text-transform: uppercase; font-weight: 900; }
            .content { font-size: 8.5pt; display: flex; flex-direction: column; gap: 0.8mm; flex: 1; overflow: hidden; }
            .item { display: flex; align-items: baseline; }
            .lbl { width: 17mm; font-weight: 900; flex-shrink: 0; text-transform: uppercase; font-size: 7.5pt; }
            .val { flex: 1; font-weight: 500; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
            @media print { html, body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${cardsHtml}
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight"><Printer size={28} /> Print Manager</h2>
          <p className="opacity-80 text-sm mt-1">Staging for TSC Labels (Batch Printing)</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClear} 
            disabled={queue.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            <Trash2 size={16} /> Empty List
          </button>
          <button 
            onClick={printBatch}
            disabled={queue.length === 0}
            className="flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-50 active:scale-95"
          >
            <Printer size={16} /> Print All ({queue.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserSearch size={16} className="text-indigo-500" /> Search Pool
            </h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Name, Phone or Aadhar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map(v => (
                  <button 
                    key={v.id} 
                    onClick={() => { onAdd(v); setSearch(''); }}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl transition-all group"
                  >
                    <div className="text-left overflow-hidden">
                      <p className="text-sm font-bold text-slate-700 truncate">{v.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{v.place} • {v.phone}</p>
                    </div>
                    <Plus size={16} className="text-indigo-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                  </button>
                ))
              ) : search.length > 1 ? (
                <p className="text-xs text-slate-400 text-center py-4 italic">No matches found in pool</p>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 italic">Type to find visitors to print...</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selected for Print</span>
              <span className="text-xs font-medium text-slate-400">{queue.length} labels in queue</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {queue.length === 0 ? (
                <div className="p-20 text-center">
                  <Printer className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 text-sm font-medium">No visitors selected</p>
                  <p className="text-xs text-slate-300 mt-1">Search or register visitors to build your list</p>
                </div>
              ) : (
                queue.map((v, i) => (
                  <div key={v.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <span className="text-xs font-mono text-slate-300 w-6 shrink-0">{i + 1}</span>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 truncate">{v.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{v.place} • {v.phone} • {v.event}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemove(v.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all ml-4 shrink-0"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintManager;
