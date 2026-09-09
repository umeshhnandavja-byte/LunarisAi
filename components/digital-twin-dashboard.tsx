"use client";

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Compass, RotateCw, Settings2, X, Activity, Droplets, Mountain } from 'lucide-react';
import MoonSphere, { CRATERS } from './moon-sphere';

// Mock analytics data for the inspector panel
const CRATER_ANALYTICS: Record<string, any> = {
  Shackleton: { waterProb: 94, depth: 4.2, rimElev: 1.5, shadowCov: 88, temp: -173, opticalRes: '0.25m/px' },
  Boguslawsky: { waterProb: 65, depth: 3.4, rimElev: 1.2, shadowCov: 45, temp: -80, opticalRes: '0.3m/px' },
  Manzinus: { waterProb: 55, depth: 2.8, rimElev: 0.9, shadowCov: 50, temp: -75, opticalRes: '0.3m/px' },
  Tycho: { waterProb: 12, depth: 4.8, rimElev: 2.1, shadowCov: 20, temp: -20, opticalRes: '0.25m/px' },
  Copernicus: { waterProb: 8, depth: 3.8, rimElev: 1.2, shadowCov: 15, temp: -15, opticalRes: '0.25m/px' },
  Kepler: { waterProb: 5, depth: 2.6, rimElev: 1.0, shadowCov: 10, temp: -10, opticalRes: '0.3m/px' },
  Aristarchus: { waterProb: 15, depth: 3.0, rimElev: 1.3, shadowCov: 18, temp: -12, opticalRes: '0.25m/px' },
  Plato: { waterProb: 35, depth: 1.0, rimElev: 1.5, shadowCov: 60, temp: -60, opticalRes: '0.25m/px' },
  Clavius: { waterProb: 40, depth: 3.5, rimElev: 1.8, shadowCov: 40, temp: -45, opticalRes: '0.3m/px' },
  Ptolemaeus: { waterProb: 10, depth: 2.4, rimElev: 1.1, shadowCov: 12, temp: -5, opticalRes: '0.25m/px' },
};

export default function DigitalTwinDashboard() {
  const [selectedCrater, setSelectedCrater] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const handleCraterSelect = (craterId: string) => {
    setSelectedCrater(craterId);
    setAutoRotate(false);
  };

  const handleResetOrientation = () => {
    setSelectedCrater(null);
    setAutoRotate(true);
  };

  const activeCrater = CRATERS.find(c => c.id === selectedCrater);
  const analytics = selectedCrater ? CRATER_ANALYTICS[selectedCrater] : null;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* 3D Canvas Area */}
      <div className="relative flex-grow h-full cursor-grab active:cursor-grabbing">
        
        {/* Top Header */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 drop-shadow-sm">Lunar Digital Twin</h1>
          <p className="text-slate-500 font-mono text-sm mt-1">Chandrayaan-2 Synthetic Environment</p>
        </div>

        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Suspense fallback={null}>
            <MoonSphere 
              selectedCrater={selectedCrater} 
              onCraterSelect={handleCraterSelect}
              autoRotate={autoRotate}
            />
          </Suspense>
        </Canvas>

        {/* Floating Navigation Toolbar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-lg flex items-center gap-4">
          <button 
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${autoRotate ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
            title="Toggle Auto-Rotate"
          >
            <RotateCw className={`w-5 h-5 ${autoRotate ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '4s' }} />
          </button>
          
          <button 
            onClick={handleResetOrientation}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            title="Reset Orientation"
          >
            <Compass className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-slate-300"></div>

          <select 
            className="bg-transparent border-none text-sm font-medium text-slate-700 outline-none cursor-pointer pr-2"
            value={selectedCrater || ""}
            onChange={(e) => {
              if (e.target.value) handleCraterSelect(e.target.value);
              else handleResetOrientation();
            }}
          >
            <option value="">Jump to target...</option>
            {CRATERS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scientific Inspector Drawer */}
      <div 
        className={`
          flex-shrink-0 bg-white border-l border-slate-200 shadow-2xl transition-all duration-500 ease-in-out
          ${selectedCrater ? 'w-[360px] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-12 overflow-hidden'}
        `}
      >
        {activeCrater && analytics && (
          <div className="h-full w-[360px] flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Target Acquired</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{activeCrater.name}</h2>
                <p className="text-sm font-mono text-slate-500 mt-1">
                  Lat: {activeCrater.lat.toFixed(2)}° | Lon: {activeCrater.lon.toFixed(2)}°
                </p>
              </div>
              <button onClick={() => setSelectedCrater(null)} className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analytics Cards */}
            <div className="p-6 space-y-5 flex-grow">
              
              {/* IIRS Mineral & Water Box */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-blue-800">
                  <Droplets className="w-4 h-4" />
                  <h3 className="font-semibold text-sm">IIRS Spectrometry</h3>
                </div>
                
                <div className="mb-2 flex justify-between items-end">
                  <span className="text-xs text-slate-600 font-medium">Water/Hydroxyl Probability</span>
                  <span className="text-lg font-bold text-blue-600">{analytics.waterProb}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2 mb-4">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${analytics.waterProb}%` }}></div>
                </div>
                
                <div className="text-xs text-slate-600 flex justify-between">
                  <span>Detected Absorption:</span>
                  <span className="font-mono text-slate-800">3000nm H₂O band</span>
                </div>
              </div>

              {/* TMC-2 Altimetry Badge */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-amber-800">
                  <Mountain className="w-4 h-4" />
                  <h3 className="font-semibold text-sm">TMC-2 Altimetry</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Crater Depth</div>
                    <div className="text-lg font-bold text-amber-700">{analytics.depth} km</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Rim Elevation</div>
                    <div className="text-lg font-bold text-amber-700">+{analytics.rimElev} km</div>
                  </div>
                </div>
              </div>

              {/* OHRC & Illumination Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-700 mb-1">
                  <Settings2 className="w-4 h-4" />
                  <h3 className="font-semibold text-sm">Optical & Illumination Data</h3>
                </div>
                
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500">OHRC Resolution</span>
                  <span className="font-mono font-medium">{analytics.opticalRes}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Local Temperature</span>
                  <span className="font-mono font-medium">{analytics.temp}°C</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Shadow Coverage</span>
                  <span className="font-mono font-medium">{analytics.shadowCov}%</span>
                </div>
              </div>

            </div>

            {/* Action Footer */}
            <div className="p-6 border-t border-slate-200 bg-white">
              <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg">
                <Activity className="w-4 h-4" />
                Load in Correspondence Engine
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
