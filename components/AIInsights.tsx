
import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldAlert, Zap, Info, Loader2, RefreshCw } from 'lucide-react';
import { Visitor, AIInsight } from '../types';
import { analyzeVisitorPatterns, generateVisitorSummary } from '../services/geminiService';

interface AIInsightsProps {
  visitors: Visitor[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ visitors }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [newInsights, newSummary] = await Promise.all([
        analyzeVisitorPatterns(visitors),
        generateVisitorSummary(visitors)
      ]);
      setInsights(newInsights);
      setSummary(newSummary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [visitors]);

  const getTypeIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'security': return <ShieldAlert className="text-red-500" />;
      case 'efficiency': return <Zap className="text-amber-500" />;
      default: return <Info className="text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Smart Analysis</h2>
          </div>
          <div className="max-w-3xl">
            {loading ? (
              <div className="flex items-center gap-2 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini is analyzing your visitor traffic...</span>
              </div>
            ) : (
              <p className="text-indigo-50 leading-relaxed text-lg">
                "{summary}"
              </p>
            )}
          </div>
        </div>
        
        {/* Abstract background blobs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex justify-between items-center px-2">
        <h3 className="text-xl font-bold text-slate-800">Actionable Insights</h3>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                <div className="h-4 w-32 bg-slate-100 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-50 rounded"></div>
                <div className="h-3 w-5/6 bg-slate-50 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          insights.map((insight, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-indigo-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    {getTypeIcon(insight.type)}
                  </div>
                  <h4 className="font-bold text-slate-900">{insight.title}</h4>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 bg-slate-50 rounded-md">
                  {insight.type}
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {insight.description}
              </p>
              {insight.action && (
                <div className="pt-4 border-t border-slate-50">
                  <button className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-2">
                    Action: {insight.action}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIInsights;
