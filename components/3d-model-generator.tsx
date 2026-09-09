"use client";

import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import { UploadCloud, FileImage, Loader2, Download, Box, Plus, Trash2, Maximize } from 'lucide-react';

type ProcessState = 'idle' | 'processing' | 'complete';

// --- 3D STL Terrain Component ---
function StlTerrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load the actual .stl file from the public directory
  const geometry = useLoader(STLLoader, '/crater.stl');

  // Center the geometry and compute normals
  useMemo(() => {
    geometry.computeVertexNormals();
    geometry.center();
  }, [geometry]);

  // Slowly rotate the model for dramatic effect
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z -= 0.001; // Adjust axis depending on STL orientation
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial 
        color="#8a8d91" 
        roughness={0.8} 
        metalness={0.2}
        flatShading={true}
      />
    </mesh>
  );
}

// --- Main Dashboard Component ---
export default function ThreeDModelGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [files, setFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simulated drag and drop interactions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Simulate adding multiple files
    const newFiles = Array.from(e.dataTransfer.files).map(f => f.name);
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      // Fallback if dropped something else
      setFiles(prev => [...prev, `lunar_dataset_${Date.now().toString().slice(-4)}.tiff`]);
    }
  };

  const addMockFile = () => {
    const mockNames = ['ohrc_band1_highres.tiff', 'tmc2_stereo_dem.raw', 'iirs_thermal_map.xml'];
    const nextName = mockNames[files.length % mockNames.length];
    setFiles(prev => [...prev, `${nextName}`]);
  };

  const handleGenerate = () => {
    setProcessState('processing');
    setTimeout(() => setProcessState('complete'), 2500);
  };
  
  const handleReset = () => {
    setProcessState('idle');
    setFiles([]);
  };

  if (!isMounted) return null;

  return (
    <div className="relative h-screen w-full bg-[#111111] overflow-hidden font-sans text-slate-200">
      
      {/* 3D Viewer Background */}
      <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0">
        
        {/* Empty State Background Grid */}
        {processState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px]" />
            <Box className="w-64 h-64 text-white opacity-20 animate-pulse" />
          </div>
        )}

        {/* Processing State */}
        {processState === 'processing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#111]/80 backdrop-blur-sm">
            <div className="w-24 h-24 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
            <h2 className="text-2xl font-mono text-white tracking-widest uppercase">Synthesizing Mesh</h2>
            <p className="text-slate-400 mt-2 font-mono text-sm">Aligning {files.length} coordinate layers...</p>
          </div>
        )}

        {/* Complete State - Render 3D Canvas */}
        {processState === 'complete' && (
          <Canvas camera={{ position: [0, 8, 20], fov: 45 }} shadows>
            <ambientLight intensity={0.2} />
            <directionalLight position={[15, 20, 5]} intensity={2.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <directionalLight position={[-15, 5, -15]} intensity={0.5} color="#4775ff" />
            
            <Suspense fallback={null}>
              <StlTerrain />
            </Suspense>
            
            <Grid 
              position={[0, -2.1, 0]} 
              args={[50, 50]} 
              cellColor="#333" 
              sectionColor="#444" 
              fadeDistance={30} 
            />
            <OrbitControls 
              enableDamping 
              dampingFactor={0.05} 
              maxPolarAngle={Math.PI / 2.1} 
              minDistance={5} 
              maxDistance={40} 
            />
          </Canvas>
        )}
        
        {/* HUD Overlay when complete */}
        {processState === 'complete' && (
          <div className="absolute bottom-8 right-8 z-20 flex gap-4 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md border border-slate-700/50 px-4 py-3 rounded-lg text-xs font-mono text-slate-300 shadow-2xl flex gap-6">
              <div className="flex flex-col">
                <span className="text-slate-500 uppercase">Vertices</span>
                <span className="text-white text-base">3,844</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 uppercase">Faces</span>
                <span className="text-white text-base">7,200</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 uppercase">Scale</span>
                <span className="text-white text-base">1:1000</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Foreground Left Panel (Glassmorphism) */}
      <div className="absolute top-8 left-8 bottom-8 w-[400px] z-30 flex flex-col gap-4">
        
        {/* Header Panel */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-2xl shadow-black/10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">3D Generator</h1>
          <p className="text-slate-500 text-sm">Drop multi-modal orbital imagery to synthesize volumetric terrain.</p>
        </div>

        {/* Input Panel */}
        <div className="flex-grow bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-2xl shadow-black/10 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Data Layers</h2>
            <button onClick={addMockFile} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors" title="Browse files">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div 
            onClick={() => document.getElementById('file-upload')?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 mb-6 cursor-pointer
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'}
            `}
          >
            <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-blue-500 animate-bounce' : 'text-slate-400'}`} />
            <p className="text-sm font-medium text-slate-700">Drag & Drop files or click to select</p>
            <p className="text-xs text-slate-500 mt-2 font-mono">Accepts .TIFF, .RAW, .XML</p>
            <input 
              id="file-upload" 
              type="file" 
              multiple 
              accept=".tiff,.tif,.raw,.xml"
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const newFiles = Array.from(e.target.files).map(f => f.name);
                  setFiles(prev => [...prev, ...newFiles]);
                }
              }} 
            />
          </div>

          {/* File List */}
          <div className="flex-grow overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
            {files.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                No layers registered
              </div>
            ) : (
              files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg group shadow-sm">
                  <FileImage className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-mono text-slate-700 truncate flex-grow">{file}</span>
                  <button 
                    onClick={() => setFiles(f => f.filter((_, i) => i !== idx))}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <button 
              onClick={() => {
                if (processState === 'idle') handleGenerate();
                else if (processState === 'complete') handleReset();
              }}
              disabled={files.length === 0 || processState === 'processing'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:bg-slate-300 shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {processState === 'idle' ? 'Synthesize Terrain' : (processState === 'processing' ? 'Processing...' : 'Reset Workspace')}
            </button>
            
            {processState === 'complete' && (
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 font-medium py-3 px-2 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-300 shadow-sm text-sm"
                  onClick={() => alert('Downloading GeoTIFF metadata...')}
                >
                  <Download className="w-4 h-4 shrink-0" />
                  Export .GeoTIFF
                </button>
                <a 
                  href="/crater.stl"
                  download="generated_crater.stl"
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 font-medium py-3 px-2 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-300 shadow-sm text-sm"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  Export .STL
                </a>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
