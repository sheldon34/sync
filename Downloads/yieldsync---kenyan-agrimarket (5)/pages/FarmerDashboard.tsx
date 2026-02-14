import React, { useState } from 'react';
import { Upload, MapPin, Scale, ArrowRight, Activity, Check, Loader2 } from 'lucide-react';
import { KENYAN_COUNTIES, CROPS } from '../constants';
import { Grade } from '../types';
import { useNavigate } from 'react-router-dom';
import { addListing } from '../services/marketplaceService';
import { toast } from 'sonner';

export const FarmerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cropType: '',
    quantity: '',
    county: '',
    grade: 'A',
    price: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
        await addListing({
            farmerName: "Me (Farmer)", // Simulating logged-in user
            cropType: formData.cropType,
            quantityKg: Number(formData.quantity),
            location: formData.county,
            grade: formData.grade as Grade,
            pricePerKg: Number(formData.price),
            // Default coords for demo (Nairobi Center rough area)
            coordinates: { lat: -1.2921, lng: 36.8219 } 
        });

        toast.success("Harvest Listed Successfully!");
        
        // Reset form
        setFormData({
            cropType: '',
            quantity: '',
            county: '',
            grade: 'A',
            price: ''
        });

        // Optional: Redirect to marketplace to see it
        // navigate('/'); 
    } catch (error) {
        console.error(error);
        toast.error("Failed to add listing. Try again.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Farmer Hub</h1>
        <p className="text-gray-600 text-sm">Manage listings and automated trades.</p>
      </header>

      {/* Smart Trade Widget */}
      <div 
        onClick={() => navigate('/smart-trade')}
        className="bg-gray-900 text-white p-5 rounded-xl shadow-lg mb-8 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Scale className="text-mpesa" size={20} />
                    Smart Trade
                </h3>
                <p className="text-gray-400 text-xs mt-1">IoT Weighing • Instant Pay</p>
            </div>
            <div className="bg-white/10 p-2 rounded-lg">
                <ArrowRight size={20} />
            </div>
        </div>
        <div className="flex gap-2 relative z-10">
            <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded border border-green-700">Automated</span>
            <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded border border-blue-700">Guaranteed Pay</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-gray-500" />
        <h2 className="font-bold text-gray-800">Manual Listing</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Crop Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
          <select 
            required
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
            value={formData.cropType}
            onChange={(e) => setFormData({...formData, cropType: e.target.value})}
          >
            <option value="">Select Crop</option>
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (KG)</label>
          <input 
            type="number" 
            required
            placeholder="e.g. 500"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price per KG (KES)</label>
          <input 
            type="number" 
            required
            placeholder="e.g. 120"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
        </div>

        {/* Grade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
          <div className="flex gap-4">
            {Object.values(Grade).map(g => (
              <label key={g} className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition-colors ${formData.grade === g ? 'bg-green-50 border-mpesa text-mpesa font-bold shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="grade" 
                  value={g} 
                  className="hidden" 
                  checked={formData.grade === g}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
            <select 
              required
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={formData.county}
              onChange={(e) => setFormData({...formData, county: e.target.value})}
            >
              <option value="">Select County</option>
              {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Image Upload Placeholder */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
          <Upload className="mb-2" />
          <span className="text-xs">Tap to upload photo (Optional)</span>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className={`w-full bg-mpesa text-white font-bold py-4 rounded-lg text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${submitting ? 'opacity-80 cursor-not-allowed' : 'hover:bg-green-600'}`}
        >
          {submitting ? (
             <>
                <Loader2 className="animate-spin" size={20} />
                Listing...
             </>
          ) : (
             <>
                <Check size={20} />
                List Harvest
             </>
          )}
        </button>

      </form>
    </div>
  );
};
