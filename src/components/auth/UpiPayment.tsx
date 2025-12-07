import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface UpiPaymentProps {
  onClose: () => void;
  onPay: () => void;
  amount: number;
}

type PaymentMethodType = 'gpay' | 'phonepe' | 'paytm' | 'other';

export default function UpiPayment({ onClose, onPay, amount }: UpiPaymentProps) {
  // Default active method is Google Pay to show the error state from the screenshot
  const [activeMethod, setActiveMethod] = useState<PaymentMethodType | null>('gpay');

  // Helper to toggle accordion
  const toggleMethod = (method: PaymentMethodType) => {
    setActiveMethod(activeMethod === method ? null : method);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-[400px] bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/5 font-sans mx-4 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5">
          <h2 className="text-lg font-bold text-white tracking-wide">Pay with UPI</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="px-4 pb-6 space-y-3 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* ================== GOOGLE PAY ================== */}
          <div className="bg-[#1a1a1a] overflow-hidden">
            <div 
              className="flex items-center justify-between py-3 cursor-pointer"
              onClick={() => toggleMethod('gpay')}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="GPay" className="w-5 h-5 object-contain" />
                </div>
                <span className="text-gray-200 font-medium text-sm">Google Pay</span>
              </div>
              {activeMethod === 'gpay' ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
            </div>

            {activeMethod === 'gpay' && (
              <div className="pb-2 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="flex gap-3 mb-1">
                  {/* Input with inner label */}
                  <div className="flex-1 bg-[#404040] rounded-md px-3 py-1.5 border border-transparent focus-within:border-gray-500 relative">
                    <label className="text-[10px] text-gray-400 block font-medium">Enter UPI ID</label>
                    <input 
                      type="text" 
                      defaultValue="1234567890"
                      className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500 font-medium"
                    />
                  </div>
                  {/* Dropdown */}
                  <div className="w-28 bg-[#404040] rounded-md px-3 py-1.5 flex items-center justify-between cursor-pointer">
                    <span className="text-white text-sm">@okicici</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
                
                {/* Error Message */}
                <div className="flex items-center gap-1.5 text-[#ff0000] text-[10px] font-bold mb-3 mt-1 tracking-wide">
                  <span>Invalid UPI ID</span>
                  <AlertTriangle size={10} fill="currentColor" />
                </div>

                <button onClick={onPay} className="w-full bg-gradient-to-r from-[#d00000] to-[#b00000] hover:from-[#e00000] hover:to-[#c00000] text-white font-bold py-3 rounded-lg shadow-lg text-sm tracking-wide">
                  Pay ₹{amount}
                </button>
              </div>
            )}
          </div>

          {/* ================== PHONEPE ================== */}
          <div className="bg-[#1a1a1a] overflow-hidden">
            <div 
              className="flex items-center justify-between py-3 cursor-pointer"
              onClick={() => toggleMethod('phonepe')}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[#5f259f] rounded-lg flex items-center justify-center">
                   <span className="text-white font-bold text-sm">Pe</span>
                </div>
                <span className="text-gray-200 font-medium text-sm">PhonePe</span>
              </div>
              {activeMethod === 'phonepe' ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
            </div>

            {activeMethod === 'phonepe' && (
              <div className="pb-2 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 bg-[#404040] rounded-md px-3 py-2.5 border border-transparent focus-within:border-gray-500">
                    <input type="text" placeholder="Enter UPI ID" className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-400" />
                  </div>
                  <div className="w-28 bg-[#404040] rounded-md px-3 py-2.5 flex items-center justify-between cursor-pointer">
                    <span className="text-white text-sm">@ybl</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
                <button onClick={onPay} className="w-full bg-gradient-to-r from-[#d00000] to-[#b00000] hover:from-[#e00000] hover:to-[#c00000] text-white font-bold py-3 rounded-lg shadow-lg text-sm tracking-wide">
                  Pay ₹{amount}
                </button>
              </div>
            )}
          </div>

          {/* ================== PAYTM ================== */}
          <div className="bg-[#1a1a1a] overflow-hidden">
            <div 
              className="flex items-center justify-between py-3 cursor-pointer"
              onClick={() => toggleMethod('paytm')}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                   <span className="text-[#00baf2] font-bold text-[10px]">Paytm</span>
                </div>
                <span className="text-gray-200 font-medium text-sm">Paytm</span>
              </div>
              {activeMethod === 'paytm' ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
            </div>

            {activeMethod === 'paytm' && (
              <div className="pb-2 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 bg-[#404040] rounded-md px-3 py-2.5 border border-transparent focus-within:border-gray-500">
                    <input type="text" placeholder="Enter UPI ID" className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-400" />
                  </div>
                  <div className="w-28 bg-[#404040] rounded-md px-3 py-2.5 flex items-center justify-between cursor-pointer">
                    <span className="text-white text-sm">@pthdfc</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
                <button onClick={onPay} className="w-full bg-gradient-to-r from-[#d00000] to-[#b00000] hover:from-[#e00000] hover:to-[#c00000] text-white font-bold py-3 rounded-lg shadow-lg text-sm tracking-wide">
                  Pay ₹{amount}
                </button>
              </div>
            )}
          </div>

          {/* ================== OTHER UPI ================== */}
          <div className="bg-[#1a1a1a] overflow-hidden">
            <div 
              className="flex items-center justify-between py-3 cursor-pointer"
              onClick={() => toggleMethod('other')}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                   {/* Generic UPI Logo */}
                   <div className="w-5 h-3 relative">
                      <div className="absolute top-0 left-0 w-3 h-0.5 bg-green-600 transform rotate-45 origin-left"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-0.5 bg-orange-500 transform -rotate-45 origin-left"></div>
                   </div>
                </div>
                <span className="text-gray-200 font-medium text-sm">Other UPI</span>
              </div>
              {activeMethod === 'other' ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
            </div>

            {activeMethod === 'other' && (
              <div className="pb-2 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="mb-4">
                  <div className="w-full bg-[#404040] rounded-md px-3 py-3 border border-transparent focus-within:border-gray-500">
                    <input type="text" placeholder="Enter UPI ID" className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-400" />
                  </div>
                </div>
                <button onClick={onPay} className="w-full bg-gradient-to-r from-[#d00000] to-[#b00000] hover:from-[#e00000] hover:to-[#c00000] text-white font-bold py-3 rounded-lg shadow-lg text-sm tracking-wide">
                  Verify & Pay ₹{amount}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}