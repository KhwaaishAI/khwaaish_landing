import { useState } from "react";

const API_BASE_URL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;

interface Product {
    name: string;
    company: string;
    price: string;
    originalPrice: string;
    discount: string;
    quantity: string;
    image_url?: string;
    product_url?: string;
}

interface Message {
    type: "user" | "system";
    content: string;
}

export default function Pharmeasy() {
    const [showPincodePopup, setShowPincodePopup] = useState(false);
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showViewAll, setShowViewAll] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(10);
    const [showUpiPopup, setShowUpiPopup] = useState(false);
    const [upiId, setUpiId] = useState("");

    const [pincode, setPincode] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [chatInput, setChatInput] = useState("");

    const [sessionId, setSessionId] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingPincode, setLoadingPincode] = useState(false);
    const [loadingOtp, setLoadingOtp] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingPay, setLoadingPay] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleEnterDetails = () => {
        setShowPincodePopup(true);
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setQuantity(10);
        setShowViewAll(false);
    };

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleConfirmOrder = () => {
        setShowUpiPopup(true);
    };

    const handleSendOtp = async () => {
        if (!pincode || pincode.length !== 6) {
            alert("Please enter a valid 6-digit pincode");
            return;
        }
        if (!mobileNumber || mobileNumber.length !== 10) {
            alert("Please enter a valid 10-digit mobile number");
            return;
        }

        setLoadingPincode(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/pharmeasy/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "pincode": pincode,
                    "mobile_number": mobileNumber,
                }),
            });

            // Get session_id from login response
            try {
                const data = await response.json();
                if (data.session_id) {
                    setSessionId(data.session_id);
                    console.log("Session ID from login:", data.session_id);
                }
            } catch (e) {
                console.log("Could not parse login response");
            }

            setShowPincodePopup(false);
            setShowOtpPopup(true);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to send OTP. Please try again.");
        } finally {
            setLoadingPincode(false);
        }
    };

    const handleConfirmOtp = async () => {
        if (!otp || otp.length !== 4) {
            alert("Please enter a valid 4-digit OTP");
            return;
        }

        setLoadingOtp(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/pharmeasy/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId || "temp_session",
                    otp: otp,
                }),
            });

            const data = await response.json();
            if (data.session_id) {
                setSessionId(data.session_id);
            }

            setShowOtpPopup(false);
            setShowChat(true);

            // Add success message to chat
            setMessages([
                { type: "system", content: "OTP verified successfully! ✓" },
                { type: "system", content: "Please enter your medicine query below." }
            ]);

        } catch (error) {
            console.error("OTP verification error:", error);
            alert("Failed to verify OTP. Please try again.");
        } finally {
            setLoadingOtp(false);
        }
    };

    const handleSearchProducts = async () => {
        if (!chatInput.trim()) {
            return;
        }

        if (!sessionId) {
            alert("Session expired. Please start over.");
            return;
        }

        // Add user message to chat
        setMessages(prev => [...prev, { type: "user", content: chatInput }]);
        const query = chatInput;
        setChatInput("");
        setLoadingProducts(true);

        try {
            console.log("Searching with session_id:", sessionId);
            const response = await fetch(`${API_BASE_URL}/api/pharmeasy/search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    query: query,
                    max_items: 50,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Search response:", data);

            // Transform API response to Product format
            // API returns { products: [...] } based on user feedback
            const productsList = data.products || data.results || [];

            const transformedProducts: Product[] = productsList.map((item: any) => ({
                name: item.name || "Unknown Product",
                company: item.manufacturer || "PharmEasy",
                price: item.price || "₹0",
                originalPrice: item.original_price || item.mrp || "₹0",
                discount: item.discount || "0% OFF",
                quantity: item.pack_size || "Standard Pack",
                image_url: item.image_url,
                product_url: item.url || item.product_url,
            }));

            setProducts(transformedProducts);
            setMessages(prev => [...prev, {
                type: "system",
                content: `Found ${transformedProducts.length} products matching "${query}"`
            }]);

        } catch (error) {
            console.error("Search error:", error);
            setMessages(prev => [...prev, {
                type: "system",
                content: "Failed to search products. Please try again."
            }]);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleUpiSubmit = async () => {
        if (!upiId) {
            alert("Please enter a valid UPI ID");
            return;
        }

        if (!selectedProduct || !sessionId) {
            alert("Session expired. Please start over.");
            return;
        }

        setLoadingPay(true);
        try {
            console.log("Adding to cart with session_id:", sessionId);
            // Construct full product URL
            const fullProductUrl = selectedProduct.product_url?.startsWith('http')
                ? selectedProduct.product_url
                : `https://pharmeasy.in${selectedProduct.product_url}`;

            await fetch(`${API_BASE_URL}/api/pharmeasy/add-to-cart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    product_url: fullProductUrl,
                    quantity: quantity,
                    upi_id: upiId,
                    media_account: "upi",
                }),
            });

            alert(`Order confirmed! Payment will be processed via UPI: ${upiId}`);
            setShowUpiPopup(false);
            setUpiId("");
            setSelectedProduct(null);
            setQuantity(10);

            // Add success message to chat
            setMessages(prev => [...prev, {
                type: "system",
                content: `✓ Successfully added ${selectedProduct.name} (${quantity} units) to cart!`
            }]);

        } catch (error) {
            console.error("Add to cart error:", error);
            alert("Failed to add to cart. Please try again.");
        } finally {
            setLoadingPay(false);
        }
    };

    return (
        <div className="min-h-screen w-screen bg-black text-white">
            {/* Sidebar */}
            <aside
                className={
                    `fixed left-0 top-0 z-40 h-full border-r border-gray-800 bg-black transition-transform duration-300 ` +
                    `w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
                }
            >
                <div className="flex justify-between items-center gap-2 px-4 py-3">
                    <button
                        className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <img
                            src="/images/LOGO.png"
                            alt="Khwaaish AI"
                            className="h-12 w-auto sm:h-14 md:h-16 shrink-0 object-contain"
                        />
                    </button>
                    <button
                        className="inline-flex items-center justify-center rounded-lg p-1.5 hover:bg-gray-900"
                        onClick={() => setSidebarOpen((v) => !v)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <div className="px-3">
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>New Chat</span>
                    </button>
                </div>

                <div className="mt-3 space-y-2 px-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>History</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span>Wallet</span>
                    </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-semibold">
                            E
                        </div>
                        <span className="text-sm">Emma Stone</span>
                    </div>
                    <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors">
                        Upgrade
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative">
                {/* Top bar */}
                <div className="sticky top-0 left-0 right-0 z-20 p-2 flex items-center justify-between">
                    {!sidebarOpen && (
                        <button
                            className="absolute left-4 top-4 z-40 inline-flex items-center justify-center rounded-lg p-1 hover:bg-gray-900"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <img src="/images/Circle.png" alt="Open sidebar" className="h-8 w-8 object-contain" />
                        </button>
                    )}
                    <div className="ml-auto flex items-center gap-3">
                        <button className="relative p-2 hover:bg-gray-900 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="p-2 hover:bg-gray-900 rounded-full transition-colors">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-semibold">
                                E
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {/* System Message */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-300 mb-2">Executing your Khwaaish...</p>
                                    <p className="text-sm mb-3">Please provide the delivery location and mobile number for the order to proceed.</p>

                                    {!showChat && (
                                        <button
                                            onClick={handleEnterDetails}
                                            className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-full text-white font-medium transition-colors"
                                        >
                                            Enter details
                                        </button>
                                    )}

                                    {/* Chat Messages */}
                                    {showChat && (
                                        <div className="space-y-3 mt-4">
                                            {messages.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.type === 'user'
                                                        ? 'bg-teal-600 text-white'
                                                        : 'bg-gray-800 text-gray-200'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Loading indicator */}
                                            {loadingProducts && (
                                                <div className="flex justify-start">
                                                    <div className="bg-gray-800 rounded-lg px-4 py-2">
                                                        <div className="flex gap-1">
                                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Products Grid */}
                                            {!selectedProduct && products.length > 0 && (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {products.slice(0, 6).map((product, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => handleProductClick(product)}
                                                                className="bg-white text-black rounded-lg p-4 border-2 border-gray-200 hover:border-teal-500 transition-all cursor-pointer"
                                                            >
                                                                {product.image_url ? (
                                                                    <img
                                                                        src={product.image_url}
                                                                        alt={product.name}
                                                                        className="w-full h-32 object-contain rounded-lg mb-3"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center">
                                                                        <div className="grid grid-cols-3 gap-1">
                                                                            {[...Array(15)].map((_, i) => (
                                                                                <div key={i} className="w-4 h-4 bg-blue-400 rounded-full"></div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
                                                                <p className="text-xs text-gray-600 mb-2">{product.company}</p>
                                                                <div className="flex items-baseline gap-2 mb-1">
                                                                    <span className="text-red-600 font-bold text-lg">{product.price}</span>
                                                                    <span className="text-gray-400 line-through text-xs">{product.originalPrice}</span>
                                                                </div>
                                                                <p className="text-green-600 text-xs font-semibold mb-2">{product.discount}</p>
                                                                <p className="text-xs text-gray-500">{product.quantity}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {products.length > 6 && (
                                                        <button
                                                            onClick={() => setShowViewAll(true)}
                                                            className="w-full md:w-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            View All ({products.length} products)
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Selected Product View */}
                                            {selectedProduct && (
                                                <div className="space-y-3">
                                                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                                                        <div className="flex gap-4">
                                                            {selectedProduct.image_url ? (
                                                                <img
                                                                    src={selectedProduct.image_url}
                                                                    alt={selectedProduct.name}
                                                                    className="w-20 h-20 object-contain rounded-lg flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                    <div className="grid grid-cols-3 gap-1">
                                                                        {[...Array(15)].map((_, i) => (
                                                                            <div key={i} className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-base mb-1">{selectedProduct.name}</h4>
                                                                <p className="text-xs text-gray-400 mb-2">{selectedProduct.company}</p>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <span className="text-red-500 font-bold text-xl">{selectedProduct.price}</span>
                                                                    <span className="text-gray-500 line-through text-sm">{selectedProduct.originalPrice}</span>
                                                                </div>
                                                                <p className="text-green-500 text-xs font-semibold">{selectedProduct.discount}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{selectedProduct.quantity}</p>
                                                            </div>
                                                            <div className="flex flex-col items-end justify-between">
                                                                <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1">
                                                                    <span className="text-xs text-gray-400">Qty :</span>
                                                                    <button
                                                                        onClick={() => handleQuantityChange(-1)}
                                                                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded transition-colors"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="w-8 text-center font-semibold">{quantity}</span>
                                                                    <button
                                                                        onClick={() => handleQuantityChange(1)}
                                                                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded transition-colors"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => setSelectedProduct(null)}
                                                                    className="text-red-500 text-sm hover:underline flex items-center gap-1"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        Waiting for the details confirmation...
                                                    </p>

                                                    <button
                                                        onClick={handleConfirmOrder}
                                                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white font-medium transition-colors"
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
                    </div>
                </div>

                {/* Input Area - Fixed to bottom */}
                {showChat && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black z-10">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-2 bg-gray-900 rounded-full px-4 py-3">
                                <button className="p-1 hover:bg-gray-800 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    placeholder="Ask for medicines..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchProducts()}
                                    className="flex-1 bg-transparent outline-none text-sm"
                                />
                                <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleSearchProducts}
                                    className="p-2 bg-white hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                />
            )}

            {/* Pincode & Mobile Popup */}
            {showPincodePopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Booking Details</h2>
                            <button
                                onClick={() => setShowPincodePopup(false)}
                                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Pincode */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Enter Pincode</label>
                                <input
                                    type="text"
                                    placeholder="e.g., 500001"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    maxLength={6}
                                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-gray-600 transition-colors"
                                />
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Enter Mobile Number</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value="+91"
                                        disabled
                                        className="w-16 bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-3 text-center outline-none"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="1234567890"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        maxLength={10}
                                        className="flex-1 bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-gray-600 transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSendOtp}
                                disabled={loadingPincode}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {loadingPincode ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    "SEND OTP"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* OTP Popup */}
            {showOtpPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">OTP Authentication</h2>
                            <button
                                onClick={() => setShowOtpPopup(false)}
                                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-400 mb-3">Enter the 4-digit OTP from Pharmeasy</p>

                            {/* OTP Boxes */}
                            <div className="flex gap-3 mb-4 justify-center">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        maxLength={1}
                                        value={otp[i] || ""}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            const newOtp = otp.split("");
                                            newOtp[i] = val;
                                            setOtp(newOtp.join("").slice(0, 4));
                                            if (val && i < 3) {
                                                const nextInput = (e.target as HTMLInputElement).parentElement?.children[i + 1] as HTMLInputElement;
                                                nextInput?.focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !otp[i] && i > 0) {
                                                const prevInput = (e.target as HTMLInputElement).parentElement?.children[i - 1] as HTMLInputElement;
                                                prevInput?.focus();
                                            }
                                        }}
                                        className="w-14 h-14 rounded-xl border border-[#2f3340] bg-[#1a1f2b] text-white text-xl text-center outline-none focus:border-teal-500"
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            <button className="text-red-400 text-sm hover:underline">Change Mobile number</button>

                            <button
                                onClick={handleConfirmOtp}
                                disabled={loadingOtp}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {loadingOtp ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    "CONFIRM"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* UPI Payment Popup */}
            {showUpiPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Payment Details</h2>
                            <button
                                onClick={() => setShowUpiPopup(false)}
                                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-900 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-400">Product:</span>
                                    <span className="font-semibold">{selectedProduct?.name}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-400">Quantity:</span>
                                    <span className="font-semibold">{quantity}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                                    <span className="text-sm text-gray-400">Total Amount:</span>
                                    <span className="text-xl font-bold text-teal-500">
                                        ₹{(parseFloat(selectedProduct?.price.replace("₹", "") || "0") * quantity).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Enter UPI ID</label>
                                <input
                                    type="text"
                                    placeholder="example@upi"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-teal-500 transition-colors"
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter your UPI ID to complete the payment</p>
                            </div>

                            <button
                                onClick={handleUpiSubmit}
                                disabled={loadingPay}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {loadingPay ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    "Pay Now"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View All Sidebar Panel */}
            {showViewAll && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/60 z-40"
                        onClick={() => setShowViewAll(false)}
                    />

                    {/* Sidebar Panel */}
                    <div className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-[#1a1a1a] z-50 overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-[#2a2a2a] border-b border-gray-700 px-4 py-3 flex items-center justify-between">
                            <h3 className="text-sm text-gray-400">Total Products: <span className="text-white font-semibold">{products.length}</span></h3>
                            <button
                                onClick={() => setShowViewAll(false)}
                                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-2 gap-3 p-4">
                            {products.map((product, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleProductClick(product)}
                                    className="bg-white text-black rounded-lg p-3 border-2 border-gray-200 hover:border-teal-500 transition-all cursor-pointer"
                                >
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-24 object-contain rounded-lg mb-2"
                                        />
                                    ) : (
                                        <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-2 flex items-center justify-center">
                                            <div className="grid grid-cols-3 gap-1">
                                                {[...Array(15)].map((_, i) => (
                                                    <div key={i} className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <h4 className="font-semibold text-xs mb-1 truncate">{product.name}</h4>
                                    <p className="text-[10px] text-gray-600 mb-1 truncate">{product.company}</p>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className="text-red-600 font-bold text-sm">{product.price}</span>
                                        <span className="text-gray-400 line-through text-[10px]">{product.originalPrice}</span>
                                    </div>
                                    <p className="text-green-600 text-[10px] font-semibold mb-1">{product.discount}</p>
                                    <p className="text-[9px] text-gray-500 truncate">{product.quantity}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
