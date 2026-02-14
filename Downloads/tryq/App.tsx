
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/Navbar';
import { Marketplace } from './pages/Marketplace';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { Checkout } from './pages/Checkout';
import { Handshake } from './pages/Handshake';
import { LocationView } from './pages/LocationView';
import { SmartTrade } from './pages/SmartTrade';

function App() {
  return (
    <Router>
      <div className="h-full w-full flex flex-col bg-[#f8fafc]">
        <Toaster position="top-center" richColors />
        
        {/* Main Content Area - Scrolls independently */}
        <div className="flex-1 overflow-hidden relative">
            <Routes>
              <Route path="/" element={<Marketplace />} />
              <Route path="/farmer" element={<FarmerDashboard />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/handshake" element={<Handshake />} />
              <Route path="/location/:id" element={<LocationView />} />
              <Route path="/smart-trade" element={<SmartTrade />} />
            </Routes>
        </div>
        
        {/* Navigation - Fixed at bottom */}
        <Navbar />
      </div>
    </Router>
  );
}

export default App;
