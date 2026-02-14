
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Plus, QrCode } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  // Hide Navbar on specific full-screen flows
  if (location.pathname.startsWith('/checkout') || location.pathname.startsWith('/location')) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
    <Link 
      to={to} 
      className="flex-1 flex flex-col items-center justify-center pt-2 pb-safe active:scale-95 transition-transform"
    >
      <div className={`relative p-1.5 rounded-xl transition-colors duration-300 ${active ? 'text-mpesa bg-green-50' : 'text-gray-400'}`}>
        <Icon 
          size={26} 
          strokeWidth={active ? 2.5 : 2}
          className="relative z-10"
        />
      </div>
      <span className={`text-[10px] font-medium mt-1 transition-colors ${active ? 'text-mpesa' : 'text-gray-400'}`}>
        {label}
      </span>
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 glass pb-safe">
      <div className="flex justify-around items-end h-[60px] pb-2">
        <NavItem 
          to="/" 
          icon={Sprout} 
          label="Market" 
          active={isActive('/')} 
        />

        <Link to="/farmer" className="flex-1 flex flex-col items-center justify-end pb-safe relative -top-5">
           <div className="w-14 h-14 bg-gradient-to-tr from-mpesa to-green-600 rounded-full shadow-lg shadow-green-500/40 flex items-center justify-center text-white border-4 border-[#f8fafc] active:scale-90 transition-transform">
              <Plus size={30} strokeWidth={3} />
           </div>
           <span className="text-[10px] font-bold text-gray-500 mt-1">Sell</span>
        </Link>

        <NavItem 
          to="/handshake" 
          icon={QrCode} 
          label="Scan" 
          active={isActive('/handshake')} 
        />
      </div>
    </div>
  );
};
