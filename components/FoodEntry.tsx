import React, { useState, useEffect, useRef } from 'react';
import { IconChevronLeft, IconScan, IconPlus } from './Icons';
import { searchLocalDatabase, searchOpenFoodFacts, fetchProductByBarcode, NutritionResponse } from '../services/nutritionService';
import { FoodItem } from '../types';

// Declare Html5QrcodeScanner type since it's loaded from CDN
declare const Html5Qrcode: any;

interface FoodEntryProps {
  onBack: () => void;
  onAddFood: (food: Omit<FoodItem, 'id' | 'timestamp'>) => void;
}

const FoodEntry: React.FC<FoodEntryProps> = ({ onBack, onAddFood }) => {
  const [mode, setMode] = useState<'search' | 'scanner' | 'create'>('search');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<NutritionResponse[]>([]);
  
  // Portion Selection State
  const [selectedFood, setSelectedFood] = useState<NutritionResponse | null>(null);
  const [quantity, setQuantity] = useState<string>('1');

  // Custom Food Form State
  const [customFood, setCustomFood] = useState({
    name: '',
    brand: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    servingSize: ''
  });
  
  const scannerRef = useRef<any>(null);
  const isScannerRunning = useRef<boolean>(false);

  // Diverse Suggestions including new user preferences
  const quickAdds = ["Wheat Bread", "Papaya", "Sambar", "Corn Flakes", "Quinoa Bread", "Vatha Kuzhambu", "Pad Thai", "Egg", "Salad", "Ranch"];

  // TN/Pondy/Chennai Healthy Lunch Suggestions
  const tamilLunchSuggestions = [
    { name: "Millet Rice", detail: "Healthy Grains" },
    { name: "Keerai Masiyal", detail: "Spinach" },
    { name: "Beans Usili", detail: "High Protein" },
    { name: "Fish Curry", detail: "Pondy Style" },
    { name: "Chicken Chettinad", detail: "Spicy Protein" },
    { name: "Cabbage Poriyal", detail: "Light Side" },
    { name: "Curd Rice", detail: "Cooling" },
    { name: "Drumstick Sambar", detail: "Classic" },
    { name: "Veg Kurma", detail: "Mixed Veg" },
    { name: "Beetroot Poriyal", detail: "Iron Rich" }
  ];

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = () => {
    setError(null);
    setLoading(true); // Show loading while camera inits
    
    // Slight delay to allow UI to render the #reader div
    setTimeout(() => {
      try {
        // If already running, stop first
        if (scannerRef.current && isScannerRunning.current) {
            scannerRef.current.stop().then(() => {
                initScannerInstance();
            });
        } else {
            initScannerInstance();
        }
      } catch (e) {
        setLoading(false);
        setError("Scanner initialization failed.");
      }
    }, 300);
  };

  const initScannerInstance = () => {
     try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };
        
        html5QrCode.start(
          { facingMode: "environment" }, 
          config,
          onScanSuccess,
          (errorMessage: any) => {
            // parse error, ignore it to prevent log spam
          }
        ).then(() => {
            isScannerRunning.current = true;
            setLoading(false);
        }).catch((err: any) => {
          console.error(err);
          setLoading(false);
          setError("Could not start camera. Please check permissions.");
        });
     } catch(err) {
         setLoading(false);
         setError("Camera error.");
     }
  };

  const stopScanner = () => {
    if (scannerRef.current && isScannerRunning.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        isScannerRunning.current = false;
      }).catch((err: any) => {
        console.error("Failed to stop scanner", err);
      });
    }
  };

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    // Stop scanning immediately
    if (scannerRef.current && isScannerRunning.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        isScannerRunning.current = false;
    }
    
    setMode('search'); // Switch back to UI
    setLoading(true);
    setQuery(decodedText); // Show barcode in search bar temporarily

    try {
      const product = await fetchProductByBarcode(decodedText);
      if (product) {
        setSearchResults([product]);
        setError(null);
        // Automatically open portion selector for scanned item
        setSelectedFood(product);
        setQuantity('1');
      } else {
        setError(`Product not found for barcode: ${decodedText}. Try searching by name.`);
        setSearchResults([]);
      }
    } catch (err) {
      setError("Failed to fetch product details.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextSearch = async (text: string = query) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setSearchResults([]);
    
    // 1. Instant Local Search
    const localResults = searchLocalDatabase(text);
    setSearchResults(localResults);

    // 2. Background API Search
    try {
      const apiResults = await searchOpenFoodFacts(text);
      setSearchResults(prev => {
        // Simple deduplication by name (basic)
        const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
        const newItems = apiResults.filter(p => !existingNames.has(p.name.toLowerCase()));
        return [...prev, ...newItems];
      });
    } catch (err) {
      // API failed, but we might have local.
      if (localResults.length === 0) setError("Failed to search food.");
    } finally {
      setLoading(false);
    }
  };

  // Open the portion modal instead of adding immediately
  const handleItemClick = (item: NutritionResponse) => {
    setSelectedFood(item);
    setQuantity('1');
  };

  const handleConfirmAdd = () => {
    if (!selectedFood) return;
    
    const qty = parseFloat(quantity) || 1;
    
    onAddFood({
      name: selectedFood.name,
      calories: Math.round(selectedFood.calories * qty),
      protein: Math.round(selectedFood.protein * qty * 10) / 10,
      carbs: Math.round(selectedFood.carbs * qty * 10) / 10,
      fat: Math.round(selectedFood.fat * qty * 10) / 10,
      fiber: Math.round(selectedFood.fiber * qty * 10) / 10,
      servingSize: `${qty} x ${selectedFood.servingSize}`,
      type: 'snack' 
    });
    setSelectedFood(null);
    setQuantity('1');
    // App.tsx handles navigation back to Dashboard
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFood.name || !customFood.calories) return;

    onAddFood({
      name: customFood.name,
      calories: parseFloat(customFood.calories),
      protein: parseFloat(customFood.protein) || 0,
      carbs: parseFloat(customFood.carbs) || 0,
      fat: parseFloat(customFood.fat) || 0,
      fiber: parseFloat(customFood.fiber) || 0,
      servingSize: customFood.servingSize || '1 serving',
      type: 'snack'
    });
  };

  // --- Scanner View ---
  if (mode === 'scanner') {
    return (
      <div className="w-full h-full bg-black z-[60] flex flex-col absolute inset-0">
        {/* Header - High Z-Index to ensure clickability */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-[70] bg-gradient-to-b from-black/80 to-transparent">
          <button 
            onClick={() => { stopScanner(); setMode('search'); }} 
            className="p-2 bg-black/20 rounded-full backdrop-blur-sm active:bg-white/20 transition-colors"
          >
            <IconChevronLeft className="w-8 h-8" />
          </button>
          <span className="font-semibold text-lg tracking-wide">Scan Barcode</span>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>
        
        {/* Scanner Container */}
        <div className="flex-1 relative flex flex-col items-center justify-center bg-black">
          {loading && (
             <div className="absolute inset-0 flex items-center justify-center z-10 text-white">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          )}
          
          <div className="w-full max-w-sm px-4 relative">
             <div id="reader" className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10"></div>
             
             {/* Visual Guide Overlay (Cosmetic) */}
             {!loading && (
                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-emerald-500/50 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1"></div>
                    </div>
                 </div>
             )}
          </div>

          <p className="mt-8 text-white/70 text-sm text-center px-6 max-w-xs">
            Align the barcode within the frame. <br/> ensure good lighting.
          </p>
        </div>
      </div>
    );
  }

  // --- Create Custom Food View ---
  if (mode === 'create') {
    return (
      <div className="w-full h-full flex flex-col bg-white animate-in slide-in-from-right z-50">
        <div className="p-4 flex items-center gap-3 border-b border-slate-100 bg-white sticky top-0 z-10">
          <button onClick={() => setMode('search')} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full">
            <IconChevronLeft />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Create New Food</h1>
        </div>
        
        <div className="p-6 overflow-y-auto pb-24 flex-1">
          <form onSubmit={handleCreateCustom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Food Name *</label>
              <input 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                placeholder="e.g. Mom's Chicken Curry"
                value={customFood.name}
                onChange={e => setCustomFood({...customFood, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Brand (Optional)</label>
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                placeholder="e.g. Homemade, Kellogg's"
                value={customFood.brand}
                onChange={e => setCustomFood({...customFood, brand: e.target.value})}
              />
            </div>
            
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Serving Size</label>
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                placeholder="e.g. 1 cup, 100g"
                value={customFood.servingSize}
                onChange={e => setCustomFood({...customFood, servingSize: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Calories *</label>
                <input 
                  type="number"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                  placeholder="kcal"
                  value={customFood.calories}
                  onChange={e => setCustomFood({...customFood, calories: e.target.value})}
                />
              </div>
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Protein (g)</label>
                <input 
                  type="number"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                  placeholder="g"
                  value={customFood.protein}
                  onChange={e => setCustomFood({...customFood, protein: e.target.value})}
                />
              </div>
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Carbs (g)</label>
                <input 
                  type="number"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                  placeholder="g"
                  value={customFood.carbs}
                  onChange={e => setCustomFood({...customFood, carbs: e.target.value})}
                />
              </div>
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fat (g)</label>
                <input 
                  type="number"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                  placeholder="g"
                  value={customFood.fat}
                  onChange={e => setCustomFood({...customFood, fat: e.target.value})}
                />
              </div>
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fiber (g)</label>
                <input 
                  type="number"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                  placeholder="g"
                  value={customFood.fiber}
                  onChange={e => setCustomFood({...customFood, fiber: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 mt-4 active:scale-[0.98] transition-transform">
              Add Food
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Main View (Search) ---
  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden relative z-40">
      {/* Portion Selection Modal */}
      {selectedFood && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <h2 className="text-xl font-bold text-slate-800 capitalize">{selectedFood.name}</h2>
                 <p className="text-sm text-slate-500">Base: {selectedFood.servingSize}</p>
               </div>
               <div className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg">
                 {Math.round(selectedFood.calories * (parseFloat(quantity) || 0))} kcal
               </div>
            </div>
            
            <div className="mb-6">
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Number of Servings</label>
               <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(0.5, parseFloat(quantity)-0.5).toString())} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xl font-bold">-</button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 text-center text-2xl font-bold text-slate-800 border-b-2 border-slate-200 focus:border-emerald-500 focus:outline-none py-1"
                    step="0.1"
                  />
                  <button onClick={() => setQuantity((parseFloat(quantity)+0.5).toString())} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xl font-bold">+</button>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-6">
               <div className="bg-slate-50 p-2 rounded-lg">
                 <div className="text-[10px] text-slate-400 uppercase">Protein</div>
                 <div className="font-bold text-slate-700">{(selectedFood.protein * (parseFloat(quantity) || 0)).toFixed(1)}g</div>
               </div>
               <div className="bg-slate-50 p-2 rounded-lg">
                 <div className="text-[10px] text-slate-400 uppercase">Carbs</div>
                 <div className="font-bold text-slate-700">{(selectedFood.carbs * (parseFloat(quantity) || 0)).toFixed(1)}g</div>
               </div>
               <div className="bg-slate-50 p-2 rounded-lg">
                 <div className="text-[10px] text-slate-400 uppercase">Fat</div>
                 <div className="font-bold text-slate-700">{(selectedFood.fat * (parseFloat(quantity) || 0)).toFixed(1)}g</div>
               </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedFood(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAdd}
                className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200"
              >
                Add Food
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-100 bg-white z-10 shadow-sm shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
          <IconChevronLeft />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Add Food</h1>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-24">
        {/* Search Bar */}
        <div className="relative z-20">
          <input
            type="text"
            placeholder="Search 'Papaya', 'Dosa'..."
            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800 shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
          />
          <button 
            onClick={() => handleTextSearch()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-2 rounded-lg text-xs font-semibold hover:bg-emerald-600 shadow-sm active:scale-95 transition-all"
          >
            GO
          </button>
        </div>

        {/* Scan Barcode Button */}
        <button 
          onClick={() => { setMode('scanner'); startScanner(); }}
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl shadow-xl shadow-slate-200/50 active:scale-[0.98] transition-all group shrink-0"
        >
          <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
             <IconScan className="w-6 h-6" />
          </div>
          <span className="font-semibold tracking-wide">Scan Barcode</span>
        </button>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Create Custom Food Button */}
        <button 
          onClick={() => setMode('create')}
          className="w-full py-3 bg-white border border-dashed border-emerald-500 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 active:bg-emerald-100 shrink-0"
        >
          <IconPlus className="w-5 h-5" />
          Create Custom Food
        </button>

        {/* Suggestions Section (Visible only when searching is not active) */}
        {searchResults.length === 0 && !loading && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Quick Popular Tags */}
            <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Popular</h3>
               <div className="flex flex-wrap gap-2">
                 {quickAdds.map((item) => (
                   <button
                     key={item}
                     onClick={() => { setQuery(item); handleTextSearch(item); }}
                     className="px-4 py-2 bg-slate-50 hover:bg-white text-slate-600 hover:text-emerald-600 rounded-full text-sm font-medium transition-all border border-slate-200 hover:border-emerald-200 hover:shadow-sm"
                   >
                     {item}
                   </button>
                 ))}
               </div>
            </div>

            {/* Tamil Nadu/Pondy Lunch Suggestions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-xl">🥗</span>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Healthy South Indian Lunch</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 {tamilLunchSuggestions.map((item) => (
                   <button
                     key={item.name}
                     onClick={() => { setQuery(item.name); handleTextSearch(item.name); }}
                     className="flex flex-col items-start p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all active:scale-95 text-left"
                   >
                     <span className="font-semibold text-slate-800 text-sm">{item.name}</span>
                     <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded mt-1">{item.detail}</span>
                   </button>
                 ))}
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {searchResults.length > 0 && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Results</span>
              {loading && <span className="text-emerald-500 animate-pulse">Loading more...</span>}
            </h3>
            {searchResults.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => handleItemClick(item)}
                className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 capitalize text-lg">{item.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {item.servingSize} 
                      {item.brand && ` • ${item.brand}`}
                      {item.source === 'api' && ' • Verified API'}
                    </p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-100">
                    {item.calories} kcal
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-50">
                    <div className="text-slate-400 mb-0.5 text-[10px] uppercase">Pro</div>
                    <div className="font-bold text-slate-700">{item.protein}g</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-50">
                    <div className="text-slate-400 mb-0.5 text-[10px] uppercase">Carb</div>
                    <div className="font-bold text-slate-700">{item.carbs}g</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-50">
                    <div className="text-slate-400 mb-0.5 text-[10px] uppercase">Fat</div>
                    <div className="font-bold text-slate-700">{item.fat}g</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-50">
                    <div className="text-slate-400 mb-0.5 text-[10px] uppercase">Fib</div>
                    <div className="font-bold text-slate-700">{item.fiber}g</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Loading Spinner for initial search when no results yet */}
        {loading && searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400 mt-2">Searching...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodEntry;