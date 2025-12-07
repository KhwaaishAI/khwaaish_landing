import React, { useState } from 'react';
import { Crosshair, Loader2 } from 'lucide-react'; // Added Loader2 for loading state

interface DeliveryLocationProps {
  onClose: () => void;
  onSubmit: (location: string) => void;
}

export default function DeliveryLocation({ onClose, onSubmit }: DeliveryLocationProps) {
  const [location, setLocation] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Function to handle "Get Current Location"
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success!
        const { latitude, longitude } = position.coords;
        
        // In a real app, you would send these coords to a backend API (Google Maps/Mapbox) 
        // to get the actual text address.
        // For this demo, we will format it to show it worked.
        const coordsString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        
        // Simulating an address fetch delay for realistic effect
        setTimeout(() => {
            setLocation(`Current Location (${coordsString})`);
            setIsLoadingLocation(false);
        }, 1000);
      },
      (error) => {
        // Error
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check permissions.");
        setIsLoadingLocation(false);
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-[400px] bg-[#1c1c1c] rounded-xl p-6 shadow-2xl border border-white/10 font-sans">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-medium text-white">Enter Delivery Location</h2>
        </div>

        <div className="h-px bg-gray-800 w-full mb-4"></div>

        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          This helps me find restaurants that deliver to your location.
        </p>

        {/* Input Section */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location"
            className="flex-1 bg-[#2b2b2b] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-gray-400 text-sm"
          />
          
          {/* GPS/Locate Button with Loading State */}
          <button 
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
            title="Use my current location"
            className="bg-[#2b2b2b] border border-gray-600 rounded-lg w-12 flex items-center justify-center text-white hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingLocation ? (
              <Loader2 size={20} className="animate-spin text-red-500" />
            ) : (
              <Crosshair size={20} />
            )}
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={() => onSubmit(location)}
          className="w-full bg-gradient-to-r from-[#d91919] to-[#b01414] hover:from-[#c21414] hover:to-[#991111] text-white font-bold py-3 rounded-lg shadow-lg transition-all active:scale-95 text-sm"
        >
          Save & Continue
        </button>

      </div>
    </div>
  );
}