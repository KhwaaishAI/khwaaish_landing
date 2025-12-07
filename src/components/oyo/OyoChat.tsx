import React, { useState } from 'react';
import BookingModal from './BookingModal';
import HotelResults from './HotelResults';
import HomeSidebar from '../home/HomeSidebar'; // Importing your Sidebar
import { 
  Bell, 
  Paperclip, 
  Mic, 
  SendHorizontal, 
  Star 
} from 'lucide-react';

const OyoChat = () => {
  // --- State Management ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResults, setShowResults] = useState(false); 

  // --- Handlers ---
  const handleSearch = () => {
    setIsModalOpen(false); // Close the modal
    setShowResults(true);  // Switch to the results view
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-red-500/30">
      
      {/* ================= SIDEBAR ================= */}
      {/* We wrap HomeSidebar to handle responsive hiding (hidden on mobile, shown on desktop) */}
      <div className="hidden md:block h-full">
        <HomeSidebar />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col relative bg-black">
        
        {/* Header (Top Right) */}
        <header className="absolute top-4 right-6 flex items-center gap-4 z-10">
          <button className="text-zinc-400 hover:text-white transition">
            <Bell size={20} />
          </button>
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" 
            alt="Profile" 
            className="w-8 h-8 rounded-full object-cover border border-zinc-800"
          />
        </header>

        {/* Chat Area Scrollable */}
        <div className="flex-1 overflow-y-auto flex flex-col p-4 sm:p-20 w-full max-w-5xl mx-auto custom-scrollbar">
          <div className="flex flex-col space-y-8 w-full">
             
            {/* 1. User Message (Right) */}
            <div className="self-end bg-zinc-800/80 text-zinc-200 px-5 py-3 rounded-2xl rounded-tr-sm max-w-md text-sm">
              Book a Hotel for 2
            </div>

            {/* 2. AI Response Container (Left) */}
            <div className="self-start w-full max-w-4xl space-y-4">
                
                {/* Status Indicator */}
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium tracking-wide">
                    <Star size={12} className="fill-red-600 text-red-600 animate-pulse" />
                    <span>Executing your Khwaaish...</span>
                </div>
                
                {/* AI Text */}
                <p className="text-zinc-300 text-[15px] leading-relaxed">
                  Please Provide the Location and other details for the booking to proceed.
                </p>

                {/* --- LOGIC: Button vs. Results --- */}
                {!showResults ? (
                  // State A: Show the Button
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-5 py-2.5 rounded-full text-sm transition-colors cursor-pointer"
                  >
                    Enter Booking details
                  </button>
                ) : (
                  // State B: Show the Hotel Results (Imported Component)
                  <HotelResults />
                )}

            </div>
          </div>
        </div>

        {/* Input Area (Bottom Fixed) */}
        <div className="w-full p-6 pb-8 flex justify-center bg-gradient-to-t from-black via-black to-transparent z-20">
          <div className="w-full max-w-3xl flex items-center gap-3">
            
            {/* Input Bar */}
            <div className="flex-1 bg-[#18181b] border border-zinc-800/50 rounded-full flex items-center px-4 py-3 shadow-lg shadow-black/50 focus-within:border-zinc-700 transition-colors">
              <input 
                type="text" 
                placeholder="What is your Khwaaish?" 
                className="flex-1 bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-500 text-sm ml-2" 
              />
              <div className="flex items-center gap-3 text-zinc-500 pr-1">
                <button className="hover:text-zinc-300 transition"><Paperclip size={18} /></button>
                <button className="hover:text-zinc-300 transition"><Mic size={18} /></button>
              </div>
            </div>

            {/* Send Button */}
            <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-3.5 rounded-full transition-all border border-zinc-700/50">
              <SendHorizontal size={20} />
            </button>
            
          </div>
        </div>

        {/* --- MODAL POPUP --- */}
        {/* This triggers when isModalOpen is true */}
        {isModalOpen && (
          <BookingModal 
            onClose={() => setIsModalOpen(false)} 
            onSearch={handleSearch} 
          />
        )}

      </main>
    </div>
  );
};

export default OyoChat;