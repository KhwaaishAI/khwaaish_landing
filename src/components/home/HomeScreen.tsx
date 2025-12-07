import React, { useState } from 'react';
import { Star, Home, ShoppingCart, Bell, CheckCircle, ArrowLeft, Minus, Plus } from 'lucide-react';

// --- COMPONENTS ---
import HomeSidebar from './HomeSidebar';
import HomeChatBar from './HomeChatBar';
import FoodProductCard from './FoodProductCard';
import MoreProductsSidebar from './MoreProductsSidebar';

// --- AUTH & POPUPS ---
import MobileNumber from '../auth/MobileNumber';
import OtpVerification from '../auth/OtpVerification';
import DeliveryLocation from '../auth/DeliveryLocation';
import ConfirmAddress from '../auth/ConfirmAddress';
import UpiPayment from '../auth/UpiPayment';

// --- DATA ---
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

const BURGER_DATA: Product[] = [
  { id: 1, name: "McChicken Burger", restaurant: "McDonald's", price: 150, oldPrice: 230, rating: "4.3", time: "20-25 min", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60" },
  { id: 2, name: "Crispy Chicken Burger", restaurant: "Burger King", price: 150, oldPrice: 230, rating: "4.1", time: "20-25 min", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=60" },
  { id: 3, name: "Classic Chicken Burger", restaurant: "KFC", price: 150, oldPrice: 230, rating: "4.2", time: "20-25 min", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=60" },
  { id: 4, name: "McChicken Burger", restaurant: "Louis Burger", price: 150, oldPrice: 230, rating: "4.5", time: "20-25 min", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60" },
  { id: 5, name: "McChicken Burger", restaurant: "McDonald's", price: 120, oldPrice: 299, rating: "4.3", time: "20-25 min", image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=500&q=60" },
  { id: 6, name: "Classic Chicken Burger", restaurant: "Burger King", price: 230, oldPrice: 0, rating: "4.2", time: "20-25 min", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60" },
  { id: 7, name: "McChicken Burger", restaurant: "McDonald's", price: 160, oldPrice: 0, rating: "4.3", time: "20-25 min", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=60" },
];

export default function HomeScreen() {
  // --- STATE MANAGEMENT ---
  const [authStep, setAuthStep] = useState<'none' | 'mobile' | 'otp' | 'location'>('none');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addressAdded, setAddressAdded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddressConfirm, setShowAddressConfirm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  // NEW: State for quantity
  const [qty, setQty] = useState(1);

  // --- HANDLERS ---
  const handleProductClick = (product: Product) => {
    setQty(1); // Reset quantity when a new product is clicked
    setSelectedProduct(product);
    setShowSidebar(false);
  };

  // NEW: Increase Quantity
  const handleIncrease = () => {
    setQty(prev => prev + 1);
  };

  // NEW: Decrease Quantity
  const handleDecrease = () => {
    if (qty > 1) {
      setQty(prev => prev - 1);
    }
  };

  return (
    <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR */}
      <HomeSidebar />

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <header className="flex justify-between items-center p-6 bg-black z-10 shrink-0">
          <button className="text-gray-300 hover:text-white"><Home size={20} /></button>
          <div className="flex gap-6">
            <button className="text-gray-300 hover:text-white"><ShoppingCart size={20} /></button>
            <button className="text-gray-300 hover:text-white"><Bell size={20} /></button>
          </div>
        </header>

        {/* Chat / Content Area */}
        <div className="flex-1 overflow-y-auto pb-40 px-4 scrollbar-hide">
          <div className="max-w-5xl mx-auto flex flex-col items-end space-y-6 pt-4">
            
            {/* User Message */}
            <div className="bg-[#333333] text-gray-200 px-6 py-3 rounded-2xl rounded-tr-none text-sm font-medium max-w-md">
              Order me a burger from McDonald's
            </div>

            <div className="w-full flex flex-col items-start space-y-4">
              
              {/* FLOW STEP 1: LOGIN */}
              {!isLoggedIn && (
                <>
                  <div className="flex items-start gap-2 text-gray-300 text-sm">
                    <Star className="w-4 h-4 text-red-500 fill-red-500 mt-0.5" />
                    <span>To proceed further, login with your Swiggy account.</span>
                  </div>
                  <button onClick={() => setAuthStep('mobile')} className="bg-[#c21414] text-white text-sm px-8 py-2 rounded-full font-medium ml-6">Login</button>
                </>
              )}

              {/* FLOW STEP 2: ADDRESS */}
              {isLoggedIn && !addressAdded && (
                <>
                  <div className="flex items-center gap-2 text-green-600 text-xs ml-6">
                    <CheckCircle size={14} />
                    <span>Mobile number confirmed..</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-300 text-sm">
                    <Star className="w-4 h-4 text-red-500 fill-red-500 mt-0.5" />
                    <span>Please Provide your current location to proceed with the results.</span>
                  </div>
                  <button onClick={() => setAuthStep('location')} className="bg-[#c21414] text-white text-sm px-6 py-2 rounded-full font-medium ml-6">Add Address</button>
                </>
              )}

              {/* FLOW STEP 3: PRODUCTS */}
              {isLoggedIn && addressAdded && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-1 mb-4 ml-1">
                    <div className="flex items-center gap-2 text-gray-400 text-xs"><Star className="w-3 h-3 text-red-500 fill-red-500" /><span>Executing your Khwaaish...</span></div>
                    <div className="flex items-center gap-2 text-green-600 text-xs"><CheckCircle size={12} /><span>Location & Mobile number confirmed</span></div>
                    <div className="flex items-center gap-2 text-green-600 text-xs"><CheckCircle size={12} /><span>Products found</span></div>
                  </div>

                  {!selectedProduct ? (
                    // VIEW A: GRID
                    <>
                      <p className="text-gray-300 text-sm mb-6 ml-1">Here are the burgers available near your location.</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                        {BURGER_DATA.map((burger) => (
                          <div key={burger.id} onClick={() => handleProductClick(burger)}>
                            <FoodProductCard {...burger} />
                          </div>
                        ))}
                        <div onClick={() => setShowSidebar(true)}>
                            <FoodProductCard isLast={true} name="" restaurant="" price={0} oldPrice={0} rating="" time="" image="" />
                        </div>
                      </div>
                    </>
                  ) : (
                    // VIEW B: SELECTED ITEM
                    <div className="w-full max-w-xl">
                      <p className="text-gray-300 text-sm mb-4 ml-1">Here are the burgers available near your location.</p>
                      <div className="flex items-center gap-2 mb-4 cursor-pointer hover:text-gray-300 transition-colors" onClick={() => setSelectedProduct(null)}>
                        <ArrowLeft size={18} className="text-white" />
                        <span className="font-bold text-white">Selected item from {selectedProduct.restaurant}</span>
                      </div>
                      
                      {/* --- MODIFIED CARD WITH QUANTITY LOGIC --- */}
                      <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-4 flex gap-5 items-start relative mb-6">
                         <div className="w-24 h-24 bg-white rounded-lg p-1 relative shrink-0 overflow-hidden">
                             <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover rounded" />
                             <div className="absolute top-1 right-1 bg-white p-[2px] rounded-sm shadow-sm z-10">
                                <div className="border border-red-600 w-2.5 h-2.5 flex items-center justify-center rounded-[1px]"><div className="bg-red-600 w-1.5 h-1.5 rounded-full"></div></div>
                            </div>
                         </div>
                         <div className="flex-1 pt-1">
                             <h3 className="text-lg font-medium text-white">{selectedProduct.name}</h3>
                             <p className="text-gray-400 text-sm mb-2">By {selectedProduct.restaurant}</p>
                             
                             {/* UPDATED: Dynamic Quantity Text */}
                             <p className="text-gray-200 text-sm mb-2 font-medium">Qty:{qty}</p>
                             
                             {/* UPDATED: Dynamic Price Calculation */}
                             <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg font-bold text-white">₹ {selectedProduct.price * qty}</span>
                                <span className="text-red-600 text-sm line-through">₹{selectedProduct.oldPrice * qty}</span>
                             </div>
                         </div>
                         
                         {/* UPDATED: Buttons with Click Handlers */}
                         <div className="absolute top-4 right-4 flex items-center bg-[#1a1a1a] border border-gray-700 rounded-lg overflow-hidden">
                             <button 
                                onClick={handleDecrease}
                                className="px-3 py-1 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                             >
                                <Minus size={14} />
                             </button>
                             
                             <span className="px-2 text-white font-medium text-sm w-8 text-center">{qty}</span>
                             
                             <button 
                                onClick={handleIncrease}
                                className="px-3 py-1 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                             >
                                <Plus size={14} />
                             </button>
                         </div>
                      </div>
                      {/* --- END MODIFIED CARD --- */}

                      <div className="flex items-start gap-2 text-gray-500 text-xs mb-4 ml-1">
                        <Star className="w-3 h-3 text-red-500 fill-red-500 mt-0.5" />
                        <span>Waiting for the details confirmation...</span>
                      </div>
                      <button 
                        onClick={() => setShowAddressConfirm(true)}
                        className="bg-[#c21414] hover:bg-red-700 text-white text-sm px-8 py-2.5 rounded-full font-bold transition-colors shadow-lg ml-1"
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 3. BOTTOM CHAT BAR */}
        <HomeChatBar />
      </main>

      {/* --- ALL POPUPS AND MODALS --- */}
      
      {/* 1. Mobile Input */}
      {authStep === 'mobile' && (
        <MobileNumber onClose={() => setAuthStep('none')} onSubmit={() => setAuthStep('otp')} />
      )}
      
      {/* 2. OTP Input */}
      {authStep === 'otp' && (
        <OtpVerification onClose={() => setAuthStep('none')} onEditNumber={() => setAuthStep('mobile')} onSubmit={() => { setAuthStep('none'); setIsLoggedIn(true); }} />
      )}
      
      {/* 3. Location Input */}
      {authStep === 'location' && (
        <DeliveryLocation onClose={() => setAuthStep('none')} onSubmit={() => { setAuthStep('none'); setAddressAdded(true); }} />
      )}
      
      {/* 4. Address Form Popup */}
      {showAddressConfirm && (
        <ConfirmAddress 
          onClose={() => setShowAddressConfirm(false)} 
          onSave={() => { setShowAddressConfirm(false); setShowPayment(true); }} 
        />
      )}

      {/* 5. UPI Payment Popup */}
      {showPayment && (
        <UpiPayment 
            onClose={() => setShowPayment(false)} 
            onPay={() => { setShowPayment(false); alert("Payment Processing..."); }}
            amount={selectedProduct ? selectedProduct.price * qty : 0} 
        />
      )}

      {/* 6. Sliding Sidebar */}
      <MoreProductsSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} products={BURGER_DATA} />

    </div>
  );
}