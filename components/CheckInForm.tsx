
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserPlus, User, Users, Phone, MapPin, Hash, IdCard, Calendar, Clock, RotateCcw, Printer, UsersRound, Search, Edit2, X, Info } from 'lucide-react';
import { Visitor } from '../types';

interface CheckInFormProps {
  visitors: Visitor[];
  onCheckIn: (visitor: Omit<Visitor, 'id' | 'status' | 'checkInTimestamp'>, shouldAddToQueue: boolean, stayOnPage: boolean) => void;
  initialData?: Visitor | null;
  onCancel?: () => void;
  onEditFromSearch: (visitor: Visitor) => void;
}

const DEFAULT_STATE = {
  name: '',
  gender: 'Male',
  age: '',
  place: '',
  aadharNo: '',
  groupLeader: '',
  jkpId: '',
  fromDate: '',
  toDate: '',
  amPm: 'AM',
  phone: '',
  event: 'NO EV',
  noOfDays: 0,
  amount: 0
};

// Helper to convert DD/MM/YYYY back to YYYY-MM-DD for input[type="date"]
const toInputDate = (str: string) => {
  if (!str) return '';
  const parts = str.split(/[\/\-:]/);
  if (parts.length === 3) {
    // If DD/MM/YYYY
    if (parts[0].length <= 2 && parts[2].length === 4) {
      const [d, m, y] = parts;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    // If YYYY-MM-DD
    if (parts[0].length === 4) {
      return str;
    }
  }
  return str;
};

const CheckInForm: React.FC<CheckInFormProps> = ({ visitors, onCheckIn, initialData, onCancel, onEditFromSearch }) => {
  const [formData, setFormData] = useState(DEFAULT_STATE);
  const [shouldAddToQueue, setShouldAddToQueue] = useState(true);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const searchResults = useMemo(() => {
    if (quickSearch.length < 2) return [];
    const term = quickSearch.toLowerCase();
    return visitors.filter(v => 
      v.name.toLowerCase().includes(term) || 
      v.phone.includes(term) || 
      v.aadharNo.includes(term)
    ).slice(0, 5);
  }, [visitors, quickSearch]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        gender: initialData.gender,
        age: initialData.age,
        place: initialData.place,
        aadharNo: initialData.aadharNo,
        groupLeader: initialData.groupLeader,
        jkpId: initialData.jkpId,
        fromDate: toInputDate(initialData.fromDate),
        toDate: toInputDate(initialData.toDate),
        amPm: initialData.amPm,
        phone: initialData.phone,
        event: initialData.event,
        noOfDays: initialData.noOfDays,
        amount: initialData.amount
      });
    } else {
      setFormData({ ...DEFAULT_STATE });
    }
  }, [initialData]);

  useEffect(() => {
    let days = 0;
    if (formData.fromDate && formData.toDate) {
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        days = diffDays + (formData.amPm === 'PM' ? 1 : 0);
        if (days < 0) days = 0;
      }
    }
    
    const perDayAmount = (days || 0) * 150;
    let eventSurcharge = 0;
    if (formData.event === 'HP' || formData.event === 'SP') eventSurcharge = 2100;
    else if (formData.event === 'OTHER') eventSurcharge = 100;

    const totalAmount = perDayAmount + eventSurcharge;
    
    if (formData.noOfDays !== days || formData.amount !== totalAmount) {
      setFormData(prev => ({ 
        ...prev, 
        noOfDays: days,
        amount: totalAmount
      }));
    }
  }, [formData.fromDate, formData.toDate, formData.event, formData.amPm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckIn(formData, shouldAddToQueue, isGroupMode);
    
    if (isGroupMode) {
      setFormData(prev => ({
        ...prev,
        name: '',
        age: '',
        aadharNo: '',
        phone: '',
        jkpId: ''
      }));
      setQuickSearch('');
    }
  };

  const handleClear = useCallback(() => {
    if (initialData) {
      if (window.confirm("Kya aap changes discard karke logs par wapas jana chahte hain?")) {
        if (onCancel) onCancel();
      }
    } else {
      if (window.confirm("Kya aap form ko poora clear karna chahte hain?")) {
        setFormData({ ...DEFAULT_STATE });
        setQuickSearch('');
      }
    }
  }, [initialData, onCancel]);

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 12) value = value.slice(0, 12);
    const formatted = value.match(/.{1,4}/g)?.join('-') || '';
    setFormData(prev => ({ ...prev, aadharNo: formatted }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'noOfDays' ? Number(value) : value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-10">
      {!initialData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search existing visitor to update (Name, Phone, Aadhar)..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-2 space-y-1">
              {searchResults.map(v => (
                <button 
                  key={v.id} 
                  type="button"
                  onClick={() => { onEditFromSearch(v); setQuickSearch(''); }}
                  className="w-full flex items-center justify-between p-3 hover:bg-indigo-50 rounded-xl transition-all group border border-transparent hover:border-indigo-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">{v.name.charAt(0)}</div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-800 uppercase">{v.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{v.phone} • {v.place}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                    <Edit2 size={12} /> Load Record
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        <div className={`p-8 text-white flex justify-between items-center ${initialData ? 'bg-amber-600' : 'bg-indigo-600'}`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {initialData ? <IdCard size={28} /> : <UserPlus size={28} />}
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase leading-none">{initialData ? 'Update Record' : 'New Registration'}</h2>
                <p className="text-white opacity-70 text-[10px] font-black uppercase tracking-widest mt-1">Cloud ID Synchronization Active</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20 text-center min-w-[80px] hover:bg-white/20 transition-all flex flex-col items-center"
              title="Calculated Stay Days"
            >
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-0.5">Days</p>
              <p className="text-xl font-black leading-none">{formData.noOfDays}</p>
            </button>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20 text-center min-w-[100px] flex flex-col items-center">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-0.5">Amount</p>
              <p className="text-xl font-mono font-black leading-none">₹{formData.amount}</p>
            </div>
            {initialData && (
              <button 
                type="button"
                onClick={handleClear}
                className="p-3 bg-white/20 hover:bg-white/40 rounded-xl transition-all border border-white/30"
                title="Close and Cancel"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
             <div className="flex items-center gap-3">
               <UsersRound className={isGroupMode ? "text-indigo-600" : "text-slate-300"} />
               <div>
                 <p className="text-sm font-bold text-slate-800 tracking-tight uppercase">Group Mode (Family/Group)</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase">Keep Place & Dates for multiple people</p>
               </div>
             </div>
             <button 
               type="button"
               onClick={() => setIsGroupMode(!isGroupMode)}
               className={`w-12 h-6 rounded-full transition-all relative ${isGroupMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
             >
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isGroupMode ? 'left-7' : 'left-1'}`}></div>
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="Name" name="name" icon={<User size={16}/>} value={formData.name} onChange={handleChange} required />
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <InputField label="Age" name="age" type="number" icon={<Hash size={16}/>} value={formData.age} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="Place" name="place" icon={<MapPin size={16}/>} value={formData.place} onChange={handleChange} required />
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest"><IdCard size={16}/> Aadhar No</label>
              <input name="aadharNo" value={formData.aadharNo} onChange={handleAadharChange} placeholder="XXXX-XXXX-XXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold font-mono" />
            </div>
            <InputField label="Phone No" name="phone" type="tel" icon={<Phone size={16}/>} value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="Group Leader" name="groupLeader" icon={<Users size={16}/>} value={formData.groupLeader} onChange={handleChange} />
            <InputField label="JKP ID" name="jkpId" icon={<Hash size={16}/>} value={formData.jkpId} onChange={handleChange} />
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Event Type</label>
              <select name="event" value={formData.event} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-black text-indigo-700">
                <option value="HP">HP (Holi)</option>
                <option value="SP">SP (Satsang)</option>
                <option value="OTHER">OTHER</option>
                <option value="NO EV">NO EV</option>
              </select>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="From Date" name="fromDate" type="date" icon={<Calendar size={16}/>} value={formData.fromDate} onChange={handleChange} required />
            <InputField label="To Date" name="toDate" type="date" icon={<Calendar size={16}/>} value={formData.toDate} onChange={handleChange} required />
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest"><Clock size={16}/> AM/PM</label>
              <select name="amPm" value={formData.amPm} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold">
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <input 
              type="checkbox" 
              id="addToQueue" 
              checked={shouldAddToQueue} 
              onChange={(e) => setShouldAddToQueue(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="addToQueue" className="flex items-center gap-2 text-sm font-black text-indigo-700 cursor-pointer uppercase tracking-tight">
              <Printer size={16} /> Add to Print Queue immediately after saving
            </label>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4">
            <button 
              type="button" 
              onClick={handleClear}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm uppercase tracking-widest text-xs"
            >
              <RotateCcw size={18} /> {initialData ? 'Discard Changes' : 'Clear Form'}
            </button>
            <button type="submit" className={`px-12 py-4 text-white font-black rounded-xl transition-all shadow-lg transform active:scale-95 uppercase tracking-widest text-sm ${initialData ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}>
              {initialData ? 'Update Record' : 'Save Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, icon, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest">
      {icon} {label}
    </label>
    <input {...props} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold uppercase placeholder:font-normal placeholder:lowercase text-slate-900" />
  </div>
);

export default CheckInForm;
