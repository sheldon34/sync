
import React, { useState } from 'react';
import { Upload, MapPin, Scale, ArrowRight, Activity, Check, Loader2, User } from 'lucide-react';
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
            farmerName: "Me (Farmer)",
            cropType: formData.cropType,
            quantityKg: Number(formData.quantity),
            location: formData.county,
            grade: formData.grade as Grade,
            pricePerKg: Number(formData.price),
            coordinates: { lat: -1.2921, lng: 36.8219 } 
        });
        toast.success("Harvest Listed Successfully!");
        setFormData({ cropType: '', quantity: '', county: '', grade: 'A', price: '' });
    } catch (error) {
        toast.error("Failed to add listing.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white pt-safe pb-4 px-6 shadow-sm z-10 flex-shrink-0">
         <div className="flex items-center gap-3 pt-2">
             <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                 <User size={20} className="text-gray-600" />
             </div>
             <div>
                 <h1 className="text-xl font-bold text-gray-900">My Farm</h1>
                 <p className="text-xs text-gray-500">John Kamau • Verified</p>
             </div>
         </div>
      </div>

      {/* Scrollable Content */}
      <div className="page-container px-5 py-6">
          
        {/* Smart Trade Widget */}
        <div 
            onClick={() => navigate('/smart-trade')}
            className="bg-gray-900 text-white p-5 rounded-2xl shadow-xl mb-8 relative overflow-hidden active:scale-[0.98] transition-transform"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Scale className="text-mpesa" size={20} />
                        Smart Trade
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 font-medium">IoT Scale Integration</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                    <ArrowRight size={18} />
                </div>
            </div>
            <div className="flex gap-2 relative z-10">
                <span className="text-[10px] font-bold bg-green-900 text-green-300 px-2 py-1 rounded border border-green-700">AUTOMATED</span>
                <span className="text-[10px] font-bold bg-blue-900 text-blue-300 px-2 py-1 rounded border border-blue-700">INSTANT PAY</span>
            </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-gray-400" />
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">New Listing</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Crop</label>
                    <select 
                        required
                        className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-green-500"
                        value={formData.cropType}
                        onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                    >
                        <option value="">Select...</option>
                        {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">KG</label>
                    <input 
                        type="number" 
                        required
                        placeholder="0"
                        className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-green-500"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Price / KG (KES)</label>
                <input 
                    type="number" 
                    required
                    placeholder="e.g. 120"
                    className="w-full p-3 bg-gray-50 border-none rounded-xl text-lg font-bold text-gray-900 focus:ring-2 focus:ring-green-500"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Quality Grade</label>
                <div className="flex gap-2">
                    {Object.values(Grade).map(g => (
                    <label key={g} className={`flex-1 border rounded-xl p-3 text-center transition-all ${formData.grade === g ? 'bg-mpesa text-white border-mpesa font-bold shadow-md' : 'border-gray-200 bg-white text-gray-600'}`}>
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

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Location</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <select 
                    required
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-green-500"
                    value={formData.county}
                    onChange={(e) => setFormData({...formData, county: e.target.value})}
                    >
                    <option value="">Select County</option>
                    {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Submit Button - Large Tap Target */}
            <button 
                type="submit" 
                disabled={submitting}
                className={`w-full mt-4 bg-mpesa text-white font-bold py-4 rounded-xl text-lg shadow-xl shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-2 ${submitting ? 'opacity-80' : ''}`}
            >
                {submitting ? <Loader2 className="animate-spin" /> : <Check />}
                Post Listing
            </button>
        </form>
      </div>
    </div>
  );
};
