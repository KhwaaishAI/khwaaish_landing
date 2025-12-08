import { useState } from "react";
import VoiceRecorderButton from "../components/VoiceRecorderButton";

const API_BASE_URL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;

interface Ride {
    name: string;
    price: string;
}

const getRideImage = (name: string) => {
    const key = name.toLowerCase();
    if (key.includes("auto")) return "/ola/auto.png";
    if (key.includes("mini")) return "/ola/mini.png";
    if (key.includes("bike")) return "/ola/bike.png";
    if (key.includes("prime suv")) return "/ola/prime-suv.png";
    if (key.includes("prime sedan")) return "/ola/prime-sedan.png";
    return "/ola/default.png";
};

export default function Ola() {
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [showRides, setShowRides] = useState(false);

    const [pickupLocation, setPickupLocation] = useState("");
    const [dropLocation, setDropLocation] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");

    const [sessionId, setSessionId] = useState("");
    const [rides, setRides] = useState<Ride[]>([]);
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [loadingOtp, setLoadingOtp] = useState(false);
    const [loadingRides, setLoadingRides] = useState(false);
    const [bookingRide, setBookingRide] = useState<string | null>(null);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bottomInput, setBottomInput] = useState("");

    const handleAddLocation = () => {
        setShowLocationPopup(true);
    };

    const handleContinueLocation = () => {
        setShowLocationPopup(false);
        setShowLoginPopup(true);
    };

    const handleConfirmMobile = async () => {
        if (!mobileNumber || mobileNumber.length !== 10) {
            alert("Please enter a valid 10-digit mobile number");
            return;
        }

        setLoadingLogin(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/ola/location-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pickup_location: pickupLocation,
                    destination_location: dropLocation,
                    phone_number: mobileNumber,
                }),
            });

            // Store initial session id from login response if provided
            try {
                const data = await response.json();
                if (data.session_id) {
                    setSessionId(String(data.session_id));
                }
            } catch (e) {
                console.log("Could not parse login response", e);
            }

            // Backend sends OTP - move to next screen
            setShowLoginPopup(false);
            setShowOtpPopup(true);

        } catch (error) {
            console.error("Login error:", error);
            alert("Failed to connect to server. Please try again.");
        } finally {
            setLoadingLogin(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!otp || otp.length !== 4) {
            alert("Please enter a valid 4-digit OTP");
            return;
        }

        if (!sessionId) {
            alert("Session missing. Please enter your mobile again.");
            return;
        }

        setLoadingOtp(true);
        setLoadingRides(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/ola/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    otp: otp,
                }),
            });

            try {
                const data = await response.json();
                if (data.session_id) {
                    setSessionId(data.session_id);
                }
                // Use real rides from backend: { name, price }
                if (Array.isArray(data.rides)) {
                    setRides(
                        data.rides.map((r: any) => ({
                            name: String(r.name ?? ""),
                            price: String(r.price ?? ""),
                        }))
                    );
                }
            } catch (e) {
                console.log("Could not parse response", e);
            }

            setShowOtpPopup(false);
            setShowRides(true);
            setLoadingRides(false);

        } catch (error) {
            console.error("OTP verification error:", error);
            alert("Failed to verify OTP. Please try again.");
            setLoadingRides(false);
        } finally {
            setLoadingOtp(false);
        }
    };

    const handleBookRide = async (rideName: string) => {
        if (!sessionId) {
            alert("Session expired. Please start over.");
            return;
        }

        setBookingRide(rideName);
        try {
            await fetch(`${API_BASE_URL}/api/ola/book`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    ride_name: rideName,
                }),
            });

            alert(`Successfully booked ${rideName}!`);
        } catch (error) {
            console.error("Booking error:", error);
            alert("Failed to book ride. Please try again.");
        } finally {
            setBookingRide(null);
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
                        className="inline-flex items-center justify-center rounded-lg p-1 hover:bg-gray-900"
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
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-sm font-semibold">
                            E
                        </div>
                        <span className="text-sm">Emma Stone</span>
                    </div>
                    <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors">
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
                    </div>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {/* User Message */}
                        <div className="flex justify-end">
                            <div className="bg-gray-800 rounded-2xl rounded-tr-none px-4 py-2 max-w-md">
                                {/* <p className="text-sm">book a ride for me from chinchwad station</p> */}
                            </div>
                        </div>

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
                                    <p className="text-sm mb-3">To proceed further, login to ola.</p>

                                    {!showRides && (
                                        <button
                                            onClick={handleAddLocation}
                                            className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-full text-white font-medium transition-colors"
                                        >
                                            Add loction
                                        </button>
                                    )}

                                    {showRides && (
                                        <div className="space-y-3 mt-4">
                                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>Pickup & drop location confirmed</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>Rides found</span>
                                            </div>

                                            <h3 className="text-lg font-semibold mt-4">Available rides</h3>

                                            {/* Skeleton Loaders */}
                                            {loadingRides && (
                                                <>
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800 animate-pulse">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                                                                <div>
                                                                    <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
                                                                    <div className="h-3 w-32 bg-gray-700 rounded"></div>
                                                                </div>
                                                            </div>
                                                            <div className="h-9 w-16 bg-gray-700 rounded-lg"></div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}

                                            {/* Actual Rides */}
                                            {!loadingRides && rides.map((ride) => (
                                                <div key={ride.name} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-blue-500 flex items-center justify-center">
                                                            <img
                                                                src={getRideImage(ride.name)}
                                                                alt={ride.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">{ride.name}</h4>
                                                            <p className="text-xs text-gray-400">{ride.price || "Price not available"}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleBookRide(ride.name)}
                                                        disabled={bookingRide === ride.name}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        {bookingRide === ride.name ? (
                                                            <>
                                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                <span>Booking...</span>
                                                            </>
                                                        ) : (
                                                            "Book"
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Area - Fixed to bottom */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-black z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 bg-gray-900 rounded-full px-4 py-3">
                            <input
                                type="text"
                                placeholder="What is your Khwaaish?"
                                className="flex-1 bg-transparent outline-none text-sm"
                                value={bottomInput}
                                onChange={(e) => setBottomInput(e.target.value)}
                            />
                            <VoiceRecorderButton
                                onTextReady={(text) =>
                                    setBottomInput((prev) => (prev ? `${prev} ${text}` : text))
                                }
                            />
                            <button className="p-2 bg-white/15 hover:bg-white/25 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 12h14M12 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                />
            )}

            {/* Location Popup */}
            {showLocationPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Plan your ride</h2>
                            <button
                                onClick={() => setShowLocationPopup(false)}
                                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Pickup Location */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Enter Pickup location</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full"></div>
                                    <input
                                        type="text"
                                        placeholder="e.g., Beach road"
                                        value={pickupLocation}
                                        onChange={(e) => setPickupLocation(e.target.value)}
                                        className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg pl-8 pr-10 py-3 outline-none focus:border-gray-600 transition-colors"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Drop Location */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Drop location</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
                                    <input
                                        type="text"
                                        placeholder="e.g., Beach road"
                                        value={dropLocation}
                                        onChange={(e) => setDropLocation(e.target.value)}
                                        className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg pl-8 pr-10 py-3 outline-none focus:border-gray-600 transition-colors"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleContinueLocation}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-full text-white font-medium transition-colors mt-6"
                            >
                                CONTINUE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Popup */}
            {showLoginPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={() => setShowLoginPopup(false)}
                                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-semibold">Sign in with your ola</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Mobile number</label>
                                <input
                                    type="tel"
                                    placeholder="Enter your mobile"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    maxLength={10}
                                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-gray-600 transition-colors"
                                />
                            </div>

                            <button
                                onClick={handleConfirmMobile}
                                disabled={loadingLogin}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {loadingLogin ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    "Confirm"
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
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-yellow-500 rounded-md flex items-center justify-center">
                                    <span className="text-xs font-bold text-black">O</span>
                                </div>
                                <span className="font-semibold">OLA</span>
                            </div>

                            <p className="text-sm text-gray-400 mb-3">Enter the 4-digit OTP from Ola</p>

                            {/* OTP Boxes */}
                            <div className="flex gap-3 mb-4">
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
                                        className="w-12 h-12 rounded-xl border border-[#2f3340] bg-[#1a1f2b] text-white text-xl text-center outline-none focus:border-yellow-500"
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            <p className="text-green-400 text-xs mb-4">OTP verified successfully</p>

                            <button
                                onClick={handlePlaceOrder}
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
                                    "verify otp"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
