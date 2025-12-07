import React from 'react';
import { Plus, Mic, X } from 'lucide-react';

export default function HomeChatBar() {
  return (
    <div className="absolute bottom-10 left-0 right-0 px-4 md:px-10 flex justify-center">
      <div className="w-full max-w-4xl bg-[#2a2a2a] rounded-3xl p-4 flex flex-col gap-4 shadow-lg border border-white/5">
        
        {/* Input Placeholder Label */}
        <span className="text-gray-400 text-sm px-1">
          What is your Khwaaish?
        </span>

        {/* Input Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            {/* Plus Button */}
            <button className="w-10 h-10 rounded-full bg-[#404040] flex items-center justify-center text-white hover:bg-[#505050] transition-colors">
              <Plus size={20} />
            </button>

            {/* === SWIGGY BUTTON (Added Here) === */}
            <div className="flex items-center gap-2 bg-[#d65e34] text-white pl-1 pr-3 py-1 rounded-full text-sm font-medium transition-transform hover:scale-105 cursor-pointer">
              {/* White Circle with Icon */}
              <div className="bg-white w-6 h-6 rounded-full flex items-center justify-center">
                 {/* Simulated Swiggy Logo Icon */}
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d65e34" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s-8-6-8-12a8 8 0 0 1 16 0c0 6-8 12-8 12z"/>
                    <circle cx="12" cy="10" r="3"/>
                 </svg>
              </div>
              
              <span className="mb-0.5">Swiggy</span>
              
              {/* Close (X) Icon */}
              <button className="ml-1 text-white/80 hover:text-white">
                <X size={14} />
              </button>
            </div>

          </div>

          {/* Mic Button */}
          <button className="w-10 h-10 rounded-full bg-[#404040] flex items-center justify-center text-white hover:bg-[#505050] transition-colors">
            <Mic size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}