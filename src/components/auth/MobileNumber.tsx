import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MobileNumberProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function MobileNumber({ onClose, onSubmit }: MobileNumberProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-[400px] bg-[#1c1c1c] rounded-xl p-6 shadow-2xl border border-white/10">
        
        {/* Close Button (Optional UX improvement) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-xl text-white font-medium mb-6">
          Sign in with your Swiggy
        </h2>

        {/* Input Field Container */}
        <div className="flex items-center bg-[#2b2b2b] border border-gray-600 rounded-lg overflow-hidden mb-6 transition-colors focus-within:border-gray-400">
          
          {/* Country Code Section */}
          <div className="flex items-center gap-2 px-3 py-3 border-r border-gray-600 bg-[#2b2b2b]">
            <span className="text-lg">🇮🇳</span>
            <span className="text-white text-sm font-medium">+91</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>

          {/* Phone Input */}
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="1234567890"
            className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-3 outline-none text-sm tracking-wide"
            maxLength={10}
          />
        </div>

        {/* Send OTP Button */}
        <button
          onClick={onSubmit}
          className="w-full bg-[#d91919] hover:bg-[#b01414] text-white font-bold py-3 rounded-lg shadow-lg transition-all active:scale-95 text-sm"
        >
          Send OTP
        </button>

      </div>
    </div>
  );
}