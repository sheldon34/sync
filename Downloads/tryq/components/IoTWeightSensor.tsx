
import React, { useState, useEffect } from 'react';
import { Scale, RefreshCw, Lock, Cpu } from 'lucide-react';

interface IoTWeightSensorProps {
  onWeightLocked: (weight: number) => void;
  pricePerKg: number;
}

export const IoTWeightSensor: React.FC<IoTWeightSensorProps> = ({ onWeightLocked, pricePerKg }) => {
  const [currentWeight, setCurrentWeight] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simulating && !isLocked) {
      interval = setInterval(() => {
        const fluctuation = Math.random() * 2 - 1;
        const baseWeight = Math.floor(Math.random() * (450 - 10 + 1)) + 10;
        setCurrentWeight(prev => prev > 0 ? prev + fluctuation : baseWeight);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simulating, isLocked]);

  const toggleSimulation = () => {
    if (!simulating) {
      setSimulating(true);
      setIsLocked(false);
    } else {
      setSimulating(false);
      setCurrentWeight(0);
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    setSimulating(false);
    onWeightLocked(parseFloat(currentWeight.toFixed(2)));
  };

  return (
    <div className="relative group">
        {/* Glow Effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-mpesa to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${simulating ? 'opacity-60' : ''}`}></div>
        
        <div className="relative bg-gray-900 rounded-2xl p-1 shadow-2xl overflow-hidden">
            {/* Inner Bezel */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700/50">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Cpu className={`text-gray-500 ${simulating ? 'animate-pulse text-green-400' : ''}`} size={16} />
                        <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">IoT SENSOR NET_01</span>
                    </div>
                    <div className="flex gap-1">
                        {[1,2,3].map(i => (
                            <div key={i} className={`w-1 h-3 rounded-full ${simulating ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`} style={{animationDelay: `${i*0.1}s`}}></div>
                        ))}
                    </div>
                </div>

                {/* Display Area */}
                <div className="bg-[#0a0f14] rounded-lg p-6 mb-6 relative border border-gray-700 shadow-inner">
                    {/* LCD Reflection */}
                    <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 pointer-events-none"></div>
                    
                    <div className="flex items-baseline justify-end gap-2">
                        <span className={`text-5xl font-digital tracking-wider ${simulating ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-600'}`}>
                            {currentWeight.toFixed(2)}
                        </span>
                        <span className="text-gray-500 font-bold text-sm">KG</span>
                    </div>
                    
                    <div className="h-px w-full bg-gray-800 my-3"></div>
                    
                    <div className="flex justify-between items-center font-mono text-xs">
                        <div className="text-gray-500">UNIT PRICE: <span className="text-gray-300">KES {pricePerKg}</span></div>
                        <div className="text-mpesa">VAL: KES {(currentWeight * pricePerKg).toFixed(0)}</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={toggleSimulation}
                        disabled={isLocked}
                        className={`py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border
                            ${simulating 
                                ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20' 
                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            } ${isLocked ? 'opacity-20 cursor-not-allowed' : ''}`}
                    >
                        {simulating ? 'Stop Stream' : 'Initialize'}
                    </button>
                    
                    <button 
                        onClick={handleLock}
                        disabled={!simulating || isLocked}
                        className={`py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border flex items-center justify-center gap-2
                            ${isLocked
                                ? 'bg-mpesa text-white border-mpesa shadow-[0_0_15px_rgba(36,176,75,0.4)]' 
                                : 'bg-gray-700 border-gray-600 text-gray-500'
                            } ${simulating && !isLocked ? 'hover:text-white hover:border-white' : ''}`}
                    >
                        {isLocked ? <Lock size={12} /> : null}
                        {isLocked ? 'Weight Locked' : 'Capture Data'}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
