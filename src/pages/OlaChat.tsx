import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import HomeSidebar from "../components/home/HomeSidebar";
import HomeChatBar from "../components/home/HomeChatBar";

interface Message {
    text: string;
    sender: "user" | "ai";
    type?: "text" | "button" | "rides";
    action?: () => void;
    rides?: Array<{ name: string; price: string; time: string; icon: string }>;
}

export default function OlaChat() {
    const location = useLocation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userName, setUserName] = useState("Guest"); // Default or from state
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const hasInitialized = useRef(false);

    // Workflow State
    const [step, setStep] = useState(0); // 0: None, 1: Ride, 2: Auth, 3: Results
    const [bookingData, setBookingData] = useState({
        location: "", // Kept for type compatibility but unused
        pickup: "",
        drop: "",
        mobile: "",
        otp: "",
    });
    const [toast, setToast] = useState<string | null>(null);

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
                            text: "Add Location",
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
                { text: "I'm checking the status of your request...", sender: "ai" },
            ]);
        }, 1000);
    };

    const renderStepContent = () => {
        const containerClasses = "relative bg-[#1A1A1A] backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-[500px] space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300";
        const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:bg-white/10 focus:border-white/30 transition-all";
        const buttonClasses = "w-full bg-[#EF4444] text-white font-bold py-3 rounded-xl hover:bg-[#DC2626] transition-colors shadow-lg shadow-red-900/20";
        const titleClasses = "text-xl font-bold text-white tracking-tight";

        switch (step) {
            case 1: // Ride Plan
                return (
                    <div className={containerClasses}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className={titleClasses}>Plan Your Ride</h3>
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

                        <div className="relative border border-white/10 rounded-xl bg-white/5 overflow-hidden">
                            {/* Dotted Line */}
                            <div className="absolute left-[1.5rem] top-12 bottom-12 w-0.5 border-l-2 border-dashed border-white/20 pointer-events-none"></div>

                            {/* Pickup Input */}
                            <div className="p-4 border-b border-white/10 flex items-start gap-4">
                                <div className="mt-8 w-4 h-4 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] shrink-0 z-10"></div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs text-white/60 uppercase tracking-wider font-medium">Enter Pickup location</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            placeholder="Current Location"
                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 outline-none font-medium focus:border-white/30 transition-all"
                                            value={bookingData.pickup}
                                            onChange={(e) => setBookingData({ ...bookingData, pickup: e.target.value })}
                                        />
                                        <button className="p-2 border border-white/10 rounded-lg bg-black/20 text-white/40 hover:text-white transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Drop Input */}
                            <div className="p-4 flex items-start gap-4">
                                <div className="mt-8 w-4 h-4 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0 z-10"></div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs text-white/60 uppercase tracking-wider font-medium">Drop location</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            placeholder="Search Destination"
                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 outline-none font-medium focus:border-white/30 transition-all"
                                            value={bookingData.drop}
                                            onChange={(e) => setBookingData({ ...bookingData, drop: e.target.value })}
                                        />
                                        <button className="p-2 border border-white/10 rounded-lg bg-black/20 text-white/40 hover:text-white transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => bookingData.pickup && bookingData.drop && setStep(2)}
                            className={buttonClasses}
                        >
                            Continue
                        </button>
                    </div>
                );
            case 2: // Auth
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
                            <h3 className={titleClasses}>Sign in with your ola</h3>
                        </div>
                        <p className="text-sm text-white/60 -mt-2">Mobile number</p>
                        <input
                            type="tel"
                            placeholder="Enter your mobile number"
                            className={inputClasses}
                            value={bookingData.mobile}
                            onChange={(e) => setBookingData({ ...bookingData, mobile: e.target.value })}
                        />
                        <button
                            onClick={() => {
                                if (bookingData.mobile) {
                                    setStep(3);
                                    showToast("OTP has been sent to your mobile number");
                                }
                            }}
                            className={buttonClasses}
                        >
                            Get OTP
                        </button>
                    </div>
                );

            case 3: // OTP
                return (
                    <div className={containerClasses}>
                        <div className="flex items-center gap-4 mb-2 border-b border-white/10 pb-4">
                            <button
                                onClick={() => setStep(2)}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                            </button>
                            <h3 className={titleClasses}>Verify OTP</h3>
                        </div>
                        <p className="text-sm text-white/60 -mt-2">Enter the 4-digit code sent to {bookingData.mobile}</p>
                        <div className="flex justify-center gap-4 my-4">
                            {[0, 1, 2, 3].map((index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-bold text-white outline-none focus:bg-white/10 focus:border-white/30 transition-all"
                                    value={bookingData.otp[index] || ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (!/^\d*$/.test(val)) return;

                                        const newOtp = bookingData.otp.split("");
                                        newOtp[index] = val;
                                        const newOtpStr = newOtp.join("");
                                        setBookingData({ ...bookingData, otp: newOtpStr });

                                        if (val && index < 3) {
                                            const nextInput = document.getElementById(`otp-${index + 1}`);
                                            nextInput?.focus();
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Backspace" && !bookingData.otp[index] && index > 0) {
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
                                if (bookingData.otp.length === 4) {
                                    setStep(0);
                                    setMessages(prev => [
                                        ...prev,
                                        {
                                            text: "Here are the available rides for your route:",
                                            sender: "ai",
                                            type: "rides",
                                            rides: [
                                                { name: "Mini", price: "₹240", time: "4 min", icon: "🚗" },
                                                { name: "Prime Sedan", price: "₹310", time: "6 min", icon: "🚙" },
                                                { name: "Prime SUV", price: "₹450", time: "8 min", icon: "🚐" },
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
                {/* Ola Specific Header or Branding could go here */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        <img src="/icons/ola.jpeg" alt="Ola" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold">Ola Support</span>
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
                                            className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition"
                                        >
                                            {msg.text}
                                        </button>
                                    ) : msg.type === "rides" && msg.rides ? (
                                        <div className="space-y-2">
                                            <div className="bg-transparent text-white/90 px-4 py-2 mb-2">
                                                {msg.text}
                                            </div>
                                            <div className="space-y-3 w-[320px]">
                                                {msg.rides.map((ride, idx) => (
                                                    <div key={idx} className="group flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-2xl">{ride.icon}</span>
                                                            <div>
                                                                <div className="font-semibold text-white">{ride.name}</div>
                                                                <div className="text-xs text-white/50">{ride.time} away</div>
                                                            </div>
                                                        </div>
                                                        <div className="font-bold text-white">{ride.price}</div>
                                                    </div>
                                                ))}
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
                                placeholder="Message Ola..."
                                onSendMessage={handleSendMessage}
                                selectedCompany="Ola"
                            // No onSelectCompany here as we are fixed in Ola context
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
