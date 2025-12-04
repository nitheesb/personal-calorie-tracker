import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { BodyMetrics } from '../types';
import { IconPlus } from './Icons';

interface WeightTrackerProps {
  logs: BodyMetrics[];
  targetWeight: number;
  onAddLog: (log: Omit<BodyMetrics, 'id'>) => void;
}

const WeightTracker: React.FC<WeightTrackerProps> = ({ logs, targetWeight, onAddLog }) => {
  const [showInput, setShowInput] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newFat, setNewFat] = useState('');
  const [newMuscle, setNewMuscle] = useState('');

  // Sort logs by date
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const currentMetric = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1] : null;
  const startMetric = sortedLogs.length > 0 ? sortedLogs[0] : null;
  
  const totalChange = currentMetric && startMetric ? (currentMetric.weight - startMetric.weight).toFixed(1) : '0.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;

    onAddLog({
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(newWeight),
      bodyFatPercent: newFat ? parseFloat(newFat) : undefined,
      muscleMass: newMuscle ? parseFloat(newMuscle) : undefined,
    });
    
    setNewWeight('');
    setNewFat('');
    setNewMuscle('');
    setShowInput(false);
  };

  return (
    <div className="flex-1 bg-white rounded-t-3xl border-t border-slate-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10 overflow-y-auto no-scrollbar pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Body Composition</h2>
        <button 
          onClick={() => setShowInput(!showInput)}
          className="text-emerald-600 text-sm font-semibold hover:bg-emerald-50 px-3 py-1 rounded-full transition-colors"
        >
          {showInput ? 'Cancel' : 'Sync Scale'}
        </button>
      </div>

      {showInput && (
        <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-200 animate-in slide-in-from-top-2">
          <p className="text-xs text-slate-500 mb-4">
            Enter data from your OkOk scale or other smart device.
          </p>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Weight (kg)</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="e.g. 70.2"
                className="w-full p-2 rounded-lg border border-slate-200 focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Body Fat %</label>
              <input 
                type="number" 
                step="0.1"
                value={newFat}
                onChange={(e) => setNewFat(e.target.value)}
                placeholder="e.g. 18.5"
                className="w-full p-2 rounded-lg border border-slate-200 focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Muscle Mass %</label>
              <input 
                type="number" 
                step="0.1"
                value={newMuscle}
                onChange={(e) => setNewMuscle(e.target.value)}
                placeholder="e.g. 42.0"
                className="w-full p-2 rounded-lg border border-slate-200 focus:outline-emerald-500"
              />
            </div>
            <button type="submit" className="col-span-2 bg-emerald-500 text-white py-2 rounded-xl font-bold mt-2 shadow-md shadow-emerald-200">
              Save Record
            </button>
          </form>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-slate-500 text-xs mb-1">Current Weight</p>
          <p className="text-2xl font-bold text-slate-800">{currentMetric?.weight || '--'}<span className="text-sm font-normal text-slate-500 ml-1">kg</span></p>
          <div className="mt-2 text-xs flex items-center gap-1 text-slate-600">
            <span className={parseFloat(totalChange) <= 0 ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>
              {parseFloat(totalChange) > 0 ? '+' : ''}{totalChange}kg
            </span>
            <span>since start</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-100">
          <p className="text-slate-500 text-xs mb-1">Body Fat</p>
          <p className="text-2xl font-bold text-slate-800">{currentMetric?.bodyFatPercent || '--'}<span className="text-sm font-normal text-slate-500 ml-1">%</span></p>
          <p className="mt-2 text-xs text-slate-600">
            Goal: Cut Fat
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full mb-6">
        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Progress Trend</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sortedLogs}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tick={{fontSize: 10, fill: '#94a3b8'}} 
              tickFormatter={(val) => val.split('-').slice(1).join('/')}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={['dataMin - 1', 'dataMax + 1']} 
              hide={true} 
            />
            <Tooltip 
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
            />
            <ReferenceLine y={targetWeight} label={{ value: 'Goal', position: 'right', fill: '#10b981', fontSize: 10 }} stroke="#10b981" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="weight" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorWeight)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed List */}
      <h3 className="text-sm font-bold text-slate-800 mb-3">Recent Logs</h3>
      <div className="space-y-3">
        {[...sortedLogs].reverse().map((log) => (
          <div key={log.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">{new Date(log.date).toLocaleDateString()}</span>
              <span className="text-xs text-slate-400">Manual Entry</span>
            </div>
            <div className="flex gap-4 text-right">
              {log.bodyFatPercent && (
                <div>
                  <div className="text-xs text-slate-400">Fat</div>
                  <div className="font-medium text-slate-700">{log.bodyFatPercent}%</div>
                </div>
              )}
               {log.muscleMass && (
                <div>
                  <div className="text-xs text-slate-400">Muscle</div>
                  <div className="font-medium text-slate-700">{log.muscleMass}kg</div>
                </div>
              )}
              <div>
                <div className="text-xs text-slate-400">Weight</div>
                <div className="font-bold text-slate-800">{log.weight}kg</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeightTracker;