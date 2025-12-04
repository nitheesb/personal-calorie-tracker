import React, { useState, useMemo, useEffect } from 'react';
import { IconHome, IconPlus, IconChartBar, IconScan } from './components/Icons';
import MacroRing from './components/MacroRing';
import FoodEntry from './components/FoodEntry';
import WeightTracker from './components/WeightTracker';
import { FoodItem, DailyLog, AppView, UserGoals, BodyMetrics } from './types';

// Custom goals for 70.2kg -> 64kg (Cut & Build)
const USER_GOALS: UserGoals = {
  calories: 1850,
  protein: 160,
  carbs: 165,
  fat: 60,
  fiber: 30,
  weightGoal: 'lose',
  startWeight: 70.2,
  currentWeight: 70.2,
  targetWeight: 64.0
};

const INITIAL_BODY_LOGS: BodyMetrics[] = [
  { id: '1', date: '2023-10-01', weight: 72.5, bodyFatPercent: 22.0 },
  { id: '2', date: '2023-10-15', weight: 71.8, bodyFatPercent: 21.5 },
  { id: '3', date: '2023-10-25', weight: 70.2, bodyFatPercent: 20.8, muscleMass: 52.5 }
];

const STORAGE_KEY_FOOD = 'ntrition_daily_log';
const STORAGE_KEY_BODY = 'ntrition_body_logs';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [goals] = useState<UserGoals>(USER_GOALS);
  
  // Initialize Daily Log from LocalStorage
  const [todayLog, setTodayLog] = useState<DailyLog>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FOOD);
      const today = new Date().toISOString().split('T')[0];
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only return saved log if it matches today's date
        if (parsed.date === today) {
          return parsed;
        }
      }
      return { date: today, items: [] };
    } catch (e) {
      console.error("Failed to load daily log", e);
      return { date: new Date().toISOString().split('T')[0], items: [] };
    }
  });
  
  // Initialize Body Logs from LocalStorage
  const [bodyLogs, setBodyLogs] = useState<BodyMetrics[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BODY);
      return saved ? JSON.parse(saved) : INITIAL_BODY_LOGS;
    } catch (e) {
      console.error("Failed to load body logs", e);
      return INITIAL_BODY_LOGS;
    }
  });

  // Save changes to LocalStorage whenever state updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FOOD, JSON.stringify(todayLog));
  }, [todayLog]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BODY, JSON.stringify(bodyLogs));
  }, [bodyLogs]);

  const totals = useMemo(() => {
    return todayLog.items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
        fiber: acc.fiber + item.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }, [todayLog]);

  const handleAddFood = (food: Omit<FoodItem, 'id' | 'timestamp'>) => {
    const newItem: FoodItem = {
      ...food,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: 'snack',
    };

    setTodayLog(prev => ({
      ...prev,
      items: [newItem, ...prev.items]
    }));
    setView(AppView.DASHBOARD);
  };

  const handleAddBodyLog = (log: Omit<BodyMetrics, 'id'>) => {
    const newLog: BodyMetrics = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
    };
    setBodyLogs(prev => [...prev, newLog]);
  };

  // --- Content Renderer ---
  const renderContent = () => {
    switch (view) {
      case AppView.ADD_FOOD:
        return <FoodEntry onBack={() => setView(AppView.DASHBOARD)} onAddFood={handleAddFood} />;
      
      case AppView.BODY_TRACKER:
        return (
          <>
            <div className="bg-white p-6 pb-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Body Metrics</h1>
                  <p className="text-slate-500 text-sm font-medium">Tracking towards 64kg</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
              </div>
            </div>
            <WeightTracker logs={bodyLogs} targetWeight={goals.targetWeight} onAddLog={handleAddBodyLog} />
          </>
        );

      case AppView.DASHBOARD:
      default:
        return (
          <>
            <div className="bg-white p-6 pb-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Today</h1>
                  <p className="text-slate-500 text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 transition-colors">
                   <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
              </div>

              {/* Calories Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-slate-200 mb-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 group-hover:opacity-30 transition-opacity"></div>
                
                <div className="flex justify-between items-end relative z-10">
                  <div>
                    <p className="text-slate-400 font-medium mb-1 text-xs uppercase tracking-wider">Calories Remaining</p>
                    <div className="text-5xl font-bold tracking-tighter">
                      {Math.max(0, goals.calories - totals.calories)}
                    </div>
                    <div className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">Goal: {goals.calories}</span>
                      <span className="text-slate-600">•</span> 
                      <span className="text-emerald-400 font-medium">Eaten: {totals.calories}</span>
                    </div>
                  </div>
                  <div className="h-16 w-16 relative">
                     <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#334155" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${Math.min(100, (totals.calories / goals.calories) * 100)}, 100`} />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                       {Math.round((totals.calories / goals.calories) * 100)}%
                     </div>
                  </div>
                </div>
              </div>

              {/* Macro Rings */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                <MacroRing current={totals.protein} max={goals.protein} unit="g" label="Protein" color="#8b5cf6" />
                <MacroRing current={totals.carbs} max={goals.carbs} unit="g" label="Carbs" color="#3b82f6" />
                <MacroRing current={totals.fat} max={goals.fat} unit="g" label="Fat" color="#f59e0b" />
                <MacroRing current={totals.fiber} max={goals.fiber} unit="g" label="Fiber" color="#10b981" />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-t-3xl border-t border-slate-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10 overflow-y-auto no-scrollbar pb-24">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold text-slate-800">Meals</h2>
                 <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">High Protein Focus</span>
              </div>
              
              {todayLog.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                   <div className="bg-slate-50 p-4 rounded-full mb-3 text-slate-300">
                      <IconScan className="w-8 h-8" />
                   </div>
                   <p className="text-slate-500 font-medium">No food logged yet.</p>
                   <p className="text-xs text-slate-400 mt-1">Tap + to add your high protein breakfast!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayLog.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-lg">
                          {item.name.toLowerCase().includes('coffee') ? '☕' : 
                           item.name.toLowerCase().includes('rice') ? '🍚' : 
                           item.name.toLowerCase().includes('dosa') ? '🥞' : 
                           item.name.toLowerCase().includes('chicken') ? '🍗' : 
                           item.name.toLowerCase().includes('egg') ? '🥚' : '🍎'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 capitalize">{item.name}</h3>
                          <p className="text-xs text-slate-500">{item.servingSize} • <span className="text-indigo-500 font-medium">{item.protein}g P</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800">{item.calories}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase">Kcal</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Dynamic Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {renderContent()}
      </div>

      {/* Navigation Bar */}
      {view !== AppView.ADD_FOOD && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 pointer-events-none z-50">
          <div className="flex justify-between items-center bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-2 border border-slate-100 pointer-events-auto">
             <button 
               onClick={() => setView(AppView.DASHBOARD)}
               className={`p-4 transition-colors ${view === AppView.DASHBOARD ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}
             >
               <IconHome className="w-6 h-6" />
             </button>
             
             <button 
              onClick={() => setView(AppView.ADD_FOOD)}
              className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200 text-white flex items-center justify-center transform -translate-y-6 transition-all active:scale-95 border-4 border-white"
             >
               <IconPlus className="w-8 h-8" />
             </button>
             
             <button 
               onClick={() => setView(AppView.BODY_TRACKER)}
               className={`p-4 transition-colors ${view === AppView.BODY_TRACKER ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}
             >
               <IconChartBar className="w-6 h-6" />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;