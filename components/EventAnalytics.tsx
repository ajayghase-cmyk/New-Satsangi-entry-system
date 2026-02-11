
import React from 'react';
import { BarChart, TrendingUp, Calendar, DollarSign, Users, Award } from 'lucide-react';
import { Visitor } from '../types';

interface EventAnalyticsProps {
  visitors: Visitor[];
}

const EventAnalytics: React.FC<EventAnalyticsProps> = ({ visitors }) => {
  const totalRevenue = visitors.reduce((sum, v) => sum + v.amount, 0);
  const totalDays = visitors.reduce((sum, v) => sum + v.noOfDays, 0);
  
  // Group by Event
  const eventStats = visitors.reduce((acc: any, v) => {
    if (!acc[v.event]) acc[v.event] = { count: 0, revenue: 0, days: 0 };
    acc[v.event].count += 1;
    acc[v.event].revenue += v.amount;
    acc[v.event].days += v.noOfDays;
    return acc;
  }, {});

  // Group by Date (From Date)
  const dailyStats = visitors.reduce((acc: any, v) => {
    if (!acc[v.fromDate]) acc[v.fromDate] = 0;
    acc[v.fromDate] += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard icon={<Award className="text-amber-500" />} label="Total Events" value={Object.keys(eventStats).length} />
        <MetricCard icon={<DollarSign className="text-emerald-500" />} label="Total Collections" value={`₹${totalRevenue.toLocaleString()}`} />
        <MetricCard icon={<Calendar className="text-indigo-500" />} label="Total Stay Days" value={totalDays} />
        <MetricCard icon={<Users className="text-blue-500" />} label="Total Footfall" value={visitors.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
            <BarChart className="text-indigo-500" size={20} /> Event Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(eventStats).map(([name, data]: [string, any]) => (
              <div key={name} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-700">{name}</span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    {data.count} Visitors
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200/50">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Revenue</p>
                    <p className="text-sm font-bold text-emerald-600">₹{data.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Days</p>
                    <p className="text-sm font-bold text-indigo-600">{data.days} days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={20} /> Per-Day Check-in Load
          </h3>
          <div className="space-y-4">
            {Object.entries(dailyStats).sort().map(([date, count]: [string, any]) => (
              <div key={date} className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-400 w-24">{date}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-1000" 
                    style={{ width: `${(count / visitors.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-slate-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default EventAnalytics;
