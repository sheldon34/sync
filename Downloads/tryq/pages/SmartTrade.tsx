
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Wallet, RotateCcw, Truck, Scale, ShieldCheck } from 'lucide-react';
import { IoTWeightSensor } from '../components/IoTWeightSensor';
import { LogisticsHandshake } from '../components/LogisticsHandshake';
import { initiateSTKPush, processSplitSettlement, calculateSplit } from '../services/payHeroService';
import { TradeStep, SplitResult } from '../types';
import { toast } from 'sonner';

export const SmartTrade: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<TradeStep>('weighing');
  const [weight, setWeight] = useState(0);
  const [pricePerKg] = useState(120);
  const [tradeId] = useState(`TRD-${Math.floor(Math.random()*100000)}`);
  const [splitData, setSplitData] = useState<SplitResult | null>(null);

  // Logic Handlers
  const handleWeightLocked = (w: number) => {
    setWeight(w);
    const total = w * pricePerKg;
    setSplitData(calculateSplit(total));
    toast.success(`Weight Verified: ${w}kg`);
    setTimeout(() => setCurrentStep('payment_escrow'), 1200);
  };

  const handleEscrowPayment = async () => {
    const loadingToast = toast.loading("Securing Funds via PayHero...");
    try {
        await initiateSTKPush("254712345678", weight * pricePerKg);
        toast.dismiss(loadingToast);
        toast.success("Escrow Secured");
        setCurrentStep('logistics_handshake');
    } catch (e) {
        toast.error("Payment Failed");
    }
  };

  const handleHandshakeSuccess = () => {
    setCurrentStep('settlement');
    handleSettlement();
  };

  const handleSettlement = async () => {
    const loadingToast = toast.loading("Executing Smart Contracts...");
    if (splitData) {
        await processSplitSettlement(splitData.total);
        toast.dismiss(loadingToast);
        toast.success("Trade Settled Successfully!");
        setCurrentStep('complete');
    }
  };

  const StepIndicator = ({ step, icon: Icon, label, activeStep }: any) => {
    const steps = ['weighing', 'payment_escrow', 'logistics_handshake', 'complete'];
    const idx = steps.indexOf(step);
    const currentIdx = steps.indexOf(activeStep);
    const isActive = step === activeStep;
    const isCompleted = currentIdx > idx;

    return (
        <div className={`flex flex-col items-center gap-2 z-10 ${isActive ? 'scale-110' : 'opacity-60'} transition-all duration-300`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500
                ${isActive ? 'bg-mpesa border-mpesa text-white shadow-lg shadow-green-200' : 
                  isCompleted ? 'bg-green-100 border-green-200 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-safe">
      {/* Header */}
      <div className="bg-white p-6 pb-4 pt-safe shadow-sm">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <div>
                <h1 className="font-bold text-xl text-gray-900">SmartTrade™ Logistics</h1>
                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    SESSION ID: {tradeId}
                </div>
            </div>
        </div>
        
        {/* Stepper */}
        <div className="relative flex justify-between px-2">
            <div className="absolute top-5 left-4 right-4 h-0.5 bg-gray-100 -z-0"></div>
            <div className={`absolute top-5 left-4 h-0.5 bg-mpesa transition-all duration-700 -z-0`} 
                 style={{width: `${(['weighing', 'payment_escrow', 'logistics_handshake', 'complete'].indexOf(currentStep) / 3) * 100}%`}}></div>
            
            <StepIndicator step="weighing" activeStep={currentStep} icon={Scale} label="Weigh" />
            <StepIndicator step="payment_escrow" activeStep={currentStep} icon={Wallet} label="Escrow" />
            <StepIndicator step="logistics_handshake" activeStep={currentStep} icon={ShieldCheck} label="Verify" />
            <StepIndicator step="complete" activeStep={currentStep} icon={Truck} label="Done" />
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto">
        
        {/* STEP 1: IOT WEIGHING */}
        {currentStep === 'weighing' && (
            <div className="animate-slide-up">
                <div className="bg-white p-1 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <div className="bg-blue-50/50 rounded-[1.2rem] p-4 text-center mb-1">
                         <h2 className="font-bold text-gray-800 text-lg">Digital Weighing</h2>
                         <p className="text-sm text-gray-500 max-w-[200px] mx-auto">Place produce on the IoT Scale to stream data.</p>
                    </div>
                </div>
                <IoTWeightSensor onWeightLocked={handleWeightLocked} pricePerKg={pricePerKg} />
            </div>
        )}

        {/* STEP 2: ESCROW PAYMENT */}
        {currentStep === 'payment_escrow' && splitData && (
            <div className="animate-slide-up">
                 <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-mpesa to-green-300"></div>
                    
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Wallet size={36} className="text-mpesa" />
                    </div>

                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Secure Payment</h2>
                    <p className="text-gray-500 mb-8 text-sm">Funds are held in neutral escrow until delivery is verified.</p>
                    
                    <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
                        <div className="flex justify-between items-center text-sm mb-3 text-gray-500">
                            <span>Recorded Weight</span>
                            <span className="font-mono font-bold text-gray-800">{weight} KG</span>
                        </div>
                        <div className="w-full h-px bg-gray-200 mb-3"></div>
                        <div className="flex justify-between items-center text-xl">
                            <span className="font-bold text-gray-900">Total Escrow</span>
                            <span className="font-bold text-mpesa">KES {splitData.total.toLocaleString()}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleEscrowPayment}
                        className="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <ShieldCheck size={18} />
                        Lock Funds in Escrow
                    </button>
                 </div>
            </div>
        )}

        {/* STEP 3: LOGISTICS HANDSHAKE */}
        {currentStep === 'logistics_handshake' && (
            <div className="animate-slide-up space-y-6">
                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-xs text-yellow-800 flex items-start gap-3">
                    <div className="bg-yellow-100 p-1 rounded">⚠️</div>
                    <div>
                        <strong>Demo Mode Active:</strong><br/>
                        Below simulates the interaction between Farmer (Phone A) and Driver (Phone B).
                        <button onClick={() => setCurrentStep('settlement')} className="underline block mt-1 font-bold">Skip to Settlement</button>
                    </div>
                </div>

                <LogisticsHandshake 
                    mode="farmer" 
                    payload={tradeId} 
                    onSuccess={() => {}} 
                />

                <div className="flex items-center gap-4 py-2">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">DRIVER VIEW</span>
                    <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <LogisticsHandshake 
                    mode="driver" 
                    payload={tradeId} 
                    onSuccess={handleHandshakeSuccess} 
                />
            </div>
        )}

        {/* STEP 4: SETTLEMENT */}
        {(currentStep === 'settlement' || currentStep === 'complete') && splitData && (
             <div className="animate-slide-up">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-br from-mpesa to-green-600 p-10 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                        <CheckCircle size={64} className="mx-auto mb-4 relative z-10" />
                        <h2 className="text-3xl font-bold relative z-10">Success!</h2>
                        <p className="opacity-90 relative z-10 mt-2">Smart Contracts Executed.</p>
                    </div>

                    <div className="p-8">
                        <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">Automated Splits</h3>
                        
                        <div className="space-y-4">
                            {[
                                { label: 'Farmer (90%)', amount: splitData.farmerAmount, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Driver (7%)', amount: splitData.driverAmount, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Platform Fee (3%)', amount: splitData.platformAmount, color: 'text-gray-600', bg: 'bg-gray-50' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${item.bg.replace('bg-', 'bg-').replace('50', '500')}`}></div>
                                        <span className="font-medium text-gray-700">{item.label}</span>
                                    </div>
                                    <span className={`font-mono font-bold ${item.color}`}>KES {item.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full mt-10 bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
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
