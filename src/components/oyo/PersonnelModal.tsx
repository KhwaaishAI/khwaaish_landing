import React from 'react';
import { X, ChevronDown } from 'lucide-react';

interface PersonnelModalProps {
  onClose: () => void;
  onProceed: () => void;
}

export default function PersonnelModal({ onClose, onProceed }: PersonnelModalProps) {
  // Styles for the container relative positioning
  const inputContainerClass = "relative group";
  
  // Style for the label sitting on top of the border
  // -top-2.5 moves it up, bg-[#0a0a0a] hides the border line behind it
  const labelClass = "absolute -top-2.5 left-3 bg-[#0a0a0a] px-1 text-[11px] text-zinc-500 font-medium tracking-wide pointer-events-none transition-colors z-10";
  
  // Style for standard inputs
  const inputClass = "w-full bg-transparent border border-zinc-700/60 rounded-lg py-3.5 px-4 text-zinc-200 placeholder-zinc-700 focus:border-zinc-500 outline-none text-[13px] h-[50px] transition-all";

  return (
    // Overlay: Changed to 'absolute' so it covers the Main Content only (leaving Sidebar visible)
    // z-50 ensures it's above the chat/results
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-4">
      
      {/* Modal Box */}
      <div className="w-full max-w-[420px] bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-center items-center mb-8 relative">
          <h2 className="text-white text-[17px] font-bold tracking-wide">Personnel Details</h2>
          <button 
            onClick={onClose} 
            className="absolute right-[-8px] top-[-4px] text-zinc-500 hover:text-white transition-colors p-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
            
            {/* 1. Full Name */}
            <div className={inputContainerClass}>
                <label className={labelClass}>Enter Full Name</label>
                <input 
                    type="text" 
                    placeholder="John Doe"
                    className={inputClass}
                />
            </div>

            {/* 2. Email */}
            <div className={inputContainerClass}>
                <label className={labelClass}>Enter Email</label>
                <input 
                    type="email" 
                    placeholder="example@mail.com"
                    className={inputClass}
                />
            </div>

            {/* 3. Country Dropdown */}
            <div className={inputContainerClass}>
                <label className={labelClass}>Select Country</label>
                <div className="relative">
                    <select className={`${inputClass} appearance-none cursor-pointer text-zinc-300`}>
                        <option value="INDIA" className="bg-[#18181b]">INDIA</option>
                        <option value="USA" className="bg-[#18181b]">USA</option>
                        <option value="UK" className="bg-[#18181b]">UK</option>
                    </select>
                    {/* Arrow Icon */}
                    <ChevronDown className="absolute right-4 top-[17px] text-zinc-500 pointer-events-none" size={16} />
                </div>
            </div>

            {/* 4. Mobile Number (Custom Layout with Divider) */}
            <div className={inputContainerClass}>
                <label className={labelClass}>Enter Mobile Number</label>
                <div className={`flex items-center w-full bg-transparent border border-zinc-700/60 rounded-lg px-4 focus-within:border-zinc-500 h-[50px] transition-all`}>
                    
                    {/* Country Code */}
                    <span className="text-zinc-300 text-[13px] mr-3 font-medium">+91</span>
                    
                    {/* Vertical Divider */}
                    <div className="h-5 w-[1px] bg-zinc-800 mr-3"></div>
                    
                    {/* Number Input */}
                    <input 
                        type="tel" 
                        placeholder="1234567890"
                        className="flex-1 bg-transparent border-none outline-none text-[13px] placeholder-zinc-700 h-full text-zinc-200"
                    />
                </div>
            </div>

            {/* Proceed Button */}
            <button 
                onClick={onProceed}
                className="w-full bg-[#D6001C] hover:bg-[#b50018] text-white font-semibold py-3.5 rounded-xl mt-8 transition-all tracking-wide text-sm shadow-[0_0_20px_rgba(214,0,28,0.15)] active:scale-[0.98]"
            >
                Proceed to Payment
            </button>

        </div>
      </div>
    </div>
  );
}