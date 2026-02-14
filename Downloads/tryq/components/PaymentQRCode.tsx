
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Loader2, ScanLine, CheckCircle2 } from 'lucide-react';
import { generateDynamicQRUrl, checkTransactionStatus } from '../services/payHeroService';

interface PaymentQRCodeProps {
  amount: number;
  reference: string;
  onSuccess: () => void;
}

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({ amount, reference, onSuccess }) => {
  const [status, setStatus] = useState<'WAITING' | 'PROCESSING' | 'SUCCESS'>('WAITING');
  
  // Generate the deep link/URL for PayHero
  const paymentUrl = generateDynamicQRUrl(amount, reference);

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      setStatus('PROCESSING');
      // Simulate polling the backend for callback confirmation
      // In production, this checks your own API which listens to the PayHero Webhook
      const result = await checkTransactionStatus(reference);
      
      if (mounted && result.status === 'SUCCESS') {
        setStatus('SUCCESS');
        setTimeout(onSuccess, 1500); // Wait a bit before navigating
      }
    };

    // Start polling immediately for demo purposes
    // In reality, you might wait for a websocket event or poll interval
    poll();

    return () => { mounted = false; };
  }, [reference, onSuccess]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-4">
        <h3 className="font-bold text-gray-900 flex items-center justify-center gap-2">
            <ScanLine className="text-mpesa" /> 
            Scan to Pay
        </h3>
        <p className="text-xs text-gray-500">Use M-Pesa App or Camera</p>
      </div>

      <div className="relative group">
        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 group-hover:border-mpesa transition-colors">
            {status === 'SUCCESS' ? (
                <div className="h-[200px] w-[200px] flex items-center justify-center text-mpesa">
                    <CheckCircle2 size={80} />
                </div>
            ) : (
                <QRCode 
                    value={paymentUrl} 
                    size={200} 
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                />
            )}
        </div>
        
        {/* Overlay for "Processing" state if needed */}
        {status === 'PROCESSING' && (
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow border border-gray-100 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-mpesa" />
                <span className="text-xs font-bold text-gray-700">Waiting for PIN...</span>
             </div>
        )}
      </div>

      <div className="mt-6 w-full bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm">
        <span className="text-gray-500">Amount:</span>
        <span className="font-bold text-gray-900">KES {amount.toLocaleString()}</span>
      </div>
      
      <div className="mt-2 text-[10px] text-gray-400 font-mono">
        Ref: {reference}
      </div>
    </div>
  );
};
