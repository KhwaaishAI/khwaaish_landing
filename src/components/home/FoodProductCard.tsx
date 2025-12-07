import React, { useState } from 'react';
import { Star, Plus, Minus } from 'lucide-react'; // Added Plus and Minus icons

interface FoodProductCardProps {
  name: string;
  restaurant: string;
  price: number;
  oldPrice: number;
  rating: string;
  time: string;
  image: string;
  isLast?: boolean;
}

export default function FoodProductCard({
  name,
  restaurant,
  price,
  oldPrice,
  rating,
  time,
  image,
  isLast = false,
}: FoodProductCardProps) {
  
  // State to manage quantity
  const [quantity, setQuantity] = useState(1);

  // Handlers for increasing/decreasing quantity
  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Special Render for the "View all products" card (Unchanged)
  if (isLast) {
    return (
      <div className="min-w-[200px] h-full bg-[#1c1c1c] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#252525] transition-colors border border-white/5">
        <div className="flex -space-x-4 mb-4">
           <div className="w-12 h-12 rounded-full border-2 border-[#1c1c1c] overflow-hidden">
             <img src={image} className="w-full h-full object-cover" alt="" />
           </div>
           <div className="w-12 h-12 rounded-full border-2 border-[#1c1c1c] overflow-hidden bg-gray-800">
              <img src={image} className="w-full h-full object-cover opacity-50" alt="" />
           </div>
           <div className="w-12 h-12 rounded-full border-2 border-[#1c1c1c] overflow-hidden bg-gray-700">
               <img src={image} className="w-full h-full object-cover opacity-30" alt="" />
           </div>
        </div>
        <span className="text-white font-medium text-sm">View all</span>
        <span className="text-white font-medium text-sm">products »</span>
      </div>
    );
  }

  // Standard Product Card
  return (
    <div className="bg-black rounded-xl overflow-hidden border border-white/10 hover:border-gray-500 transition-all cursor-pointer group min-w-[200px]">
      
      {/* Image Area */}
      <div className="relative h-32 w-full overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Non-Veg Icon */}
        <div className="absolute top-2 right-2 bg-white p-[2px] rounded-sm shadow-sm">
            <div className="border border-red-600 w-3 h-3 flex items-center justify-center rounded-[1px]">
                <div className="bg-red-600 w-1.5 h-1.5 rounded-full"></div>
            </div>
        </div>

        {/* Time & Rating Overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
             <span className="bg-white/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
               {time}
             </span>
             <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
               {rating} <Star size={8} fill="currentColor" />
             </span>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-3">
        <h3 className="text-white text-sm font-bold truncate">{name}</h3>
        <p className="text-gray-400 text-xs truncate mb-3">By {restaurant}</p>
        
        {/* Price and Quantity Control Row */}
        <div className="flex items-center justify-between mt-2">
            
            {/* Dynamic Price Display */}
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">
                ₹ {price * quantity}
              </span>
              <span className="text-gray-600 text-[10px] line-through">
                ₹ {oldPrice * quantity}
              </span>
            </div>

            {/* Quantity Counter Buttons */}
            <div className="flex items-center bg-[#1c1c1c] border border-white/20 rounded-md overflow-hidden">
                <button 
                  onClick={handleDecrease}
                  className="p-1.5 text-white hover:bg-gray-700 active:bg-gray-600 transition-colors"
                >
                  <Minus size={14} />
                </button>
                
                <span className="px-2 text-white text-xs font-bold w-6 text-center">
                  {quantity}
                </span>

                <button 
                  onClick={handleIncrease}
                  className="p-1.5 text-white hover:bg-gray-700 active:bg-gray-600 transition-colors"
                >
                  <Plus size={14} />
                </button>
            </div>

        </div>
      </div>

    </div>
  );
}