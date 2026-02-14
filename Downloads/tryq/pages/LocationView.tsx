import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, MapPin, User, Truck, Loader2 } from 'lucide-react';
import { getListingById } from '../services/marketplaceService';
import { HarvestListing } from '../types';

export const LocationView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<HarvestListing | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

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

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-100">
             <Loader2 size={32} className="animate-spin text-mpesa" />
          </div>
      );
  }

  if (!listing) return <div className="p-4">Listing not found</div>;

  // Fallback coords if missing
  const lat = listing.coordinates?.lat || -1.2921;
  const lng = listing.coordinates?.lng || 36.8219;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header - Fixed & Safe Area Aware */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 pt-safe flex items-center gap-4 pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg pointer-events-auto active:scale-95 transition-transform text-gray-800"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-gray-200 w-full h-full">
        {/* Loading Skeleton/Spinner */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-0">
             <div className="text-center">
                <Loader2 size={32} className="animate-spin text-mpesa mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">Loading Map...</p>
             </div>
          </div>
        )}

        {/* Map Iframe with Lazy Loading */}
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          title="Listing Location"
          className={`w-full h-full object-cover transition-opacity duration-700 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setMapLoaded(true)}
          loading="lazy"
        />
        
        {/* Saturation/Supply Badge on Map */}
        <div className={`absolute bottom-[calc(35%+20px)] right-4 transition-all duration-700 delay-200 ${mapLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 text-xs text-right">
                <div className="font-bold text-gray-900">{listing.location} County</div>
                <div className={`font-bold ${listing.saturationLevel === 'high' ? 'text-green-600' : 'text-orange-600'}`}>
                    {listing.saturationLevel?.toUpperCase()} SUPPLY
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Sheet Details - Optimized for Mobile Thumb Reach */}
      <div className="bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] -mt-6 relative z-10 p-6 pb-safe animate-in slide-in-from-bottom-10 duration-500">
        {/* Drag Handle Visual */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">{listing.cropType}</h2>
            <div className="flex items-center text-gray-500 text-sm font-medium">
              <MapPin size={16} className="mr-1 text-mpesa" />
              {listing.location}, Kenya
            </div>
          </div>
          <div className="bg-green-50 text-mpesa px-4 py-1.5 rounded-full text-sm font-bold border border-green-100 shadow-sm">
            Grade {listing.grade}
          </div>
        </div>

        {/* Farmer Profile Card */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="bg-white p-3 rounded-full shadow-sm border border-gray-100">
            <User size={24} className="text-gray-700" />
          </div>
          <div>
            <div className="font-bold text-gray-900">{listing.farmerName}</div>
            <div className="text-xs text-gray-500 font-medium">Verified Farmer • {listing.quantityKg.toLocaleString()}kg Ready</div>
          </div>
        </div>

        {/* Action Buttons - Large Touch Targets */}
        <div className="grid grid-cols-[1fr_2fr] gap-4">
          <button 
             onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')}
             className="flex flex-col items-center justify-center gap-1 bg-gray-100 text-gray-900 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors active:scale-95"
          >
            <Navigation size={22} />
            <span className="text-xs">Navigate</span>
          </button>
          
          <button 
             onClick={() => navigate(`/checkout/${listing.id}`)}
             className="flex items-center justify-center gap-3 bg-mpesa text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-200 active:scale-95 transition-transform"
          >
            <Truck size={22} />
            <span className="text-lg">Buy Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
