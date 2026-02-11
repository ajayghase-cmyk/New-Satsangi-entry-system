
import React, { useState, useMemo } from 'react';
import { Download, Printer, Edit2, Database, Calendar, Trash2, ListPlus, MapPin, Phone, Hash, User, Clock, DollarSign, ArrowRight, UserCheck, ShieldCheck, Search, CornerDownRight } from 'lucide-react';
import { Visitor } from '../types';
import { formatDateToCustom } from '../services/syncService';

interface VisitorLogProps {
  visitors: Visitor[];
  onEdit: (visitor: Visitor) => void;
  onDelete: (id: string) => void;
  onAddToQueue: (visitor: Visitor) => void;
}

const VisitorLog: React.FC<VisitorLogProps> = ({ visitors, onEdit, onDelete, onAddToQueue }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [logSearch, setLogSearch] = useState('');

  const filteredVisitors = useMemo(() => {
    return visitors.filter(v => {
      const term = logSearch.toLowerCase();
      const matchesSearch = !term || 
        v.name.toLowerCase().includes(term) || 
        v.phone.includes(term) ||
        v.aadharNo.includes(term);

      if (!matchesSearch) return false;

      if (!startDate && !endDate) return true;
      const vDate = new Date(v.fromDate);
      if (isNaN(vDate.getTime())) return false;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && end) return vDate >= start && vDate <= end;
      if (start) return vDate >= start;
      if (end) return vDate <= end;
      return true;
    });
  }, [visitors, startDate, endDate, logSearch]);

  const exportToCSV = () => {
    const headers = ["Sr No", "Name", "Gender", "Age", "Place", "Phone", "Aadhar No", "G.Leader", "JKP ID", "From Date", "To Date", "AM/PM", "Event", "Days", "Amount"];
    const rows = filteredVisitors.map((v, i) => [
      i + 1, v.name, v.gender, v.age, v.place, v.phone, v.aadharNo, v.groupLeader, v.jkpId, 
      formatDateToCustom(v.fromDate), formatDateToCustom(v.toDate),
      v.amPm, v.event, v.noOfDays, v.amount
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => `"${e.join('","')}"`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `visitor_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border-2 border-slate-600 shadow-2xl overflow-hidden mb-20">
      <div className="p-4 border-b-2 border-slate-600 bg-slate-200 flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="bg-slate-900 p-2.5 rounded-lg text-white shadow-md">
            <Database size={24} />
          </div>
          <div className="shrink-0">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">Master Logs</h3>
            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mt-1">Total: {filteredVisitors.length}</p>
          </div>
          <div className="relative flex-1 xl:w-64 xl:ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search Name or Phone..." 
              className="w-full pl-10 pr-4 py-2 bg-white border-2 border-slate-400 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border-2 border-slate-400 shadow-sm overflow-hidden">
            <Calendar size={16} className="text-slate-500 ml-1" />
            <input type="date" className="text-[10px] font-black outline-none bg-transparent" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span className="text-slate-400 font-black text-[9px]">TO</span>
            <input type="date" className="text-[10px] font-black outline-none bg-transparent" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg hover:bg-indigo-800 transition-all active:scale-95 uppercase tracking-widest">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400">
        <table className="w-full text-left min-w-[1050px] border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest font-black">
              <th className="px-2 py-4 border-r border-slate-700 w-10 text-center">Sr.</th>
              <th className="px-3 py-4 border-r border-slate-700 w-44">Visitor Details</th>
              <th className="px-3 py-4 border-r border-slate-700 w-36 text-center">Contact / Ph</th>
              <th className="px-2 py-4 border-r border-slate-700 w-24">Place</th>
              <th className="px-3 py-4 border-r border-slate-700 w-40">Stay (From - To)</th>
              <th className="px-1 py-4 border-r border-slate-700 w-14 text-center">AM/PM</th>
              <th className="px-1 py-4 border-r border-slate-700 w-14 text-center">Ev</th>
              <th className="px-2 py-4 border-r border-slate-700 w-20 text-right">Amt (₹)</th>
              <th className="px-3 py-4 border-r border-slate-700 w-36">Leader & ID</th>
              <th className="px-2 py-4 border-slate-700 w-28 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-600">
            {filteredVisitors.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-24 text-center text-slate-400 font-black text-xl italic bg-slate-50">
                  <Database size={60} className="mx-auto mb-4 opacity-10" />
                  No matching visitor records found.
                </td>
              </tr>
            ) : (
              filteredVisitors.map((v, i) => (
                <tr key={v.id} className="hover:bg-indigo-50/50 transition-colors border-b-2 border-slate-600 align-middle">
                  <td className="px-1 py-3 text-slate-900 font-black text-xs border-r-2 border-slate-600 text-center bg-slate-100">
                    {i + 1}
                  </td>
                  <td className="px-3 py-3 border-r-2 border-slate-600">
                    <div className="overflow-hidden">
                      <p className="uppercase truncate text-xs leading-tight font-black text-slate-900">{v.name}</p>
                      <p className="text-[9px] text-indigo-700 font-black uppercase mt-0.5">{v.gender} • {v.age}Y</p>
                    </div>
                  </td>
                  <td className="px-2 py-3 border-r-2 border-slate-600 text-center font-black">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-900">
                      <Phone size={10} className="text-indigo-600 shrink-0" />
                      <span className="whitespace-nowrap">{v.phone || 'N/A'}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5 tracking-tighter">{v.aadharNo || 'NO-ID'}</p>
                  </td>
                  <td className="px-2 py-3 border-r-2 border-slate-600 overflow-hidden">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin size={10} className="text-rose-500 shrink-0" />
                      <span className="uppercase text-[10px] font-black text-slate-700 truncate">{v.place}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 border-r-2 border-slate-600 bg-slate-50/30">
                    <div className="flex flex-col gap-0.5 py-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-600 shrink-0" />
                        <span className="text-[12px] font-black text-indigo-700 leading-none">
                          {formatDateToCustom(v.fromDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <ArrowRight size={10} className="text-slate-300 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-500 leading-none">
                          {formatDateToCustom(v.toDate)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-0 py-3 border-r-2 border-slate-600 text-center">
                    <div className={`inline-block px-1 py-0.5 rounded text-[9px] font-black border ${v.amPm === 'AM' ? 'bg-sky-50 text-sky-800 border-sky-400' : 'bg-orange-50 text-orange-800 border-orange-400'}`}>
                      {v.amPm}
                    </div>
                  </td>
                  <td className="px-0 py-3 border-r-2 border-slate-600 text-center">
                    <span className="px-1 py-0.5 bg-slate-900 text-white rounded-[2px] text-[8px] font-black uppercase inline-block leading-tight">
                      {v.event}
                    </span>
                  </td>
                  <td className="px-2 py-3 border-r-2 border-slate-600 text-right bg-emerald-50/20">
                    <div className="font-black text-slate-900 text-xs leading-none">
                      ₹{v.amount.toLocaleString()}
                    </div>
                    <div className="text-[8px] font-black text-emerald-700 uppercase mt-0.5">{v.noOfDays}D</div>
                  </td>
                  <td className="px-3 py-3 border-r-2 border-slate-600">
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <div className="flex items-center gap-1 truncate">
                        <UserCheck size={10} className="text-indigo-600 shrink-0" /> 
                        <span className="font-black uppercase text-[10px] text-slate-800 truncate">{v.groupLeader || 'SELF'}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono font-black ml-4">
                        {v.jkpId || 'NO-JKP'}
                      </div>
                    </div>
                  </td>
                  <td className="px-1 py-3 text-center bg-slate-100/50">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onAddToQueue(v)} className="p-1.5 bg-indigo-700 text-white rounded shadow-md hover:bg-indigo-800 transition-all active:scale-90" title="Add to Print Queue">
                        <ListPlus size={14} />
                      </button>
                      <button onClick={() => onEdit(v)} className="p-1.5 bg-amber-500 text-white rounded shadow-md hover:bg-amber-600 transition-all active:scale-90" title="Edit Record">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDelete(v.id)} className="p-1.5 bg-rose-600 text-white rounded shadow-md hover:bg-rose-700 transition-all active:scale-90" title="Delete Locally">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-2.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>TSC 70x45mm Precision Protocol</span>
        </div>
        <span>Master Database Synchronized (Latest Entries at Top)</span>
      </div>
    </div>
  );
};

export default VisitorLog;
