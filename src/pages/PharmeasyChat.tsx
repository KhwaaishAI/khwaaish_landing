import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import HomeSidebar from "../components/home/HomeSidebar";
import HomeChatBar from "../components/home/HomeChatBar";

interface Message {
    text: string;
    sender: "user" | "ai";
    type?: "text" | "button" | "medicines";
    action?: () => void;
    medicines?: Array<{
        name: string;
        price: string;
        offerPrice: string;
        quantity: string;
        manufacturer: string;
        discount: string;
        image: string;
    }>;
}

export default function PharmeasyChat() {
    const location = useLocation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userName, setUserName] = useState("Guest");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const hasInitialized = useRef(false);

    const [step, setStep] = useState(0); // 0: None, 1: Details, 2: OTP, 3: Address, 4: Payment
    const [orderData, setOrderData] = useState({
        location: "",
        mobile: "",
        otp: ["", "", "", ""],
        selectedProduct: null as { name: string; price: string; offerPrice?: string } | null,
        address: "",
        houseNumber: "",
        streetName: "",
        landmark: "",
        pincode: "",
        city: "",
        paymentMethod: "",
        upiUsername: "",
        upiExtension: "",
    });
    const [toast, setToast] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (hasInitialized.current) return;

        if (location.state) {
            hasInitialized.current = true;
            if (location.state.initialMessage) {
                setMessages([{ text: location.state.initialMessage, sender: "user" }]);
                // Simulate AI response with button
                setTimeout(() => {
                    setMessages((prev) => [
                        ...prev,
                        {
                            text: "Please provide the delivery location and mobile number for the order to proceed.",
                            sender: "ai",
                            type: "text",
                        },
                        {
                            text: "Enter Details",
                            sender: "ai",
                            type: "button",
                            action: () => setStep(1),
                        },
                    ]);
                }, 1000);
            }
            if (location.state.userName) {
                setUserName(location.state.userName);
            }
        }
    }, [location.state]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (text: string) => {
        setMessages((prev) => [...prev, { text, sender: "user" }]);
        // Simulate AI response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { text: "I'm checking the availability...", sender: "ai" },
            ]);
        }, 1000);
    };

    const renderStepContent = () => {
        const containerClasses = "relative bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-[500px] space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300";
        const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:bg-white/10 focus:border-white/30 transition-all";
        const buttonClasses = "w-full bg-[#EF4444] text-white font-bold py-3 rounded-xl hover:bg-[#DC2626] transition-colors shadow-lg shadow-red-900/20";
        const titleClasses = "text-xl font-bold text-white tracking-tight";

        switch (step) {
            case 1: // Enter Details (Location + Mobile)
                return (
                    <div className={containerClasses}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className={titleClasses}>Booking Details</h3>
                            <button
                                onClick={() => setStep(0)}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="border-b border-white/10 pb-4 mb-4">
                            <label className="text-xs text-white/60 uppercase tracking-wider font-medium block mb-2">Location on Map</label>
                            <div className="w-full h-32 rounded-xl overflow-hidden border border-white/10 relative group">
                                <img
                                    src="https://media.wired.com/photos/59269cd37034dc5f91bec0f1/master/pass/GoogleMapTA.jpg"
                                    alt="Map Placeholder"
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-[#EF4444]/20 p-2 rounded-full backdrop-blur-sm border border-[#EF4444]/50">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF4444" className="w-6 h-6">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-white/60 uppercase tracking-wider font-medium block mb-1">Delivery Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter location"
                                    className={inputClasses}
                                    value={orderData.location}
                                    onChange={(e) => setOrderData({ ...orderData, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-white/60 uppercase tracking-wider font-medium block mb-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    placeholder="Enter mobile number"
                                    className={inputClasses}
                                    value={orderData.mobile}
                                    onChange={(e) => setOrderData({ ...orderData, mobile: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (orderData.location && orderData.mobile) {
                                    setStep(2);
                                    showToast("OTP has been sent to your mobile number");
                                }
                            }}
                            className={buttonClasses}
                        >
                            Get OTP
                        </button>
                    </div>
                );

            case 2: // OTP
                return (
                    <div className={containerClasses}>
                        <div className="flex items-center gap-4 mb-2 border-b border-white/10 pb-4">
                            <button
                                onClick={() => setStep(1)}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                            </button>
                            <h3 className={titleClasses}>Verify OTP</h3>
                        </div>
                        <p className="text-sm text-white/60 -mt-2">Enter the 4-digit code sent to {orderData.mobile}</p>
                        <div className="flex justify-center gap-4 my-4">
                            {[0, 1, 2, 3].map((index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-bold text-white outline-none focus:bg-white/10 focus:border-white/30 transition-all"
                                    value={orderData.otp[index]}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (!/^\d*$/.test(val)) return;

                                        const newOtp = [...orderData.otp];
                                        newOtp[index] = val;
                                        setOrderData({ ...orderData, otp: newOtp });

                                        if (val && index < 3) {
                                            const nextInput = document.getElementById(`otp-${index + 1}`);
                                            nextInput?.focus();
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Backspace" && !orderData.otp[index] && index > 0) {
                                            const prevInput = document.getElementById(`otp-${index - 1}`);
                                            prevInput?.focus();
                                        }
                                    }}
                                    id={`otp-${index}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                if (orderData.otp.every(digit => digit !== "")) {
                                    setStep(0);
                                    setMessages(prev => [
                                        ...prev,
                                        {
                                            text: "Select your product",
                                            sender: "ai",
                                            type: "medicines",
                                            medicines: [
                                                {
                                                    name: "Dolo 650mg",
                                                    price: "₹30",
                                                    offerPrice: "₹25.50",
                                                    quantity: "15 Tablets",
                                                    manufacturer: "Micro Labs Ltd",
                                                    discount: "15% OFF",
                                                    image: "https://cdn01.pharmeasy.in/dam/products_otc/I00667/dolo-650mg-strip-of-15-tablets-2-1671741086.jpg"
                                                },
                                                {
                                                    name: "Pan 40mg",
                                                    price: "₹120",
                                                    offerPrice: "₹108",
                                                    quantity: "15 Tablets",
                                                    manufacturer: "Alkem Laboratories",
                                                    discount: "10% OFF",
                                                    image: "https://cdn01.pharmeasy.in/dam/products_otc/000000/pan-40mg-tablet-15s-2-1671741400.jpg"
                                                },
                                                {
                                                    name: "Shelcal 500mg",
                                                    price: "₹110",
                                                    offerPrice: "₹104.50",
                                                    quantity: "15 Tablets",
                                                    manufacturer: "Torrent Pharma",
                                                    discount: "5% OFF",
                                                    image: "https://cdn01.pharmeasy.in/dam/products_otc/159115/shelcal-500mg-strip-of-15-tablets-2-1671740900.jpg"
                                                }
                                            ]
                                        }
                                    ]);
                                }
                            }}
                            className={buttonClasses}
                        >
                            Verify & Proceed
                        </button>
                    </div>
                );

            case 3: // Confirm Address
                return (
                    <div className="relative bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 w-[500px] space-y-4 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-4 mb-2 border-b border-white/10 pb-4">
                            <button
                                onClick={() => setStep(0)}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                            <h3 className={titleClasses}>Confirm Address</h3>
                        </div>

                        <div className="border-b border-white/10 pb-4 mb-4">
                            <div className="w-full h-32 rounded-xl overflow-hidden border border-white/10 relative group">
                                <img
                                    src="https://media.wired.com/photos/59269cd37034dc5f91bec0f1/master/pass/GoogleMapTA.jpg"
                                    alt="Map Placeholder"
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-[#EF4444]/20 p-2 rounded-full backdrop-blur-sm border border-[#EF4444]/50">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF4444" className="w-6 h-6">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            <div>
                                <label className="text-xs text-white/60 uppercase tracking-wider font-medium block mb-1">House No. / Flat No.</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 101, Galaxy Apartments"
                                    className={inputClasses}
                                    value={orderData.houseNumber}
                                    onChange={(e) => setOrderData({ ...orderData, houseNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-white/60 uppercase tracking-wider font-medium block mb-1">Street Name / Area</label>
                                <input
                                    type="text"
                                    placeholder="e.g. MG Road, Indiranagar"
                                    className={inputClasses}
                                    value={orderData.streetName}
                                    onChange={(e) => setOrderData({ ...orderData, streetName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-white/60 uppercase tracking-wider font-medium block mb-1">Landmark</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Near Metro Station"
                                    className={inputClasses}
                                    value={orderData.landmark}
                                    onChange={(e) => setOrderData({ ...orderData, landmark: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-white/60 uppercase tracking-wider font-medium block mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 560038"
                                        className={inputClasses}
                                        value={orderData.pincode}
                                        onChange={(e) => setOrderData({ ...orderData, pincode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-white/60 uppercase tracking-wider font-medium block mb-1">City</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Bangalore"
                                        className={inputClasses}
                                        value={orderData.city}
                                        onChange={(e) => setOrderData({ ...orderData, city: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (orderData.houseNumber && orderData.streetName && orderData.pincode && orderData.city) {
                                    setStep(4);
                                } else {
                                    showToast("Please fill in all required fields");
                                }
                            }}
                            className={buttonClasses}
                        >
                            Proceed to Payment
                        </button>
                    </div>
                );

            case 4: // Payment
                const paymentMethods = [
                    { name: 'Google Pay', icon: '/icons_payments/icons8-google-pay-48.png', handles: ['@oksbi', '@okyes'] },
                    { name: 'PhonePe', icon: '/icons_payments/icons8-phone-pe-48.png', handles: ['@ybl', '@ibl', '@axl'] },
                    { name: 'Other UPI', icon: null } // Generic UPI
                ];

                return (
                    <div className={containerClasses}>
                        <div className="flex items-center gap-4 mb-2 border-b border-white/10 pb-4">
                            <button
                                onClick={() => setStep(3)}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                            </button>
                            <h3 className={titleClasses}>Pay with UPI</h3>
                        </div>

                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div key={method.name} className="overflow-hidden rounded-xl bg-white/5 border border-white/10 transition-all">
                                    <button
                                        onClick={() => setOrderData({
                                            ...orderData,
                                            paymentMethod: method.name,
                                            upiExtension: method.handles ? method.handles[0] : '' // Set default extension if available
                                        })}
                                        className={`w-full flex items-center justify-between p-4 hover:bg-white/10 transition-all group text-left ${orderData.paymentMethod === method.name ? 'bg-white/10 border-b border-white/10' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {method.icon ? (
                                                <img src={method.icon} alt={method.name} className="w-8 h-8 object-contain" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                                                        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                                        <line x1="2" y1="10" x2="22" y2="10"></line>
                                                    </svg>
                                                </div>
                                            )}
                                            <span className={`font-medium transition-colors text-white`}>{method.name}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${orderData.paymentMethod === method.name ? 'bg-[#EF4444]' : 'border border-white/40'}`}>
                                            {orderData.paymentMethod === method.name && <FaCheck className="w-3 h-3 text-white" />}
                                        </div>
                                    </button>

                                    {orderData.paymentMethod === method.name && (
                                        <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                            {method.handles ? (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter UPI ID"
                                                            className={inputClasses}
                                                            value={orderData.upiUsername}
                                                            onChange={(e) => setOrderData({ ...orderData, upiUsername: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="relative">
                                                            <select
                                                                className={inputClasses + " appearance-none cursor-pointer pr-10"}
                                                                value={orderData.upiExtension}
                                                                onChange={(e) => setOrderData({ ...orderData, upiExtension: e.target.value })}
                                                            >
                                                                {method.handles.map(handle => (
                                                                    <option key={handle} value={handle} className="bg-[#1A1A1A] text-white">
                                                                        {handle}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none w-3 h-3" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter full UPI ID (e.g. user@upi)"
                                                        className={inputClasses}
                                                        value={orderData.upiUsername}
                                                        onChange={(e) => setOrderData({ ...orderData, upiUsername: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (orderData.upiUsername) {
                                                        setStep(0);
                                                        setMessages(prev => [
                                                            ...prev,
                                                            {
                                                                text: `Order placed successfully via ${method.name}! Your medicines will be delivered to ${orderData.houseNumber}, ${orderData.streetName}.`,
                                                                sender: "ai"
                                                            }
                                                        ]);
                                                        showToast("Order Placed Successfully! 🎉");
                                                    } else {
                                                        showToast("Please enter payment details");
                                                    }
                                                }}
                                                className={buttonClasses}
                                            >
                                                Pay {orderData.selectedProduct?.offerPrice || orderData.selectedProduct?.price}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen w-screen flex bg-black text-white">
            <div className="hidden md:block h-full">
                <HomeSidebar userName={userName} />
            </div>

            <main className="flex-1 relative flex flex-col bg-black">
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        <img src="/icons/pharmeasy.jpeg" alt="Pharmeasy" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold">Pharmeasy Support</span>
                </div>

                <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto px-4 py-6">
                        <div className="max-w-3xl mx-auto space-y-6 w-full">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {msg.type === "button" ? (
                                        <button
                                            onClick={msg.action}
                                            className="bg-[#EF4444] text-white px-6 py-2 rounded-full font-medium hover:bg-[#DC2626] transition"
                                        >
                                            {msg.text}
                                        </button>
                                    ) : msg.type === "medicines" && msg.medicines ? (
                                        <div className="space-y-2">
                                            <div className="bg-transparent text-white/90 px-4 py-2 mb-2">
                                                {msg.text}
                                            </div>
                                            <div className="space-y-4 w-full">
                                                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x no-scrollbar">
                                                    {msg.medicines.map((med, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => {
                                                                setOrderData(prev => ({ ...prev, selectedProduct: med }));
                                                                setStep(3); // Go to Confirm Address
                                                            }}
                                                            className="min-w-[200px] snap-center group bg-[#1A1A1A] rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all overflow-hidden"
                                                        >
                                                            <div className="h-32 w-full bg-white p-4 flex items-center justify-center relative">
                                                                <img src={med.image} alt={med.name} className="h-full object-contain" />
                                                                <div className="absolute top-2 right-2 bg-[#EF4444] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                                                    {med.discount}
                                                                </div>
                                                            </div>
                                                            <div className="p-4 space-y-2">
                                                                <div>
                                                                    <h4 className="font-bold text-white text-lg">{med.name}</h4>
                                                                    <p className="text-xs text-white/50">{med.manufacturer}</p>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                                                        {med.quantity}
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-xs text-white/40 line-through">{med.price}</div>
                                                                        <div className="text-lg font-bold text-[#EF4444]">{med.offerPrice}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => setShowSidebar(true)}
                                                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    View All Medicines
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                                        <polyline points="9 18 15 12 9 6"></polyline>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === "user"
                                                ? "bg-[#2F2F2F] text-white"
                                                : "bg-transparent text-white/90"
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Workflow Overlay */}
                    {step > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                            {renderStepContent()}
                        </div>
                    )}

                    {/* Toast Notification */}
                    {toast && (
                        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-full shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 z-50 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium">{toast}</span>
                        </div>
                    )}

                    <div className="pb-6">
                        <div className="max-w-3xl mx-auto w-full">
                            <HomeChatBar
                                placeholder="Message Pharmeasy..."
                                onSendMessage={handleSendMessage}
                                selectedCompany="Pharmeasy"
                            />
                        </div>
                    </div>

                    {/* Right Sidebar for All Medicines */}
                    <div
                        className={`absolute inset-y-0 right-0 w-[400px] bg-[#111] border-l border-white/10 transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1A1A1A]">
                            <h3 className="text-lg font-bold text-white">All Medicines</h3>
                            <button
                                onClick={() => setShowSidebar(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Reusing the mock data for demonstration, normally this would be a full list */}
                            {[
                                {
                                    name: "Dolo 650mg",
                                    price: "₹30",
                                    offerPrice: "₹25.50",
                                    quantity: "15 Tablets",
                                    manufacturer: "Micro Labs Ltd",
                                    discount: "15% OFF",
                                    image: "https://cdn01.pharmeasy.in/dam/products_otc/I00667/dolo-650mg-strip-of-15-tablets-2-1671741086.jpg"
                                },
                                {
                                    name: "Pan 40mg",
                                    price: "₹120",
                                    offerPrice: "₹108",
                                    quantity: "15 Tablets",
                                    manufacturer: "Alkem Laboratories",
                                    discount: "10% OFF",
                                    image: "https://cdn01.pharmeasy.in/dam/products_otc/000000/pan-40mg-tablet-15s-2-1671741400.jpg"
                                },
                                {
                                    name: "Shelcal 500mg",
                                    price: "₹110",
                                    offerPrice: "₹104.50",
                                    quantity: "15 Tablets",
                                    manufacturer: "Torrent Pharma",
                                    discount: "5% OFF",
                                    image: "https://cdn01.pharmeasy.in/dam/products_otc/159115/shelcal-500mg-strip-of-15-tablets-2-1671740900.jpg"
                                },
                                {
                                    name: "Crocin 650mg",
                                    price: "₹35",
                                    offerPrice: "₹31.50",
                                    quantity: "15 Tablets",
                                    manufacturer: "GSK",
                                    discount: "10% OFF",
                                    image: "https://cdn01.pharmeasy.in/dam/products_otc/000000/crocin-650mg-tablet-15s-2-1671741400.jpg"
                                },
                                {
                                    name: "Zincovit",
                                    price: "₹150",
                                    offerPrice: "₹135",
                                    quantity: "15 Tablets",
                                    manufacturer: "Apex",
                                    discount: "10% OFF",
                                    image: "https://cdn01.pharmeasy.in/dam/products_otc/183157/zincovit-tablet-strip-of-15-2-1671741400.jpg"
                                }
                            ].map((med, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setOrderData(prev => ({ ...prev, selectedProduct: med }));
                                        setStep(3); // Go to Confirm Address
                                        setShowSidebar(false);
                                    }}
                                    className="group bg-[#1A1A1A] rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all overflow-hidden"
                                >
                                    <div className="h-32 w-full bg-white p-4 flex items-center justify-center relative">
                                        <img src={med.image} alt={med.name} className="h-full object-contain" />
                                        <div className="absolute top-2 right-2 bg-[#EF4444] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                            {med.discount}
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{med.name}</h4>
                                            <p className="text-xs text-white/50">{med.manufacturer}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                                {med.quantity}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-white/40 line-through">{med.price}</div>
                                                <div className="text-lg font-bold text-[#EF4444]">{med.offerPrice}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
