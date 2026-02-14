import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, ShoppingCart, QrCode } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? "text-mpesa font-bold" : "text-gray-500";

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
          <Sprout size={24} />
          <span className="text-xs mt-1">Market</span>
        </Link>
        <Link to="/farmer" className={`flex flex-col items-center ${isActive('/farmer')}`}>
          <div className="bg-mpesa p-3 rounded-full -mt-8 shadow-lg border-4 border-white text-white">
            <span className="text-xl font-bold">+</span>
          </div>
          <span className="text-xs mt-1">Sell</span>
        </Link>
        <Link to="/handshake" className={`flex flex-col items-center ${isActive('/handshake')}`}>
          <QrCode size={24} />
          <span className="text-xs mt-1">Handshake</span>
        </Link>
      </div>
    </nav>
  );
};