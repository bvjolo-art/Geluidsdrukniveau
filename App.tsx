import React, { useState, useMemo } from 'react';
import { Volume2, MoveHorizontal, Info, Calculator, Map } from 'lucide-react';
import { calculateSoundPressure, generateContours } from './utils/acoustics';
import SoundMap from './components/SoundMap';
import AIAdvisor from './components/AIAdvisor';
import { CalculationModel } from './types';

// Wettelijke normen Vlaanderen (indicatief voor woongebieden)
const FLANDERS_LIMITS = [
  { db: 45, label: 'Dag (45dB)' },
  { db: 35, label: 'Nacht (35dB)' },
];

const App: React.FC = () => {
  // State for inputs
  // Default values changed as requested: Power 60dB, Distance 5m
  const [soundPower, setSoundPower] = useState<number>(60);
  const [distance, setDistance] = useState<number>(5);

  // Derived state (calculations)
  const resultLp = useMemo(() => {
    return calculateSoundPressure({ soundPower, distance }, CalculationModel.HEMISPHERICAL);
  }, [soundPower, distance]);

  const contours = useMemo(() => {
    // Pass the specific Flanders limits to generate the contours
    return generateContours(soundPower, FLANDERS_LIMITS, CalculationModel.HEMISPHERICAL);
  }, [soundPower]);

  const handlePowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setSoundPower(val);
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) setDistance(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Volume2 size={28} />
              </div>
              SoundLevel Pro
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Bereken en visualiseer geluidsverspreiding conform Vlaamse richtlijnen.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <Info size={16} />
            <span>Model: Halve bol (Hemisferisch) - Q=2</span>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls & Numeric Result */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div className="flex items-center gap-2 text-slate-800 font-semibold border-b border-slate-100 pb-2">
                <Calculator size={20} className="text-blue-500" />
                <h2>Parameters</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="lw" className="block text-sm font-medium text-slate-700 mb-1">
                    Bronvermogen ($L_w$) in dB
                  </label>
                  <div className="relative">
                    <input
                      id="lw"
                      type="number"
                      value={soundPower}
                      onChange={handlePowerChange}
                      className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-lg"
                    />
                    <div className="absolute right-3 top-3 text-slate-400 font-medium">dB</div>
                  </div>
                  <input 
                    type="range" 
                    min="30" 
                    max="120" 
                    value={soundPower} 
                    onChange={handlePowerChange}
                    className="w-full mt-2 accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-slate-400 mt-1">Typisch warmtepomp: 50 - 70 dB</p>
                </div>

                <div>
                  <label htmlFor="dist" className="block text-sm font-medium text-slate-700 mb-1">
                    Afstand tot bron ($r$) in meters
                  </label>
                  <div className="relative">
                    <input
                      id="dist"
                      type="number"
                      value={distance}
                      onChange={handleDistanceChange}
                      className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-lg"
                    />
                    <div className="absolute right-3 top-3 text-slate-400 font-medium">m</div>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={distance} 
                    onChange={handleDistanceChange}
                    className="w-full mt-2 accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className="bg-slate-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
               {/* Decorative background circle */}
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
               
               <h3 className="text-slate-300 font-medium text-sm uppercase tracking-wider mb-1">Geluidsdrukniveau ($L_p$)</h3>
               <div className="flex items-baseline gap-2 mt-2">
                 <span className="text-6xl font-bold tracking-tighter text-white">
                   {resultLp}
                 </span>
                 <span className="text-xl text-slate-400 font-medium">dB</span>
               </div>
               
               <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="block text-slate-400 mb-1">Demping</span>
                   <span className="font-mono text-blue-300">{(soundPower - resultLp).toFixed(1)} dB</span>
                 </div>
                 <div>
                   <span className="block text-slate-400 mb-1">Afstand</span>
                   <span className="font-mono text-blue-300">{distance}m</span>
                 </div>
               </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800">
               <h4 className="font-semibold mb-2 flex items-center gap-2">
                 <Info size={16}/> Wetgeving Vlaanderen
               </h4>
               <p className="mb-1">
                 Richtwaarden perceelsgrens (woongebied):
               </p>
               <ul className="list-disc list-inside space-y-1 ml-1 text-orange-700/80">
                 <li>Overdag (07-19u): <strong>45 dB(A)</strong></li>
                 <li>Avond (19-22u): <strong>40 dB(A)</strong></li>
                 <li>Nacht (22-07u): <strong>35 dB(A)</strong></li>
               </ul>
            </div>

          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex-1 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Map size={20} className="text-blue-500" />
                    Plattegrond Visualisatie
                  </h2>
                  <div className="text-xs text-slate-500 font-mono">
                    Rood = Wettelijke grenzen
                  </div>
                </div>
                <div className="flex-1 w-full h-full p-4">
                  <SoundMap params={{ soundPower, distance }} resultLp={resultLp} contours={contours} />
                </div>
             </div>

             <AIAdvisor soundPower={soundPower} distance={distance} resultLp={resultLp} />
          </div>
        </div>

        <footer className="text-center text-slate-400 text-sm py-8">
          <p>© {new Date().getFullYear()} SoundLevel Pro. Gebaseerd op standaard ISO akoestische formules ($L_p = L_w - 20 \cdot \log(r) - 8$).</p>
        </footer>
      </div>
    </div>
  );
};

export default App;