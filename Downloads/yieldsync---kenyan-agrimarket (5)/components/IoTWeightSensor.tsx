import React, { useState, useEffect } from 'react';
import { Scale, RefreshCw, Lock } from 'lucide-react';

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
        // Random fluctuation between 10kg and 500kg
        const fluctuation = Math.random() * 2 - 1; // +/- 1kg jitter
        const baseWeight = Math.floor(Math.random() * (450 - 10 + 1)) + 10;
        setCurrentWeight(prev => {
            // If we have a base, just jitter it, otherwise pick new base
            return prev > 0 ? prev + fluctuation : baseWeight; 
        });
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
    <div className="bg-gray-900 p-6 rounded-xl text-green-500 shadow-2xl border-4 border-gray-700 relative overflow-hidden">
        {/* Glass Reflection effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <div className="flex items-center gap-2 text-gray-400">
                <Scale size={18} />
                <span className="text-xs uppercase tracking-widest">IoT Smart Scale</span>
            </div>
            <div className={`h-2 w-2 rounded-full ${simulating ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        </div>

        <div className="text-right mb-6">
            <div className="text-6xl font-digital font-bold tracking-widest text-mpesa drop-shadow-[0_0_10px_rgba(36,176,75,0.8)]">
                {currentWeight.toFixed(2)}
            </div>
            <div className="text-xl text-gray-500 font-digital mt-1">KG</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-gray-300 text-sm font-mono mb-6">
            <div className="flex justify-between border-b border-gray-800 py-1">
                <span>RATE:</span>
                <span>{pricePerKg}/KG</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 py-1">
                <span>EST. VALUE:</span>
                <span className="text-white">KES {(currentWeight * pricePerKg).toFixed(0)}</span>
            </div>
        </div>

        <div className="flex gap-3">
            <button 
                onClick={toggleSimulation}
                disabled={isLocked}
                className={`flex-1 py-3 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all
                    ${isLocked ? 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
            >
                <RefreshCw size={16} className={simulating ? 'animate-spin' : ''} />
                {simulating ? 'Reading...' : 'Start Stream'}
            </button>
            <button 
                onClick={handleLock}
                disabled={!simulating || isLocked}
                className={`flex-1 py-3 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all
                    ${!simulating || isLocked 
                        ? 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500' 
                        : 'bg-mpesa text-white hover:bg-green-600 shadow-[0_0_15px_rgba(36,176,75,0.4)]'}`}
            >
                <Lock size={16} />
                {isLocked ? 'LOCKED' : 'LOCK WEIGHT'}
            </button>
        </div>
    </div>
  );
};
