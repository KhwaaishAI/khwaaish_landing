import React, { useState } from 'react';
import { X, Calendar, ChevronDown, ChevronUp, Crosshair, Minus, Plus } from 'lucide-react';

// 1. Update the Interface to accept onSearch
interface BookingModalProps {
  onClose: () => void;
  onSearch: () => void; 
}

export default function BookingModal({ onClose, onSearch }: BookingModalProps) {
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [counts, setCounts] = useState({ adults: 2, children: 0, rooms: 1 });

  const updateCount = (type: 'adults' | 'children' | 'rooms', operation: 'inc' | 'dec') => {
    setCounts(prev => {
      const current = prev[type];
      if (operation === 'dec') {
        if (type === 'adults' && current <= 1) return prev;
        if (type === 'rooms' && current <= 1) return prev;
        if (current <= 0) return prev;
        return { ...prev, [type]: current - 1 };
      } else {
        return { ...prev, [type]: current + 1 };
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-[450px] bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-center items-center mb-8 relative">
            <h2 className="text-white text-lg font-bold tracking-wide">Booking Details</h2>
            <button onClick={onClose} className="absolute right-0 text-zinc-500 hover:text-white transition-colors p-1">
                <X size={20} />
            </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
            {/* Location */}
            <div className="relative">
                <label className="absolute -top-2 left-3 bg-[#0a0a0a] px-1 text-[11px] text-zinc-500 font-medium">Enter location</label>
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <input type="text" placeholder="e.g : Hyderabad" className="w-full bg-transparent border border-zinc-800 rounded-lg py-3 px-4 text-zinc-300 placeholder-zinc-600 focus:border-zinc-500 outline-none text-sm h-12" />
                    </div>
                    <button className="w-12 h-12 flex items-center justify-center border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors bg-transparent"><Crosshair size={20} /></button>
                </div>
            </div>

            {/* Dates */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <label className="absolute -top-2 left-3 bg-[#0a0a0a] px-1 text-[11px] text-zinc-500 font-medium z-10">Check-in Date</label>
                    <div className="relative">
                        <input type="text" defaultValue="11/10/2026" className="w-full bg-transparent border border-zinc-800 rounded-lg py-3 px-4 text-zinc-300 focus:border-zinc-500 outline-none text-sm h-12" />
                        <Calendar className="absolute right-3 top-3.5 text-zinc-500 pointer-events-none" size={16} />
                    </div>
                </div>
                <div className="relative flex-1">
                    <label className="absolute -top-2 left-3 bg-[#0a0a0a] px-1 text-[11px] text-zinc-500 font-medium z-10">Check-out Date</label>
                    <div className="relative">
                        <input type="text" defaultValue="20/10/2026" className="w-full bg-transparent border border-zinc-800 rounded-lg py-3 px-4 text-zinc-300 focus:border-zinc-500 outline-none text-sm h-12" />
                        <Calendar className="absolute right-3 top-3.5 text-zinc-500 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Guests */}
            <div className="relative">
                <label className="absolute -top-2 left-3 bg-[#0a0a0a] px-1 text-[11px] text-zinc-500 font-medium z-20">Number of people</label>
                <div onClick={() => setIsGuestsOpen(!isGuestsOpen)} className={`relative w-full bg-transparent border ${isGuestsOpen ? 'border-zinc-500 rounded-t-lg border-b-0' : 'border-zinc-800 rounded-lg'} py-3 px-4 text-zinc-300 text-sm h-12 flex items-center justify-between cursor-pointer hover:border-zinc-600 transition-colors select-none`}>
                    <span>{counts.adults} adults . {counts.children} children . {counts.rooms} room</span>
                    {isGuestsOpen ? <ChevronUp className="text-zinc-500" size={16} /> : <ChevronDown className="text-zinc-500" size={16} />}
                </div>

                {isGuestsOpen && (
                  <div className="absolute w-full bg-[#18181b] border border-zinc-700 border-t-0 rounded-b-lg p-4 z-50 shadow-xl space-y-4 top-12 left-0">
                    {['adults', 'children', 'rooms'].map((type) => (
                      <div key={type} className="flex items-center justify-between capitalize">
                        <span className="text-zinc-300 text-sm">{type}</span>
                        <div className="flex items-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); updateCount(type as any, 'dec'); }} className="w-8 h-8 flex items-center justify-center border border-zinc-600 rounded text-zinc-400 hover:bg-zinc-800"><Minus size={14} /></button>
                          <span className="w-4 text-center text-sm font-medium text-white">{counts[type as keyof typeof counts]}</span>
                          <button onClick={(e) => { e.stopPropagation(); updateCount(type as any, 'inc'); }} className="w-8 h-8 flex items-center justify-center border border-zinc-600 rounded text-zinc-400 hover:bg-zinc-800"><Plus size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* 2. Update the Button to trigger onSearch */}
            <button 
              onClick={onSearch}
              className="w-full bg-[#D6001C] hover:bg-[#b50018] text-white font-bold py-3.5 rounded-xl mt-6 transition-colors tracking-wide text-sm uppercase shadow-[0_0_15px_rgba(214,0,28,0.3)]"
            >
                CONTINUE
            </button>
        </div>
      </div>
    </div>
  );
}