import React from 'react';
import { X, ChevronDown } from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
}

export default function PaymentModal({ onClose }: PaymentModalProps) {
  
  // --- CONFIGURATION: REPLACE WITH YOUR DETAILS ---
  const merchant = {
    vpa: 'merchant@upi',       // Replace with your UPI ID (e.g., business@okhdfcbank)
    name: 'Khwaaish Hotel',    // Your Business Name
    amount: '910.00',          // Amount to charge
    note: 'Booking for 2'      // Transaction Note
  };

  // --- HELPER: CONSTRUCT DEEP LINK ---
  const getUpiLink = (appScheme: string) => {
    // Base UPI parameters
    const params = new URLSearchParams({
      pa: merchant.vpa,
      pn: merchant.name,
      am: merchant.amount,
      cu: 'INR',
      tn: merchant.note,
    });

    // If it's a generic UPI intent (like "Other UPI"), use the standard scheme
    // Otherwise, try to target the specific app scheme if valid
    const baseUrl = appScheme === 'upi' ? 'upi://pay' : `${appScheme}://pay`;
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePayment = (scheme: string) => {
    const url = getUpiLink(scheme);
    
    // Check if user is on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = url; // Opens the App
    } else {
      alert("UPI payments only work on mobile devices. On desktop, show a QR code here.");
    }
  };

  const paymentOptions = [
    { 
      name: 'Google Pay', 
      scheme: 'gpay', // Tries to open GPay directly (or use 'upi' to let system decide)
      icon: 'https://cdn-icons-png.flaticon.com/128/6124/6124998.png',
      bgColor: 'bg-white'
    },
    { 
      name: 'PhonePe', 
      scheme: 'phonepe',
      icon: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/phonepe-icon.png',
      bgColor: 'bg-[#5f259f]' 
    },
    { 
      name: 'Paytm', 
      scheme: 'paytmmp', 
      icon: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/paytm-icon.png',
      bgColor: 'bg-white'
    },
    { 
      name: 'Other UPI', 
      scheme: 'upi', // Standard system picker
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/2560px-UPI-Logo-vector.svg.png',
      bgColor: 'bg-white' 
    }
  ];

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-4">
      
      {/* Modal Container */}
      <div className="w-full max-w-[400px] bg-[#0a0a0a] border border-zinc-800 rounded-xl p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 relative">
          <h2 className="text-white text-[17px] font-bold tracking-wide">Pay with UPI</h2>
          <button 
            onClick={onClose} 
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Payment Options List */}
        <div className="space-y-3">
          {paymentOptions.map((option, index) => (
            <div 
              key={index}
              onClick={() => handlePayment(option.scheme)}
              className="flex items-center justify-between p-3 rounded-xl bg-transparent hover:bg-[#18181b] cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Icon Container */}
                <div className={`w-9 h-9 ${option.bgColor} rounded-lg flex items-center justify-center p-1.5 overflow-hidden shadow-sm`}>
                  <img 
                    src={option.icon} 
                    alt={option.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Name */}
                <span className="text-zinc-200 text-sm font-medium group-hover:text-white">
                  {option.name}
                </span>
              </div>

              {/* Arrow Icon */}
              <ChevronDown size={18} className="text-zinc-500 group-hover:text-zinc-300" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}