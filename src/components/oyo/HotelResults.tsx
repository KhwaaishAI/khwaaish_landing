import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, Star } from 'lucide-react';
import PersonnelModal from './PersonnelModal';
import PaymentModal from './PaymentModal'; // 1. Import Payment Modal

// --- Hotel Data ---
interface Hotel {
  id: number;
  image: string;
  name: string;
  location: string;
  oldPrice: string;
  price: string;
  discount: string;
  provider: 'oyo' | 'booking';
}

const HOTELS: Hotel[] = [
  { id: 1, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop", name: "Super Hotel O Bolligudem", location: "Bolligudem, Hyderabad", oldPrice: "₹3639.67", price: "₹910", discount: "72% off", provider: "booking" },
  { id: 2, image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=400&auto=format&fit=crop", name: "Super Hotel O Bolligudem", location: "Bolligudem, Hyderabad", oldPrice: "₹4500.00", price: "₹1120", discount: "72% off", provider: "oyo" },
  { id: 3, image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=400&auto=format&fit=crop", name: "Super Hotel O Bolligudem", location: "Bolligudem, Hyderabad", oldPrice: "₹3639.67", price: "₹910", discount: "72% off", provider: "booking" },
  { id: 4, image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=400&auto=format&fit=crop", name: "Super Hotel O Bolligudem", location: "Bolligudem, Hyderabad", oldPrice: "₹4500.00", price: "₹1120", discount: "72% off", provider: "oyo" },
];

// --- Hotel Card ---
interface HotelCardProps {
  data: Hotel;
  onBook: (id: number) => void;
  isSelected?: boolean;
}

const HotelCard = ({ data, onBook, isSelected = false }: HotelCardProps) => (
  <div className={`bg-[#0e0e10] border ${isSelected ? 'border-zinc-700 bg-zinc-900/30' : 'border-zinc-800/60'} rounded-xl p-3 flex gap-4 hover:border-zinc-700 transition-all group`}>
    <div className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-lg">
      <img src={data.image} alt={data.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
    <div className="flex-1 flex flex-col justify-between py-0.5">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-zinc-100 font-medium text-[15px] leading-tight mb-1">{data.name}</h3>
          <button className="text-xs text-blue-500 hover:text-blue-400 font-medium">View</button>
        </div>
        <p className="text-zinc-500 text-xs">{data.location}</p>
      </div>
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-red-500/80 line-through font-medium">{data.oldPrice}</span>
          <span className="text-lg text-white font-bold">{data.price}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {data.provider === 'oyo' ? <span className="font-bold text-[#E50027] text-sm tracking-tighter">OYO</span> : <span className="font-bold text-[#003580] text-sm">Booking.com</span>}
            <span className="text-[10px] bg-[#1a2e1a] text-green-500 px-1.5 py-0.5 rounded font-medium border border-green-900/30">{data.discount}</span>
          </div>
          {isSelected ? (
            <button className="border border-zinc-600 text-zinc-400 text-xs font-medium px-4 py-1.5 rounded-full cursor-default">Selected</button>
          ) : (
            <button onClick={() => onBook(data.id)} className="bg-[#D6001C] hover:bg-[#b50018] text-white text-xs font-bold px-4 py-1.5 rounded-md transition-colors shadow-lg shadow-red-900/20">Book Now</button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function HotelResults() {
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  
  // 2. Define State for both Modals
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleBook = (id: number) => {
    setSelectedHotelId(id);
  };

  const selectedHotel = HOTELS.find(h => h.id === selectedHotelId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-green-500 text-sm">
          <CheckCircle2 size={16} className="fill-green-500/10" /> 
          <span>Booking location & details confirmed <span className="text-blue-500 underline cursor-pointer hover:text-blue-400">Check</span></span>
        </div>
        <div className="flex items-center gap-2 text-green-500 text-sm">
          <CheckCircle2 size={16} className="fill-green-500/10" /> 
          <span>Rooms found</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl text-zinc-200 font-medium">Book your stay</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-zinc-800 rounded-full text-sm text-zinc-300 hover:bg-zinc-800 transition">Sort <ChevronDown size={14} /></button>
      </div>

      {/* Grid or Selected View */}
      {selectedHotelId === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HOTELS.map((hotel) => (
            <HotelCard key={hotel.id} data={hotel} onBook={handleBook} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="max-w-md">
            {selectedHotel && <HotelCard data={selectedHotel} onBook={handleBook} isSelected={true} />}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium tracking-wide">
             <Star size={12} className="fill-red-600 text-red-600 animate-pulse" />
             <span>Waiting for the details confirmation...</span>
          </div>
          <button 
            onClick={() => setShowPersonnelModal(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all border border-zinc-700/50"
          >
            Confirm
          </button>
        </div>
      )}

      {/* 3. Personnel Modal */}
      {showPersonnelModal && (
        <PersonnelModal 
          onClose={() => setShowPersonnelModal(false)}
          onProceed={() => {
            setShowPersonnelModal(false); // Close current modal
            setShowPaymentModal(true);    // Open Payment modal
          }}
        />
      )}

      {/* 4. Payment Modal */}
      {showPaymentModal && (
        <PaymentModal 
          onClose={() => setShowPaymentModal(false)}
        />
      )}

    </div>
  );
}