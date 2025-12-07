import React from 'react';
import { ArrowLeft } from 'lucide-react';
import FoodProductCard from './FoodProductCard';

interface Product {
  id: number;
  name: string;
  restaurant: string;
  price: number;
  oldPrice: number;
  rating: string;
  time: string;
  image: string;
}

interface MoreProductsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export default function MoreProductsSidebar({ isOpen, onClose, products }: MoreProductsSidebarProps) {
  return (
    <>
      {/* 1. Backdrop Blur Overlay (Only visible when sidebar is open) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 2. Sliding Sidebar Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-[#0d0d0d] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-white/10 bg-[#0d0d0d]">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-medium text-white">More products</h2>
        </div>

        {/* Scrollable Content */}
        <div className="h-[calc(100vh-70px)] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <div key={product.id} className="min-w-0"> {/* Wrapper to prevent flex shrinking issues */}
                <FoodProductCard {...product} />
              </div>
            ))}
            {/* Duplicate data to fill the list for demonstration */}
            {products.map((product) => (
              <div key={`dup-${product.id}`} className="min-w-0">
                <FoodProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}