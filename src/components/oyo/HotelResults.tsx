import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  Star, 
  LayoutDashboard, 
  History, 
  Wallet, 
  Bell, 
  Paperclip, 
  Mic, 
  Send
} from 'lucide-react';

// --- MOCK MODALS (Compact) ---
const PersonnelModal = ({ onClose, onProceed }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-[#18181b] p-4 rounded-lg border border-zinc-700 w-80">
      <h3 className="text-white text-sm font-bold mb-2">Personnel Details</h3>
      <p className="text-zinc-400 text-[10px] mb-4">Enter guest details here...</p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1 text-zinc-400 text-[10px] hover:text-white">Cancel</button>
        <button onClick={onProceed} className="px-3 py-1 bg-blue-600 text-white rounded text-[10px] hover:bg-blue-500">Proceed</button>
      </div>
    </div>
  </div>
);

const PaymentModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-[#18181b] p-4 rounded-lg border border-zinc-700 w-80">
      <h3 className="text-white text-sm font-bold mb-2">Payment</h3>
      <p className="text-zinc-400 text-[10px] mb-4">Payment gateway integration...</p>
      <button onClick={onClose} className="w-full py-1.5 bg-green-600 text-white rounded text-[10px] hover:bg-green-500">Pay Now</button>
    </div>
  </div>
);

// --- DATA ---
const HOTELS = [
  { id: 1, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop", name: "Super Hotel O Bolligudem", location: "Bolligudem, Hyderabad", oldPrice: "3639", price: "910", discount: "72%", provider: "booking" },
  { id: 2, image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=400&auto=format&fit=crop", name: "Super Hotel O Bolligudem", location: "Bolligudem, Hyderabad", oldPrice: "4500", price: "1120", discount: "72%", provider: "oyo" },
  { id: 3, image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=400&auto=format&fit=crop", name: "Super Hotel O Bolligudem", location: "Bolligudem, Hyderabad", oldPrice: "3639", price: "910", discount: "72%", provider: "booking" },
  { id: 4, image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=400&auto=format&fit=crop", name: "Super Hotel O Bolligudem", location: "Bolligudem, Hyderabad", oldPrice: "4500", price: "1120", discount: "72%", provider: "oyo" },
];

// --- ULTRA COMPACT CARD (Height reduced to h-[72px]) ---
const HotelCard = ({ data, onBook, isSelected = false }) => (
  <div className={`w-full bg-[#121212] border ${isSelected ? 'border-zinc-500' : 'border-zinc-800'} rounded-lg p-1.5 flex gap-2 h-[72px] group hover:border-zinc-600 transition-all`}>
    
    {/* Image Section: Square relative to height */}
    <div className="relative w-[68px] h-full flex-shrink-0">
      <img src={data.image} alt={data.name} className="w-full h-full object-cover rounded-md" />
      <div className="absolute bottom-0.5 left-0.5 bg-green-600/90 text-white text-[7px] px-1 py-0.5 rounded backdrop-blur-sm">
        {data.discount}
      </div>
    </div>

    {/* Content Section */}
    <div className="flex flex-col justify-between flex-grow py-0">
      <div className="flex justify-between items-start">
        <div className="w-full">
          <h3 className="text-zinc-100 text-[11px] font-medium leading-none truncate max-w-[120px]">{data.name}</h3>
          <p className="text-zinc-500 text-[8px] mt-0.5 leading-none">{data.location}</p>
        </div>
        <button className="text-[8px] text-blue-500 font-medium hover:text-blue-400">View</button>
      </div>

      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-zinc-600 text-[8px] line-through leading-none">₹{data.oldPrice}</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-zinc-400 text-[8px]">₹</span>
            <span className="text-zinc-100 text-xs font-bold leading-none">{data.price}</span>
          </div>
        </div>

        {isSelected ? (
           <span className="text-green-500 text-[8px] font-bold px-1.5 py-0.5 border border-green-900 rounded bg-green-900/10">Selected</span>
        ) : (
          <button 
            onClick={() => onBook(data.id)}
            className="bg-red-600 hover:bg-red-700 text-white text-[8px] font-medium py-1 px-2.5 rounded-full transition-colors shadow-sm"
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  </div>
);

// --- MAIN DASHBOARD ---
export default function Dashboard() {
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleBook = (id) => {
    setSelectedHotelId(id);
  };

  const selectedHotel = HOTELS.find(h => h.id === selectedHotelId);

  return (
    // ROOT: h-screen + overflow-hidden
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans text-xs">
      
      {/* Sidebar: Ultra Compact */}
      <aside className="w-56 flex-shrink-0 flex flex-col p-2 border-r border-zinc-900/50 hidden md:flex">
        <div className="mb-2 pl-2">
          <h1 className="text-lg font-bold tracking-tight">khwaa<span className="text-red-500">*</span>sh <sup className="text-[8px] text-zinc-500">AI</sup></h1>
        </div>
        <nav className="flex-1 space-y-0.5">
          <button className="flex items-center gap-2 w-full px-3 py-1.5 bg-zinc-900/50 text-zinc-100 rounded-lg text-[11px] font-medium border border-zinc-800">
            <LayoutDashboard size={12} /> New Chat
          </button>
          <button className="flex items-center gap-2 w-full px-3 py-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg text-[11px] transition-colors">
            <History size={12} /> History
          </button>
          <button className="flex items-center gap-2 w-full px-3 py-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg text-[11px] transition-colors">
            <Wallet size={12} /> Wallet
          </button>
        </nav>
        <div className="mt-auto border-t border-zinc-900 pt-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-green-400 to-blue-500"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-medium">Emma Stone</span>
              <span className="text-[8px] text-zinc-500">Personal</span>
            </div>
          </div>
          <button className="text-[8px] border border-zinc-700 px-1.5 py-0.5 rounded-full text-zinc-400">Upgrade</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full">
        
        {/* Header: Reduced to h-10 */}
        <header className="h-10 flex items-center justify-end px-6 gap-3 flex-shrink-0 border-b border-transparent">
          <Bell className="text-zinc-400 w-3.5 h-3.5 hover:text-white cursor-pointer" />
          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
             <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100" alt="User" className="opacity-80 w-full h-full object-cover" />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col px-8 min-h-0 justify-center">
          
          {/* Chat Bubble: Very tight margins */}
          <div className="flex justify-end mb-1 flex-shrink-0">
            <div className="bg-[#1e1e1e] text-zinc-200 text-[11px] px-3 py-1 rounded-xl rounded-tr-sm border border-zinc-800">
              Book a Hotel for 2
            </div>
          </div>

          {/* AI Status: Ultra Compact */}
          <div className="mb-1 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-red-500 text-[9px] mb-0.5">
              <span>★</span> <span>Executing your Khwaaish...</span>
            </div>
            <p className="text-zinc-300 text-[11px] mb-1">Please Provide the Location and other details.</p>
            <div className="space-y-0">
              <div className="flex items-center gap-1.5 text-green-500 text-[9px]">
                <CheckCircle2 size={9} className="text-green-500" />
                <span>Booking location & details confirmed <span className="text-blue-500 underline cursor-pointer">Check</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-green-500 text-[9px]">
                 <CheckCircle2 size={9} className="text-green-500" />
                <span>Rooms found</span>
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 min-h-0 flex flex-col">
            {selectedHotelId === null ? (
              <>
                <div className="flex justify-between items-center mb-1 flex-shrink-0">
                  <h2 className="text-xs font-medium text-zinc-100">Book your stay</h2>
                  <button className="flex items-center gap-1 bg-[#121212] border border-zinc-800 px-2 py-0.5 rounded-full text-[9px] text-zinc-400 hover:text-white">
                    Sort <ChevronDown size={10} />
                  </button>
                </div>
                
                {/* Grid: Gap 1.5 (6px) */}
                <div className="grid grid-cols-2 gap-1.5 pb-1">
                  {HOTELS.map((hotel) => (
                    <HotelCard key={hotel.id} data={hotel} onBook={handleBook} />
                  ))}
                </div>
              </>
            ) : (
              // Selected View
              <div className="flex flex-col gap-2 mt-1 animate-in fade-in zoom-in-95 duration-300">
                 <h2 className="text-xs font-medium text-zinc-100">Confirm Booking</h2>
                 <div className="max-w-md">
                   <HotelCard data={selectedHotel} onBook={()=>{}} isSelected={true} />
                 </div>
                 
                 <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-medium tracking-wide">
                    <Star size={9} className="fill-red-600 text-red-600 animate-pulse" />
                    <span>Waiting for the details confirmation...</span>
                 </div>

                 <div className="flex gap-2 mt-0.5">
                   <button 
                     onClick={() => setSelectedHotelId(null)}
                     className="px-3 py-1 rounded-full text-[9px] border border-zinc-700 text-zinc-400 hover:text-white"
                   >
                     Back
                   </button>
                   <button 
                     onClick={() => setShowPersonnelModal(true)}
                     className="bg-zinc-100 hover:bg-white text-black px-4 py-1 rounded-full text-[9px] font-bold transition-all"
                   >
                     Confirm & Proceed
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area: Minimized */}
        <div className="flex-shrink-0 px-8 pb-3 pt-0.5">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="What is your Khwaaish?" 
              className="w-full bg-[#121212] border border-zinc-800 rounded-full py-2 pl-4 pr-20 text-[11px] text-zinc-300 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button className="p-1 text-zinc-500 hover:text-zinc-300"><Paperclip size={12} /></button>
              <button className="p-1 text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 rounded-full"><Mic size={12} /></button>
              <button className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-full"><Send size={10} /></button>
            </div>
          </div>
        </div>

      </main>

      {/* Render Modals */}
      {showPersonnelModal && (
        <PersonnelModal 
          onClose={() => setShowPersonnelModal(false)}
          onProceed={() => {
            setShowPersonnelModal(false);
            setShowPaymentModal(true);
          }}
        />
      )}
      {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
      
    </div>
  );
}
