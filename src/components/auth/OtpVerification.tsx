import React from 'react';
import { X } from 'lucide-react';

interface OtpVerificationProps {
  onClose: () => void;
  onSubmit: () => void;
  onEditNumber: () => void;
  phoneNumber?: string;
}

export default function OtpVerification({ 
  onClose, 
  onSubmit, 
  onEditNumber,
  phoneNumber = "+91 1234567890" 
}: OtpVerificationProps) {
  
  // In a real app, you would manage state for individual inputs here.
  // For the UI demo, we represent the filled state from the image.
  const otpValues = ['6', '0', '1', '3', '4', '2'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-[400px] bg-[#151515] rounded-xl p-6 shadow-2xl border border-white/10 font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-white">OTP Authentication</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Phone Number Info */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <span className="text-white font-medium">{phoneNumber}</span>
          <button 
            onClick={onEditNumber}
            className="text-gray-500 hover:text-gray-300 text-xs"
          >
            edit number?
          </button>
        </div>

        {/* Swiggy Branding */}
        <div className="mb-2 flex items-center gap-2">
            <div className="bg-[#fc8019] p-1 rounded-full w-5 h-5 flex items-center justify-center">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0">
                    <path d="M12 22s-8-6-8-12a8 8 0 0 1 16 0c0 6-8 12-8 12z"/>
                 </svg>
            </div>
            <span className="text-gray-200 text-sm font-medium">Swiggy OTP</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">Enter the 6-digit OTP from Swiggy</p>

        {/* OTP Input Boxes */}
        <div className="flex justify-between gap-2 mb-2">
          {otpValues.map((digit, index) => (
            <div 
              key={index}
              className="w-10 h-12 bg-[#252525] border border-gray-600 rounded flex items-center justify-center text-white text-lg font-medium"
            >
              {digit}
            </div>
          ))}
        </div>

        {/* Success Message */}
        <div className="mb-6">
          <span className="text-green-500 text-xs font-medium">
            OTP verified successfully
          </span>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          className="w-full bg-gradient-to-r from-[#d91919] to-[#b01414] hover:from-[#c21414] hover:to-[#991111] text-white font-bold py-3 rounded-lg shadow-lg transition-all active:scale-95 text-sm"
        >
          Submit
        </button>

      </div>
    </div>
  );
}