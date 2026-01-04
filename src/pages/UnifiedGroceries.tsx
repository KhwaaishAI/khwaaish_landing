import React, { useState } from "react";
const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";

interface Message {
    id: string;
    role: "user" | "system";
    content: string;
}

export default function UnifiedGroceries() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // Cart + UI state
    const [selectedPlatformByGroup, setSelectedPlatformByGroup] = useState<Record<string, "zepto" | "instamart">>({});
    const [addingCartKey, setAddingCartKey] = useState<string | null>(null);
    const [addingCartPlatform, setAddingCartPlatform] = useState<"zepto" | "instamart" | null>(null);
    const [expandedPlatform, setExpandedPlatform] = useState<"zepto" | "instamart" | null>(null);

    // Login popup
    const [showLoginPopup, setShowLoginPopup] = useState(true);
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [loadingLogin, setLoadingLogin] = useState(false);

    // OTP popup with separate inputs for each platform
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [zeptoOtp, setZeptoOtp] = useState("");
    const [instamartOtp, setInstamartOtp] = useState("");
    const [zeptoOtpVerified, setZeptoOtpVerified] = useState(false);
    const [instamartOtpVerified, setInstamartOtpVerified] = useState(false);

    // Session IDs
    const [zeptoSessionId, setZeptoSessionId] = useState("");
    const [instamartSessionId, setInstamartSessionId] = useState("");

    // Verification loading states
    const [isVerifyingZepto, setIsVerifyingZepto] = useState(false);
    const [isVerifyingInstamart, setIsVerifyingInstamart] = useState(false);

    // Landing Page State
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const pushSystem = (text: string) =>
        setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "system", content: text },
        ]);

    const pushUser = (text: string) =>
        setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "user", content: text },
        ]);

    // Unified login - calls both platforms simultaneously
    const handleUnifiedLogin = async () => {
        console.log("UNIFIED LOGIN: Starting for both platforms");

        if (!phone.trim() || !location.trim()) {
            alert("Please enter both phone and location");
            return;
        }

        setLoadingLogin(true);

        try {
            // Call both login APIs simultaneously
            const [zeptoResponse, instamartResponse] = await Promise.all([
                fetch(`${BaseURL}api/zepto/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        mobile_number: phone,
                        location: location,
                    }),
                }),
                fetch(`${BaseURL}api/instamart/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        mobile_number: phone,
                        name: "Khwaaish User",
                        gmail: "user@khwaaish.com",
                        location: location,
                    }),
                }),
            ]);

            const zeptoData = await zeptoResponse.json();
            const instamartData = await instamartResponse.json();

            console.log("Zepto login response:", zeptoData);
            console.log("Instamart login response:", instamartData);

            if (zeptoData.session_id) {
                setZeptoSessionId(zeptoData.session_id);
            }

            if (instamartData.session_id) {
                setInstamartSessionId(instamartData.session_id);
            }

            setShowLoginPopup(false);
            setShowOtpPopup(true);
        } catch (err) {
            console.error("Unified login error:", err);
            alert("Something went wrong during login!");
        } finally {
            setLoadingLogin(false);
        }
    };

    // Verify OTP for Zepto
    const handleZeptoOtpVerify = async () => {
        if (!zeptoOtp.trim()) return;
        setIsVerifyingZepto(true);

        try {
            const response = await fetch(`${BaseURL}api/zepto/enter-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: zeptoSessionId,
                    otp: zeptoOtp,
                }),
            });

            const data = await response.json();
            console.log("Zepto OTP response:", data);

            if (data.status === "success") {
                setZeptoOtpVerified(true);
            } else {
                alert(data.message || "Invalid Zepto OTP");
            }
        } catch (err) {
            console.error("Zepto OTP error:", err);
            alert("Zepto verification failed");
        } finally {
            setIsVerifyingZepto(false);
        }
    };

    // Verify OTP for Instamart
    const handleInstamartOtpVerify = async () => {
        if (!instamartOtp.trim()) return;
        setIsVerifyingInstamart(true);

        try {
            const response = await fetch(`${BaseURL}api/instamart/submit-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: instamartSessionId,
                    otp: instamartOtp,
                }),
            });

            const data = await response.json();
            console.log("Instamart OTP response:", data);

            if (data.status === "success") {
                setInstamartOtpVerified(true);
            } else {
                alert(data.message || "Invalid Instamart OTP");
            }
        } catch (err) {
            console.error("Instamart OTP error:", err);
            alert("Instamart verification failed");
        } finally {
            setIsVerifyingInstamart(false);
        }
    };

    // Place Order button - both OTPs must be verified
    const handlePlaceOrder = () => {
        if (zeptoOtpVerified && instamartOtpVerified) {
            setShowOtpPopup(false);
            setIsLoggedIn(true);
            pushSystem("Both platforms authenticated successfully! How can I help you today?");
        } else {
            alert("Please verify OTP for both platforms");
        }
    };

    // Unified search - calls both platforms simultaneously
    const handleUnifiedSearch = async () => {
        console.log("UNIFIED SEARCH: Starting for both platforms");

        if (!messageInput.trim()) {
            return;
        }

        setShowChat(true);
        pushUser(messageInput);

        const userText = messageInput;
        setMessageInput("");
        setIsLoading(true);

        try {
            // Call both search APIs simultaneously
            const [zeptoResponse, instamartResponse] = await Promise.all([
                fetch(`${BaseURL}api/zepto/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query: userText,
                        max_items: 12,
                    }),
                }),
                fetch(`${BaseURL}api/instamart/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query: userText,
                    }),
                }),
            ]);

            const zeptoData = await zeptoResponse.json();
            const instamartData = await instamartResponse.json();

            console.log("Zepto search response:", zeptoData);
            console.log("Instamart search response:", instamartData);

            // Keep session IDs in sync for add-to-cart flows
            if (zeptoData?.session_id) {
                setZeptoSessionId(zeptoData.session_id);
            }
            if (instamartData?.session_id) {
                setInstamartSessionId(instamartData.session_id);
            }

            // Combine products from both platforms
            const zeptoProducts = (zeptoData.products || []).map((p: any) => ({
                ...p,
                source: "zepto",
            }));

            const instamartProducts = (instamartData.results || []).map((p: any) => ({
                ...p,
                source: "instamart",
            }));

            const combinedProducts = [...zeptoProducts, ...instamartProducts];

            pushSystem(
                JSON.stringify({
                    type: "product_list",
                    products: combinedProducts,
                })
            );
        } catch (err) {
            console.error("Unified search error:", err);
            pushSystem("Something went wrong during search!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCartSingle = async (product: any) => {
        if (!product) return;

        const platform = product.source as "zepto" | "instamart";

        try {
            setAddingCartKey(product.name + platform);
            setAddingCartPlatform(platform);

            if (platform === "zepto") {
                const payload = {
                    product_name: product.name,
                    quantity: 1,
                    upi_id: "string",
                    hold_seconds: 59,
                };

                const res = await fetch(`${BaseURL}api/zepto/add-to-cart`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                console.log("Unified Zepto add-to-cart response:", data);

                if (data?.status === "success") {
                    pushSystem(`Added 1 x ${product.name} to Zepto cart`);
                } else if (data?.status === "error" && data?.message === "Cart is empty.") {
                    pushSystem(`Zepto item "${product.name}" is Out of Stock now!`);
                } else {
                    pushSystem(JSON.stringify(data));
                }
            } else if (platform === "instamart") {
                if (!instamartSessionId) {
                    pushSystem("Please complete Instamart login/OTP before adding to cart.");
                    return;
                }

                const payload = {
                    product_name: product.name,
                    quantity: 1,
                    session_id: instamartSessionId,
                };

                const res = await fetch(`${BaseURL}api/instamart/add-to-cart`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                console.log("Unified Instamart add-to-cart response:", data);

                if (data?.status === "success") {
                    pushSystem(`Added 1 x ${product.name} to Instamart cart`);
                    if (data.session_id) {
                        setInstamartSessionId(data.session_id);
                    }
                } else {
                    pushSystem(
                        data?.message
                            ? `Instamart add-to-cart failed: ${data.message}`
                            : "Something went wrong with Instamart add-to-cart"
                    );
                }
            }
        } catch (err) {
            console.error("Unified add-to-cart error:", err);
            pushSystem("Something went wrong while adding to cart.");
        } finally {
            setAddingCartKey(null);
            setAddingCartPlatform(null);
        }
    };

    const renderMessage = (m: Message) => {
        let parsed: any;

        try {
            parsed = JSON.parse(m.content);
        } catch {
            parsed = m.content;
        }

        let content: React.ReactNode = null;

        if (typeof parsed === "object" && parsed?.type === "product_list") {
            const products = parsed.products || [];
            const zeptoProducts = products.filter((p: any) => p.source === "zepto");
            const instamartProducts = products.filter((p: any) => p.source === "instamart");

            const renderProductCard = (p: any, index: number) => {
                const key = `${p.source}-${p.name}-${index}`;
                const addingKey = `${p.name}${p.source}`;

                return (
                    <div
                        key={key}
                        className="flex flex-col bg-[#11121a] rounded-2xl overflow-hidden shadow-sm hover:bg-[#151622] transition-colors cursor-pointer"
                        onClick={() => handleAddToCartSingle(p)}
                    >
                        {p.image_url && (
                            <div className="relative w-full h-32 bg-gray-900 flex items-center justify-center">
                                <img
                                    src={p.image_url}
                                    alt={p.name}
                                    className="h-full object-contain"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            </div>
                        )}

                        <div className="px-3 py-3 flex-1 flex flex-col gap-1">
                            <p className="text-xs text-gray-400 line-clamp-1">
                                {p.quantity || "Standard pack"}
                            </p>
                            <p className="text-sm font-semibold text-white line-clamp-2 min-h-[2.5rem]">
                                {p.name}
                            </p>
                            <div className="flex items-baseline justify-between mt-1">
                                <span className="text-base font-bold text-white">₹{p.price}</span>
                                {p.original_price && p.original_price !== p.price && (
                                    <span className="text-[11px] text-gray-500 line-through">₹{p.original_price}</span>
                                )}
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.source === "zepto" ? "bg-purple-600/20 text-purple-300" : "bg-orange-500/20 text-orange-300"}`}>
                                    {p.source === "zepto" ? "Zepto" : "Instamart"}
                                </span>
                                <button
                                    type="button"
                                    className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold disabled:opacity-60"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCartSingle(p);
                                    }}
                                    disabled={addingCartKey === addingKey}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                );
            };

            const renderPlatformRow = (platform: "zepto" | "instamart", items: any[]) => {
                if (!items.length) return null;
                const topFive = items.slice(0, 5);
                const titlePrefix = platform === "zepto" ? "Best deals you can grab on Zepto right now" : "Best deals you can grab on Instamart right now";

                return (
                    <div className="space-y-4" key={platform}>
                        <div className="flex items-center gap-2">
                            <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white ${platform === "zepto" ? "bg-purple-600" : "bg-orange-500"}`}
                            >
                                {platform === "zepto" ? "Z" : "I"}
                            </span>
                            <h4 className="text-sm sm:text-base font-semibold text-white">
                                {titlePrefix}
                            </h4>
                        </div>

                        <div className="flex items-stretch gap-3 overflow-x-auto pb-2 hide-scrollbar">
                            {topFive.map(renderProductCard)}

                            {items.length > 5 && (
                                <button
                                    type="button"
                                    onClick={() => setExpandedPlatform(platform)}
                                    className="min-w-[140px] h-full flex flex-col items-center justify-center rounded-2xl border border-gray-700 bg-[#11121a] text-gray-200 hover:border-gray-500 hover:bg-[#181926] transition-colors px-4"
                                >
                                    <div className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center mb-2">
                                        <span className="text-xs font-semibold">{items.length}</span>
                                    </div>
                                    <span className="text-xs font-semibold">View all products</span>
                                </button>
                            )}
                        </div>
                    </div>
                );
            };

            content = (
                <>
                    <div className="space-y-6">
                        <div className="flex flex-col gap-1 mb-2">
                            <h3 className="text-sm font-semibold text-gray-300">
                                Here are some of the best matches we found for you
                            </h3>
                        </div>

                        {renderPlatformRow("zepto", zeptoProducts)}
                        {renderPlatformRow("instamart", instamartProducts)}
                    </div>

                    {expandedPlatform && (
                        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex justify-end">
                            <div className="w-full sm:w-[420px] md:w-[480px] lg:w-[520px] h-full bg-[#050509] border-l border-gray-800 flex flex-col">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedPlatform(null)}
                                        className="flex items-center gap-1 text-sm text-gray-300 hover:text-white"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Back
                                    </button>
                                    <h4 className="text-sm font-semibold text-white">
                                        Products from {expandedPlatform === "zepto" ? "Zepto" : "Instamart"}
                                    </h4>
                                    <div className="w-6" />
                                </div>

                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                                        {(expandedPlatform === "zepto" ? zeptoProducts : instamartProducts).map(
                                            (p: any, index: number) => renderProductCard(p, index)
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
        } else {
            const renderFormatted = (text: string) => {
                return text.split("\n").map((line, i) => {
                    let formatted = line;
                    formatted = formatted.replace(
                        /\*\*(.*?)\*\*/g,
                        "<strong>$1</strong>"
                    );

                    return (
                        <p
                            key={i}
                            className="text-sm sm:text-base leading-relaxed mb-2 last:mb-0"
                            dangerouslySetInnerHTML={{ __html: formatted }}
                        />
                    );
                });
            };

            content = <div className="space-y-2">{renderFormatted(String(parsed))}</div>;
        }

        return typeof parsed === "object" && parsed?.type === "product_list" ? (
            <div key={m.id} className="w-full">
                {content}
            </div>
        ) : (
            <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                    }`}
            >
                <div
                    className={`${m.role === "user"
                        ? "bg-white/15 text-white border-white/20"
                        : "bg-gray-900/80 text-gray-100 border-gray-800"
                        } max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-3 border`}
                >
                    {content}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-screen bg-black text-white">
            {/* Login Popup */}
            {showLoginPopup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <img src="/logo/zepto.jpg" alt="Zepto" className="w-12 h-12 rounded-lg" />
                            <span className="text-2xl">+</span>
                            <img src="/logo/swiggy-instamart.jpg" alt="Swiggy Instamart" className="w-12 h-12 rounded-lg" />
                        </div>

                        <h2 className="text-xl font-semibold text-white text-center">
                            Unified Groceries Login
                        </h2>

                        <input
                            type="text"
                            placeholder="Mobile Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
                        />

                        <input
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
                        />

                        <button
                            onClick={handleUnifiedLogin}
                            disabled={loadingLogin}
                            className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loadingLogin ? <PopupLoader /> : "Login to Both Platforms"}
                        </button>
                    </div>
                </div>
            )}

            {/* OTP Popup */}
            {showOtpPopup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999]">
                    <div className="bg-[#1a1b26] p-8 rounded-3xl w-[500px] border border-gray-700 shadow-2xl relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-orange-500" />

                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white tracking-tight">OTP Verification</h2>
                            <button
                                onClick={() => setShowOtpPopup(false)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Zepto OTP Section */}
                            <div className="space-y-4 p-5 bg-[#14151f] border border-purple-500/20 rounded-2xl relative group focus-within:border-purple-500/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-900/20">
                                            <span className="text-lg font-bold text-white">Z</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Zepto</h3>
                                            <p className="text-xs text-purple-300/60">Enter 4-digit OTP</p>
                                        </div>
                                    </div>
                                    {zeptoOtpVerified && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <span className="text-xs font-medium text-green-400">Verified</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 flex-1">
                                        {[...Array(6)].map((_, i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                maxLength={1}
                                                value={zeptoOtp[i] || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                                    if (!val && e.target.value) return; // Ignore non-numeric

                                                    const newOtp = zeptoOtp.split("");
                                                    newOtp[i] = val;
                                                    const combined = newOtp.join("").slice(0, 6);
                                                    setZeptoOtp(combined);

                                                    if (val && i < 5) {
                                                        const nextInput = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                                                        nextInput?.focus();
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && !zeptoOtp[i] && i > 0) {
                                                        const prevInput = e.currentTarget.parentElement?.children[i - 1] as HTMLInputElement;
                                                        prevInput?.focus();
                                                    }
                                                }}
                                                className={`w-full aspect-square text-center text-lg font-bold rounded-lg outline-none transition-all duration-200 
                                                    ${zeptoOtpVerified
                                                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                                                        : "bg-black/30 border-gray-700 text-white focus:border-purple-500 focus:bg-purple-500/5 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                                    } border`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleZeptoOtpVerify}
                                        disabled={zeptoOtp.length < 4 || zeptoOtpVerified || isVerifyingZepto}
                                        className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg min-w-[100px] flex items-center justify-center
                                            ${zeptoOtpVerified
                                                ? "bg-green-600 text-white opacity-50 cursor-default"
                                                : zeptoOtp.length >= 4
                                                    ? "bg-purple-600 hover:bg-purple-500 text-white hover:shadow-purple-500/25 active:scale-95"
                                                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        {isVerifyingZepto ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : zeptoOtpVerified ? (
                                            "Verified"
                                        ) : (
                                            "Verify"
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Instamart OTP Section */}
                            <div className="space-y-4 p-5 bg-[#14151f] border border-orange-500/20 rounded-2xl relative group focus-within:border-orange-500/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
                                            <span className="text-lg font-bold text-white">S</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Swiggy Instamart</h3>
                                            <p className="text-xs text-orange-300/60">Enter 6-digit OTP</p>
                                        </div>
                                    </div>
                                    {instamartOtpVerified && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <span className="text-xs font-medium text-green-400">Verified</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 flex-1">
                                        {[...Array(6)].map((_, i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                maxLength={1}
                                                value={instamartOtp[i] || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                                    if (!val && e.target.value) return;

                                                    const newOtp = instamartOtp.split("");
                                                    newOtp[i] = val;
                                                    const combined = newOtp.join("").slice(0, 6);
                                                    setInstamartOtp(combined);

                                                    if (val && i < 5) {
                                                        const nextInput = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                                                        nextInput?.focus();
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && !instamartOtp[i] && i > 0) {
                                                        const prevInput = e.currentTarget.parentElement?.children[i - 1] as HTMLInputElement;
                                                        prevInput?.focus();
                                                    }
                                                }}
                                                className={`w-full aspect-square text-center text-lg font-bold rounded-lg outline-none transition-all duration-200 
                                                    ${instamartOtpVerified
                                                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                                                        : "bg-black/30 border-gray-700 text-white focus:border-orange-500 focus:bg-orange-500/5 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                                                    } border`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleInstamartOtpVerify}
                                        disabled={instamartOtp.length !== 6 || instamartOtpVerified || isVerifyingInstamart}
                                        className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg min-w-[100px] flex items-center justify-center
                                            ${instamartOtpVerified
                                                ? "bg-green-600 text-white opacity-50 cursor-default"
                                                : instamartOtp.length === 6
                                                    ? "bg-orange-600 hover:bg-orange-500 text-white hover:shadow-orange-500/25 active:scale-95"
                                                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        {isVerifyingInstamart ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : instamartOtpVerified ? (
                                            "Verified"
                                        ) : (
                                            "Verify"
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={!zeptoOtpVerified || !instamartOtpVerified}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all duration-300
                                        ${zeptoOtpVerified && instamartOtpVerified
                                            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white hover:shadow-green-500/25 hover:scale-[1.02]"
                                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    <span>Place Unified Order</span>
                                    {(zeptoOtpVerified && instamartOtpVerified) && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <button
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                />
            )}

            {/* Main Content */}
            {showChat ? (
                <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                        <div className="flex items-center gap-3">
                            <img src="/logo/zepto.jpg" alt="" className="w-8 h-8 rounded-lg" />
                            <span className="text-xl font-bold tracking-tight">Unified Groceries</span>
                            <img src="/logo/swiggy-instamart.jpg" alt="" className="w-8 h-8 rounded-lg" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-orange-500 flex items-center justify-center font-bold text-sm">
                                S
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 max-w-7xl mx-auto w-full pb-32">
                        {messages.map(renderMessage)}
                        {isLoading && <FlowerLoader />}
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleUnifiedSearch();
                        }}
                        className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-4xl px-4 py-6 bg-gradient-to-t from-black via-black/80 to-transparent"
                    >
                        <div className="flex items-center gap-3 rounded-[2rem] px-6 py-4 border border-gray-700 bg-white/5 backdrop-blur-xl shadow-2xl focus-within:border-gray-500 focus-within:bg-white/10 transition-all">
                            <input
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Search groceries on both platforms..."
                                className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg"
                            />
                            <div className="flex items-center gap-2">
                                <VoiceRecorderButton onTextReady={(t) => setMessageInput(t)} />
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim() || isLoading}
                                    className={`p-3 rounded-full transition-all duration-300 ${messageInput.trim()
                                        ? "bg-gradient-to-r from-purple-600 to-orange-600 hover:scale-110 shadow-lg shadow-purple-500/20"
                                        : "bg-white/10 text-white/30 cursor-not-allowed"
                                        }`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : !isLoggedIn ? (
                <div className="min-h-screen w-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
                    {/* Animated backgrounds */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />

                    <div className="text-center space-y-8 p-8 relative z-10">
                        <div className="flex items-center justify-center gap-6 mb-4">
                            <div className="p-1 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
                                <img src="/logo/zepto.jpg" alt="Zepto" className="w-24 h-24 rounded-2xl shadow-xl" />
                            </div>
                            <span className="text-5xl font-light text-gray-500">+</span>
                            <div className="p-1 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
                                <img src="/logo/swiggy-instamart.jpg" alt="Swiggy Instamart" className="w-24 h-24 rounded-2xl shadow-xl" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-white to-orange-400 bg-clip-text text-transparent italic">
                                Unified Groceries
                            </h1>
                            <p className="text-xl text-gray-400 font-medium max-w-xl mx-auto leading-relaxed">
                                The ultimate grocery experience. Search, compare, and order from Zepto and Swiggy Instamart simultaneously.
                            </p>
                        </div>
                        <div className="pt-8 flex flex-col items-center gap-4">
                            <button
                                onClick={() => setShowLoginPopup(true)}
                                className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
                            >
                                Get Started
                            </button>
                            <p className="text-sm text-gray-500">Sign in to sync your cart and addresses</p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Logged In Landing Page - Matching "Combined Shopping" Style */
                <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between px-8 py-6 sticky top-0 z-50">
                        <div className="flex items-center gap-2">
                            <img src="/images/LOGO.png" alt="Khwaaish" className="h-8" />
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold shadow-lg">
                                L
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 flex flex-col items-center pt-20 px-6 max-w-5xl mx-auto w-full text-center space-y-12">
                        <div className="space-y-6">
                            <div className="flex justify-center mb-8">
                                <img src="/images/LOGO.png" alt="Khwaaish" className="h-24" />
                            </div>
                            <h1 className="text-5xl font-extrabold tracking-tight">Combined Grocery Shopping</h1>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                Search Zepto + Swiggy Instamart together, then checkout on either.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full max-w-3xl relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-orange-600/30 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
                            <div className="relative flex items-center bg-[#11121a] border border-gray-800 rounded-[2.5rem] px-8 py-5 group-focus-within:border-gray-600 transition-all shadow-2xl">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleUnifiedSearch();
                                        }
                                    }}
                                    placeholder="Search for products on Zepto + Instamart..."
                                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-xl"
                                />
                                <div className="flex items-center gap-4 ml-4">
                                    <VoiceRecorderButton onTextReady={(t) => setMessageInput(t)} />
                                    <button
                                        onClick={() => handleUnifiedSearch()}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all group/btn"
                                    >
                                        <svg className="w-7 h-7 text-gray-400 group-hover/btn:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="w-full max-w-sm mt-8">
                            <div className="bg-[#1a1b26] border border-gray-800 p-8 rounded-3xl text-left hover:border-gray-700 transition-all shadow-xl group cursor-pointer">
                                <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Combined Shopping</h3>
                                <p className="text-gray-400">Search results are compared side-by-side: Zepto and Swiggy Instamart.</p>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </div>
    );
}
