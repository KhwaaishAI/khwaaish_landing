import React from 'react';
import { X, ChevronDown, LocateFixed, MapPin } from 'lucide-react';

interface ConfirmAddressProps {
  onClose: () => void;
  onSave: () => void;
}

export default function ConfirmAddress({ onClose, onSave }: ConfirmAddressProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-[450px] bg-[#1c1c1c] rounded-xl p-6 shadow-2xl border border-white/10 font-sans mx-4">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-medium text-white">Confirm Address</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Map Placeholder Section */}
        <div className="relative w-full h-36 rounded-xl overflow-hidden mb-5 bg-[#2a2a2a] group">
          {/* Simulated Map Image - Replace src with a real map image if you have one */}
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
            alt="Map" 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
          />
          
          {/* Map Pin Icon (Center) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 pb-4">
             <MapPin size={32} fill="currentColor" className="text-red-500 drop-shadow-lg" />
          </div>

          {/* 'Use current location' Floating Button */}
          <button className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#d91919] hover:bg-[#b01414] text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transition-colors">
            <LocateFixed size={14} />
            Use current location
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          
          {/* Full Name */}
          <div className="bg-[#2b2b2b] border border-gray-600 rounded-lg px-3 py-1.5 focus-within:border-gray-400 transition-colors">
            <label className="text-[10px] text-gray-400 block mb-0.5">Full Name</label>
            <input 
              type="text" 
              defaultValue="Laksh Doshi" 
              className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
            />
          </div>

          {/* Phone Number */}
          <div className="bg-[#2b2b2b] border border-gray-600 rounded-lg px-3 py-1.5 flex items-center gap-3 focus-within:border-gray-400 transition-colors">
             <div className="flex items-center gap-1 min-w-fit cursor-pointer">
                <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-4 h-3 object-cover rounded-[1px]" />
                <span className="text-white text-sm">+91</span>
                <ChevronDown size={12} className="text-gray-400" />
             </div>
             <div className="w-[1px] h-6 bg-gray-600"></div>
             <input 
              type="tel" 
              defaultValue="1234567890" 
              className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
            />
          </div>

          {/* Row: Flat & Street */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#2b2b2b] border border-gray-600 rounded-lg px-3 py-1.5 focus-within:border-gray-400">
                <label className="text-[10px] text-gray-400 block mb-0.5">Flat / House No.</label>
                <input type="text" defaultValue="1-5-81/17-A" className="w-full bg-transparent text-white text-sm outline-none" />
            </div>
            <div className="bg-[#2b2b2b] border border-gray-600 rounded-lg px-3 py-1.5 focus-within:border-gray-400">
                <label className="text-[10px] text-gray-400 block mb-0.5">Street name</label>
                <input type="text" defaultValue="Krishna nagar" className="w-full bg-transparent text-white text-sm outline-none" />
            </div>
          </div>

          {/* Row: City & State */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#2b2b2b] border border-gray-600 rounded-lg px-3 py-1.5 focus-within:border-gray-400">
                <label className="text-[10px] text-gray-400 block mb-0.5">City</label>
                <input type="text" defaultValue="Mumbai" className="w-full bg-transparent text-white text-sm outline-none" />
            </div>
            <div className="bg-[#2b2b2b] border border-gray-600 rounded-lg px-3 py-1.5 focus-within:border-gray-400">
                <label className="text-[10px] text-gray-400 block mb-0.5">State</label>
                <input type="text" defaultValue="Maharashtra" className="w-full bg-transparent text-white text-sm outline-none" />
            </div>
          </div>

          {/* Pincode */}
           <div className="bg-[#2b2b2b] border border-gray-600 rounded-lg px-3 py-3 focus-within:border-gray-400 transition-colors">
            <input 
              type="text" 
              placeholder="Pincode" 
              className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
            />
          </div>

        </div>

        {/* Save Button */}
        <button
          onClick={onSave}
          className="w-full mt-6 bg-gradient-to-r from-[#d91919] to-[#b01414] hover:from-[#c21414] hover:to-[#991111] text-white font-bold py-3 rounded-lg shadow-lg transition-all active:scale-95 text-sm"
        >
          Save & Continue
        </button>

      </div>
    </div>
  );
}