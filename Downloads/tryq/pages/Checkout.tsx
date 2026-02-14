
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingById } from '../services/marketplaceService';
import { initiateSTKPush } from '../services/payHeroService';
import { PaymentQRCode } from '../components/PaymentQRCode';
import { HarvestListing } from '../types';
import { CheckCircle, Loader2, ArrowLeft, Smartphone, QrCode, Shield, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export const Checkout: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<HarvestListing | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [paymentMode, setPaymentMode] = useState<'STK' | 'QR'>('STK');
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reference] = useState(`ORD-${Math.floor(Math.random() * 10000)}`);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const data = await getListingById(id);
        setListing(data);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleSTKPush = async () => {
    if (!phoneNumber) {
        toast.error("Please enter a phone number");
        return;
    }
    setStep('processing');
    try {
        const total = (listing?.pricePerKg || 0) * 100;
        await initiateSTKPush(phoneNumber, total, reference);
        toast.success("Check your phone for the PIN prompt");
        setTimeout(() => setStep('success'), 3500);
    } catch (e) {
        toast.error("Payment Failed");
        setStep('details');
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 size={32} className="animate-spin text-mpesa" /></div>;
  if (!listing) return <div className="p-4">Listing not found</div>;

  const totalCost = listing.pricePerKg * 100;

  return (
    <div className="flex flex-col h-full bg-white z-50 absolute inset-0">
      
      {/* Navbar Overlay - Fixed Top */}
      <div className="px-4 pt-safe pb-2 flex items-center bg-white border-b border-gray-100 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-gray-100">
           <ArrowLeft size={24} className="text-gray-900" />
        </button>
        <span className="font-bold text-lg ml-2">Checkout</span>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 pb-32">
        {step !== 'success' ? (
          <div className="space-y-6">
            
            {/* Summary */}
            <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden">
                        <img src={`https://source.unsplash.com/random/200x200/?${listing.cropType}`} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                    <h2 className="font-bold text-2xl text-gray-900">{listing.cropType}</h2>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">Grade {listing.grade}</span>
                    <p className="text-gray-500 text-sm mt-1">{listing.farmerName}</p>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Quantity</span>
                    <span className="font-bold text-gray-900">100 KG</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Rate</span>
                    <span className="font-bold text-gray-900">KES {listing.pricePerKg}/kg</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-extrabold text-mpesa">KES {totalCost.toLocaleString()}</span>
                </div>
            </div>

            {/* Payment Selector */}
            <div>
                <h3 className="font-bold text-gray-900 mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setPaymentMode('STK')}
                        className={`py-4 rounded-2xl font-bold text-sm border-2 transition-all flex flex-col items-center gap-2 ${paymentMode === 'STK' ? 'border-mpesa bg-green-50 text-mpesa' : 'border-gray-100 bg-white text-gray-500'}`}
                    >
                        <Smartphone size={24} />
                        M-Pesa Auto
                    </button>
                    <button 
                        onClick={() => setPaymentMode('QR')}
                        className={`py-4 rounded-2xl font-bold text-sm border-2 transition-all flex flex-col items-center gap-2 ${paymentMode === 'QR' ? 'border-mpesa bg-green-50 text-mpesa' : 'border-gray-100 bg-white text-gray-500'}`}
                    >
                        <QrCode size={24} />
                        Scan QR
                    </button>
                </div>
            </div>

            {paymentMode === 'STK' ? (
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">M-Pesa Number</label>
                    <input 
                    type="tel" 
                    placeholder="0712 345 678" 
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-mpesa"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>
            ) : (
                <div className="flex justify-center py-4">
                     <PaymentQRCode amount={totalCost} reference={reference} onSuccess={() => setStep('success')} />
                </div>
            )}
            
            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center pt-4">
                <Shield size={12} className="text-green-600" />
                <span>Protected by PayHero Escrow</span>
            </div>
          </div>
        ) : (
            // Success State
            <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={60} className="text-mpesa" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
                <p className="text-gray-500 mb-10 px-8">Your payment is held in escrow. Please proceed to verify the harvest.</p>
                <button 
                onClick={() => navigate('/handshake')}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
                >
                Verify & Release
                </button>
            </div>
        )}
      </div>

      {/* Fixed Bottom Action Button (Only visible if not success) */}
      {step !== 'success' && paymentMode === 'STK' && (
          <div className="fixed bottom-0 left-0 w-full p-5 pb-safe bg-white border-t border-gray-100 z-20">
            <button 
                onClick={handleSTKPush}
                disabled={step === 'processing'}
                className="w-full bg-mpesa text-white font-bold py-4 rounded-2xl text-lg shadow-xl shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
                {step === 'processing' ? <Loader2 className="animate-spin" /> : <>Confirm Payment <ChevronRight /></>}
            </button>
          </div>
      )}
    </div>
  );
};
