
import React, { useState, useEffect } from 'react';
import { MapPin, Search, Map, ChevronDown, SlidersHorizontal, Bell } from 'lucide-react';
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
      case 'low': return <span className="bg-red-50 text-red-600 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">Scarce</span>;
      case 'medium': return <span className="bg-yellow-50 text-yellow-600 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">Stable</span>;
      case 'high': return <span className="bg-green-50 text-green-600 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">Abundant</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      
      {/* 1. Fixed App Header */}
      <div className="bg-white pt-safe pb-2 px-5 shadow-sm z-20 flex-shrink-0">
        <div className="flex justify-between items-center mb-4 pt-2">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Yield<span className="text-mpesa">Sync</span></h1>
            <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Kenyan AgriMarket</p>
          </div>
          <button className="relative p-2 bg-gray-50 rounded-full hover:bg-gray-100 active:scale-95 transition-transform">
            <Bell size={20} className="text-gray-700" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>

        {/* Search Input */}
        <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search produce..." 
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl text-gray-900 text-sm font-medium placeholder-gray-400 focus:ring-2 focus:ring-mpesa/20 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="bg-gray-900 text-white px-3.5 rounded-xl active:scale-95 transition-transform flex items-center justify-center">
                <SlidersHorizontal size={18} />
            </button>
        </div>
      </div>

      {/* 2. Horizontal Filter Scroll (Sticky) */}
      <div className="bg-white/95 backdrop-blur-sm z-10 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex overflow-x-auto gap-2 px-5 scrollbar-hide">
            <div className="relative flex-shrink-0">
                <select 
                    className="appearance-none pl-3 pr-8 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border-none focus:ring-0"
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                >
                    <option value="">Kenya (All)</option>
                    {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 text-gray-500 pointer-events-none" size={12} />
            </div>
            {CROPS.map(crop => (
                <button 
                    key={crop} 
                    onClick={() => setSearchTerm(searchTerm === crop ? '' : crop)} 
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${searchTerm === crop ? 'bg-mpesa text-white shadow-md shadow-green-200' : 'bg-white text-gray-500 border border-gray-200'}`}
                >
                    {crop}
                </button>
            ))}
        </div>
      </div>

      {/* 3. Scrollable Feed Container */}
      <div className="page-container px-4 py-4 space-y-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <div 
                key={listing.id} 
                onClick={() => navigate(`/checkout/${listing.id}`)}
                className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform duration-150 flex gap-4"
            >
              {/* Square Image */}
              <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
                  <img 
                      src={`https://source.unsplash.com/random/200x200/?${listing.cropType}`} 
                      alt={listing.cropType} 
                      className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1">
                      {getSaturationBadge(listing.saturationLevel)}
                  </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-none mb-1">{listing.cropType}</h3>
                        <p className="text-xs text-gray-400 font-medium line-clamp-1">{listing.farmerName}</p>
                      </div>
                      <div className="bg-gray-50 p-1.5 rounded-lg text-gray-400">
                          <Map size={16} />
                      </div>
                  </div>
                  
                  <div className="flex items-end justify-between mt-2">
                       <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                           <MapPin size={10} className="mr-1 text-mpesa" />
                           {listing.location}
                       </div>
                       <div className="text-right">
                           <div className="text-[10px] text-gray-400 font-bold uppercase">Price</div>
                           <div className="text-lg font-extrabold text-gray-900 leading-none">
                              {listing.pricePerKg} <span className="text-xs font-medium text-gray-400">/kg</span>
                           </div>
                       </div>
                  </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
                <Search className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500 font-medium text-sm">No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
