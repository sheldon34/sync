import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ShieldCheck, Scan, User, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface LogisticsHandshakeProps {
  mode: 'farmer' | 'driver';
  payload: string; // The data to encode/scan
  onSuccess: () => void;
}

export const LogisticsHandshake: React.FC<LogisticsHandshakeProps> = ({ mode, payload, onSuccess }) => {
  const [scanResult, setScanResult] = useState<string | null>(null);

  // QR Scanner Effect
  useEffect(() => {
    if (mode === 'driver' && !scanResult) {
      // Initialize scanner
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setScanResult(decodedText);
          if (decodedText === payload) {
             toast.success("Logistics Handshake Verified!");
             onSuccess();
          } else {
             toast.error("Invalid QR Code. Try again.");
             window.location.reload(); // Simple reset for demo
          }
        },
        (error) => {
          // console.warn(error); // Ignore frame errors
        }
      );

      return () => {
        try { scanner.clear(); } catch(e) {}
      };
    }
  }, [mode, payload, onSuccess, scanResult]);

  if (mode === 'farmer') {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
        <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
            <ShieldCheck className="text-mpesa" /> 
            Digital Proof of Delivery
        </h3>
        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block mb-4">
            <QRCode value={payload} size={200} />
        </div>
        <p className="text-sm text-gray-500">
            Show this to the Logistics Driver to authorize payment release.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono bg-gray-100 py-2 rounded">
            ID: {payload.substring(0, 12)}...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
         <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
            <Scan className="text-blue-600" /> 
            Scan Farmer's Code
        </h3>
        
        {!scanResult ? (
            <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-black min-h-[300px]">
                <div id="reader" className="w-full"></div>
            </div>
        ) : (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} />
                </div>
                <h4 className="font-bold text-lg text-green-800">Verified</h4>
                <p className="text-gray-600 text-sm">Transfering ownership to Logistics.</p>
            </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded">
                <User size={16} className="mb-1" />
                <span>Farmer</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-blue-50 text-blue-700 rounded border border-blue-100">
                <Truck size={16} className="mb-1" />
                <span>Driver (You)</span>
            </div>
        </div>
    </div>
  );
};
