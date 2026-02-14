import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingById } from '../services/marketplaceService';
import { HarvestListing } from '../types';
import { CheckCircle, Loader2, ArrowLeft, Smartphone } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<HarvestListing | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<'details' | 'success'>('details');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Load listing data
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

  // Listen for PayHero Success Events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.paymentSuccess) {
        console.log("PayHero Payment Success:", event.data);
        setStep('success');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Initialize PayHero Widget
  useEffect(() => {
    if (step === 'details' && listing && window.PayHero) {
      // Clear previous instances if needed
      const container = document.getElementById('payhero-button-container');
      if (container) container.innerHTML = '';
      
      const totalCost = listing.pricePerKg * 100;
      
      // Access env safely to avoid TS errors
      const env = (import.meta as any).env || {};

      const publicBase = env.VITE_PUBLIC_BASE_URL || window.location.origin;
      const callbackUrl = publicBase
        ? new URL('/api/payhero/callback', publicBase).toString()
        : null;

      try {
        window.PayHero.init({
          paymentUrl: env.VITE_PAYHERO_PAY_LINK || "https://app.payhero.co.ke/lipwa/4466",
          width: "100%",
          height: "50px",
          containerId: "payhero-button-container",
          channelID: Number(env.VITE_PAYHERO_SERVICE_ID || 4466),
          amount: totalCost,
          phone: phoneNumber, // Pass the phone number state if user typed it
          name: "YieldSync User",
          reference: `ORD-${listing.id}-${Date.now()}`,
          buttonName: `Pay Now KES ${totalCost.toLocaleString()}`,
          buttonColor: "#24B04B",
          successUrl: null, // We handle via JS event
          failedUrl: null,
          callbackUrl
        });
      } catch (err) {
        console.error("PayHero Init Error:", err);
      }
    }
  }, [step, listing, phoneNumber]); // Re-run if phone number updates, though usually PayHero handles its own input if initial is empty.

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-50">
             <Loader2 size={32} className="animate-spin text-mpesa" />
          </div>
      );
  }

  if (!listing) return <div className="p-4">Listing not found</div>;

  const totalCost = listing.pricePerKg * 100; // Mock buying 100kg

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen flex flex-col">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
           <ArrowLeft size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {step === 'details' && (
          <div className="bg-white p-6 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-4">Confirm Order</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Product</span>
                <span className="font-medium">{listing.cropType} (Grade {listing.grade})</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Quantity</span>
                <span className="font-medium">100 KG</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-bold">Total (Escrow)</span>
                <span className="font-bold text-mpesa">KES {totalCost.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Funds are held securely by PayHero until delivery is verified.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">M-Pesa Number</label>
              <div className="relative mb-2">
                <Smartphone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  placeholder="0712 345 678" 
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">Enter your number above, then click the button below to trigger the prompt on your phone.</p>
            </div>

            {/* PayHero Button Container */}
            <div id="payhero-button-container" className="w-full"></div>
            
          </div>
        )}

        {step === 'success' && (
          <div className="text-center p-8 bg-white rounded-xl shadow-lg border-t-4 border-mpesa animate-in zoom-in duration-500">
            <CheckCircle size={64} className="text-mpesa mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Payment Secured!</h3>
            <p className="text-gray-600 mb-6">Funds are now in Escrow. Proceed to the farmer and scan their QR code to release payment.</p>
            <button 
              onClick={() => navigate('/handshake')}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg"
            >
              Go to Handshake
            </button>
          </div>
        )}
      </div>
    </div>
  );
};