"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const MOON_RADIUS = 2; // Arbitrary radius for rendering

// Specific 10 Craters requested with mock stats
export const CRATERS = [
  { id: 'Shackleton', name: 'Shackleton', lat: -89.67, lon: 129.78, stats: { waterProb: 94, depth: 4.2 } },
  { id: 'Boguslawsky', name: 'Boguslawsky', lat: -72.9, lon: 43.2, stats: { waterProb: 65, depth: 3.4 } },
  { id: 'Manzinus', name: 'Manzinus', lat: -67.5, lon: 26.8, stats: { waterProb: 55, depth: 2.8 } },
  { id: 'Tycho', name: 'Tycho', lat: -43.3, lon: -11.2, stats: { waterProb: 12, depth: 4.8 } },
  { id: 'Copernicus', name: 'Copernicus', lat: 9.6, lon: -20.0, stats: { waterProb: 8, depth: 3.8 } },
  { id: 'Kepler', name: 'Kepler', lat: 8.1, lon: -38.0, stats: { waterProb: 5, depth: 2.6 } },
  { id: 'Aristarchus', name: 'Aristarchus', lat: 23.7, lon: -47.4, stats: { waterProb: 15, depth: 3.0 } },
  { id: 'Plato', name: 'Plato', lat: 51.6, lon: -9.3, stats: { waterProb: 35, depth: 1.0 } },
  { id: 'Clavius', name: 'Clavius', lat: -58.4, lon: -14.4, stats: { waterProb: 40, depth: 3.5 } },
  { id: 'Ptolemaeus', name: 'Ptolemaeus', lat: -9.2, lon: -1.8, stats: { waterProb: 10, depth: 2.4 } }
];

// Helper to convert lat/lon to 3D position
function getPositionFromLatLon(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180); // Offset to standard spherical mapping
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  
  return [x, y, z];
}

interface MoonSphereProps {
  selectedCrater: string | null;
  onCraterSelect: (craterId: string | null) => void;
  autoRotate: boolean;
}

export default function MoonSphere({ selectedCrater, onCraterSelect, autoRotate }: MoonSphereProps) {
  const moonRef = useRef<THREE.Mesh>(null);
  const controlsRef = useRef<any>(null);
  const isResetting = useRef(false);
  
  // Use locally downloaded image to avoid all CORS/network issues
  const colorMap = useLoader(THREE.TextureLoader, '/moon.jpg');
  
  const { camera } = useThree();

  React.useEffect(() => {
    if (selectedCrater === null) {
      isResetting.current = true;
    } else {
      isResetting.current = false;
    }
  }, [selectedCrater]);

  // Handle smooth rotation to target crater or reset to default
  useFrame((state, delta) => {
    if (controlsRef.current) {
      if (selectedCrater) {
        const crater = CRATERS.find(c => c.id === selectedCrater);
        if (crater) {
          const [cx, cy, cz] = getPositionFromLatLon(crater.lat, crater.lon, MOON_RADIUS);
          const targetVec = new THREE.Vector3(cx, cy, cz);
          
          // Slightly elevate the camera target
          const cameraPos = targetVec.clone().normalize().multiplyScalar(MOON_RADIUS * 2.5);
          
          state.camera.position.lerp(cameraPos, 0.05);
          controlsRef.current.target.lerp(targetVec, 0.05);
        }
      } else if (isResetting.current) {
        // Reset to default overview
        const defaultCameraPos = new THREE.Vector3(0, 0, 5);
        const defaultTarget = new THREE.Vector3(0, 0, 0);
        
        state.camera.position.lerp(defaultCameraPos, 0.05);
        controlsRef.current.target.lerp(defaultTarget, 0.05);

        if (state.camera.position.distanceTo(defaultCameraPos) < 0.01) {
          isResetting.current = false;
        }
      }
      controlsRef.current.update();
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[-10, -10, -10]} intensity={0.2} />
      
      <OrbitControls 
        ref={controlsRef}
        onStart={() => { isResetting.current = false; }}
        enablePan={false}
        enableZoom={true}
        minDistance={2.5}
        maxDistance={8}
        autoRotate={autoRotate && !selectedCrater}
        autoRotateSpeed={0.5}
      />
      
      <mesh ref={moonRef} onClick={() => onCraterSelect(null)}>
        <sphereGeometry args={[MOON_RADIUS, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap}
          roughness={0.9}
          metalness={0.1}
        />
        
        {CRATERS.map((crater) => {
          const pos = getPositionFromLatLon(crater.lat, crater.lon, MOON_RADIUS);
          const isSelected = selectedCrater === crater.id;
          
          return (
            <Html 
              key={crater.id} 
              position={pos} 
              center 
              distanceFactor={10}
            >
              <div 
                className="relative group cursor-pointer flex items-end -translate-x-[20px] -translate-y-[20px]"
                onClick={(e) => {
                  e.stopPropagation();
                  onCraterSelect(isSelected ? null : crater.id);
                }}
              >
                {/* Surface dot removed as requested */}
                
                {/* Angled Line (SVG) */}
                <svg className="absolute left-[20px] bottom-[20px] pointer-events-none" width="30" height="20" style={{ overflow: 'visible' }}>
                  <path d="M 0 0 L 15 -15 L 30 -15" stroke={isSelected ? "#2563eb" : "white"} strokeWidth="1.5" fill="none" className="drop-shadow-sm" />
                </svg>

                {/* The Label */}
                <div 
                  className={`
                    ml-[45px] mb-[28px] px-2 py-1 rounded-sm text-xs font-mono font-bold whitespace-nowrap shadow-sm
                    transition-all duration-200 border
                    ${isSelected 
                      ? 'bg-blue-600 text-white border-blue-400 z-50 shadow-blue-500/50' 
                      : 'bg-white/90 text-slate-800 border-slate-300 group-hover:bg-white group-hover:-translate-y-1'
                    }
                  `}
                >
                  {crater.name}
                  
                  {/* Hover Data Tooltip */}
                  <div className={`
                    absolute left-[45px] top-[15px] mt-1 p-2 bg-white text-slate-700 text-[10px] rounded-md shadow-xl border border-slate-200
                    transition-opacity pointer-events-none w-32 z-50
                    ${isSelected ? 'opacity-100 block' : 'opacity-0 group-hover:opacity-100 block'}
                  `}>
                    <div className="text-slate-500 font-semibold mb-1 border-b border-slate-100 pb-1">{crater.name} Data</div>
                    <div className="flex justify-between"><span>Water Prob:</span> <span className="font-bold text-blue-600">{crater.stats.waterProb}%</span></div>
                    <div className="flex justify-between"><span>Depth:</span> <span className="font-bold text-amber-600">{crater.stats.depth}km</span></div>
                  </div>
                </div>
              </div>
            </Html>
          );
        })}
      </mesh>
    </>
  );
}
