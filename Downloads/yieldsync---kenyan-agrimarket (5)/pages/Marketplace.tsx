import React, { useState, useEffect } from 'react';
import { Filter, MapPin, Search, Map } from 'lucide-react';
import { HarvestListing } from '../types';
import { KENYAN_COUNTIES, CROPS } from '../constants';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';
import { getListings } from '../services/marketplaceService';

export const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<HarvestListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch from our "Backend Service"
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const data = await getListings();
        setListings(data);
      } catch (error) {
        console.error("Failed to fetch listings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter(item => {
    const matchesCounty = selectedCounty ? item.location === selectedCounty : true;
    const matchesSearch = item.cropType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCounty && matchesSearch;
  });

  const getSaturationBadge = (level?: string) => {
    switch(level) {
      case 'low': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">High Demand</span>;
      case 'medium': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Balanced</span>;
      case 'high': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">High Supply</span>;
      default: return null;
    }
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">YieldSync</h1>
        <p className="text-gray-600 text-sm">Find fresh produce from vetted farmers.</p>
      </header>

      {/* Filters */}
      <div className="mb-6 space-y-3 sticky top-0 bg-[#f3f4f6] z-10 py-2 -mx-4 px-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search maize, beans..." 
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <select 
            className="flex-shrink-0 border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
          >
            <option value="">All Counties</option>
            {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {CROPS.slice(0, 4).map(crop => (
             <button key={crop} onClick={() => setSearchTerm(crop)} className="flex-shrink-0 border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm whitespace-nowrap active:bg-gray-100">
               {crop}
             </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="space-y-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : filteredListings.length > 0 ? (
          filteredListings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{listing.cropType}</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/location/${listing.id}`);
                    }}
                    className="flex items-center text-blue-600 text-xs mt-1 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <MapPin size={12} className="mr-1" />
                    {listing.location} County
                    <span className="ml-1 font-semibold underline">Map</span>
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-mpesa">KES {listing.pricePerKg}</div>
                  <div className="text-xs text-gray-500">per Kg</div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-2">
                   <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Grade {listing.grade}</span>
                   {getSaturationBadge(listing.saturationLevel)}
                </div>
                <span className="text-sm font-medium text-gray-700">{listing.quantityKg.toLocaleString()} kg</span>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/location/${listing.id}`)}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Map size={18} />
                </button>
                <button 
                  onClick={() => navigate(`/checkout/${listing.id}`)}
                  className="flex-[4] bg-gray-900 text-white py-3 rounded-lg font-bold shadow-lg shadow-gray-200 active:scale-95 transition-transform"
                >
                  Buy Stock
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <p>No produce found.</p>
            <button onClick={() => {setSearchTerm(''); setSelectedCounty('')}} className="text-mpesa font-bold mt-2 text-sm">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};
