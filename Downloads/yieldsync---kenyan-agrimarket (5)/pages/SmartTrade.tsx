import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Truck, Wallet, RotateCcw } from 'lucide-react';
import { IoTWeightSensor } from '../components/IoTWeightSensor';
import { LogisticsHandshake } from '../components/LogisticsHandshake';
import { initiateSTKPush, processSplitSettlement, calculateSplit } from '../services/mockPayHero';
import { TradeStep, SplitResult } from '../types';
import { toast } from 'sonner';

export const SmartTrade: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<TradeStep>('weighing');
  const [weight, setWeight] = useState(0);
  const [pricePerKg] = useState(120); // Fixed rate for demo
  const [tradeId] = useState(`TRD-${Math.floor(Math.random()*100000)}`);
  const [splitData, setSplitData] = useState<SplitResult | null>(null);

  // Step 1: Weight Locked
  const handleWeightLocked = (w: number) => {
    setWeight(w);
    const total = w * pricePerKg;
    setSplitData(calculateSplit(total));
    toast.success(`Weight Locked: ${w}kg`);
    setTimeout(() => setCurrentStep('payment_escrow'), 1000);
  };

  // Step 2: Escrow Payment (Buyer/Driver initiates)
  const handleEscrowPayment = async () => {
    const loadingToast = toast.loading("Processing STK Push...");
    try {
        await initiateSTKPush("254712345678", weight * pricePerKg);
        toast.dismiss(loadingToast);
        toast.success("Funds Secured in PayHero Escrow");
        setCurrentStep('logistics_handshake');
    } catch (e) {
        toast.error("Payment Failed");
    }
  };

  // Step 3: Handshake Success
  const handleHandshakeSuccess = () => {
    setCurrentStep('settlement');
    handleSettlement();
  };

  // Step 4: Split Settlement
  const handleSettlement = async () => {
    const loadingToast = toast.loading("Disbursing Split Payments...");
    if (splitData) {
        await processSplitSettlement(splitData.total);
        toast.dismiss(loadingToast);
        toast.success("Payouts Complete!");
        setCurrentStep('complete');
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                <ArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-lg">SmartTrade™ Logistics</h1>
        </div>
        
        {/* Progress Stepper */}
        <div className="flex justify-between px-4">
            {['weighing', 'payment_escrow', 'logistics_handshake', 'complete'].map((step, idx) => {
                const isActive = currentStep === step;
                const isPast = ['weighing', 'payment_escrow', 'logistics_handshake', 'settlement', 'complete'].indexOf(currentStep) > idx;
                
                return (
                    <div key={step} className="flex flex-col items-center gap-1">
                        <div className={`w-3 h-3 rounded-full transition-all ${isActive ? 'bg-mpesa scale-150 ring-2 ring-white' : isPast ? 'bg-green-800' : 'bg-gray-700'}`}></div>
                    </div>
                );
            })}
        </div>
        <div className="text-center mt-2 text-xs text-gray-400 font-mono uppercase">
            ID: {tradeId}
        </div>
      </div>

      <div className="p-4 -mt-4">
        
        {/* STEP 1: IOT WEIGHING */}
        {currentStep === 'weighing' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-2">1. Weigh Harvest</h2>
                    <p className="text-sm text-gray-500 mb-4">Place produce on the IoT Scale to stream real-time weight data.</p>
                    <IoTWeightSensor onWeightLocked={handleWeightLocked} pricePerKg={pricePerKg} />
                </div>
            </div>
        )}

        {/* STEP 2: ESCROW PAYMENT */}
        {currentStep === 'payment_escrow' && splitData && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-mpesa text-center">
                    <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Confirm Payment</h2>
                    <p className="text-gray-500 mb-6">Secure funds in PayHero Escrow before handover.</p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Weight</span>
                            <span className="font-mono font-bold">{weight} KG</span>
                        </div>
                        <div className="flex justify-between text-lg border-t border-gray-200 pt-2">
                            <span className="font-bold text-gray-800">Total</span>
                            <span className="font-bold text-mpesa">KES {splitData.total.toLocaleString()}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleEscrowPayment}
                        className="w-full bg-mpesa text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
                    >
                        Initiate M-Pesa Escrow
                    </button>
                 </div>
            </div>
        )}

        {/* STEP 3: LOGISTICS HANDSHAKE */}
        {currentStep === 'logistics_handshake' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                {/* Simulated Switcher for Demo */}
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800 mb-4">
                    <strong>Demo Mode:</strong> The QR Code below is generated for the Farmer. 
                    <br/>Normally, the Driver would be on a separate device scanning this.
                    <br/><button onClick={() => setCurrentStep('settlement')} className="underline mt-1">Skip to Settlement (Debug)</button>
                </div>

                <LogisticsHandshake 
                    mode="farmer" 
                    payload={tradeId} 
                    onSuccess={() => {}} // Farmer waits
                />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 text-gray-500">DRIVER ACTION</span>
                    </div>
                </div>

                <LogisticsHandshake 
                    mode="driver" 
                    payload={tradeId} 
                    onSuccess={handleHandshakeSuccess} 
                />
            </div>
        )}

        {/* STEP 4: SETTLEMENT & SUMMARY */}
        {(currentStep === 'settlement' || currentStep === 'complete') && splitData && (
             <div className="animate-in zoom-in duration-500">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="bg-green-600 p-6 text-center text-white">
                        <CheckCircle size={64} className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">Trade Completed!</h2>
                        <p className="opacity-90">Funds have been split and disbursed.</p>
                    </div>

                    <div className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Smart Split Summary</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-full text-green-600 font-bold">F</div>
                                    <div>
                                        <div className="font-bold text-gray-800">Farmer (90%)</div>
                                        <div className="text-xs text-gray-500">M-Pesa Sent</div>
                                    </div>
                                </div>
                                <div className="font-bold text-green-700">KES {splitData.farmerAmount.toLocaleString()}</div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-full text-blue-600 font-bold">D</div>
                                    <div>
                                        <div className="font-bold text-gray-800">Driver (7%)</div>
                                        <div className="text-xs text-gray-500">Wallet Credited</div>
                                    </div>
                                </div>
                                <div className="font-bold text-blue-700">KES {splitData.driverAmount.toLocaleString()}</div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-full text-gray-600 font-bold">P</div>
                                    <div>
                                        <div className="font-bold text-gray-800">YieldSync (3%)</div>
                                        <div className="text-xs text-gray-500">Service Fee</div>
                                    </div>
                                </div>
                                <div className="font-bold text-gray-700">KES {splitData.platformAmount.toLocaleString()}</div>
                            </div>
                        </div>

                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full mt-8 bg-gray-900 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} /> Start New Trade
                        </button>
                    </div>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};
