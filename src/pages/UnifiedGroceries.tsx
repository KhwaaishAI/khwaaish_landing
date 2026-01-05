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

// Product Skeleton Component
const ProductSkeleton = () => (
    <div className="animate-pulse flex flex-col bg-[#11121a] rounded-2xl overflow-hidden">
        <div className="w-full h-36 bg-gray-700"></div>
        <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            <div className="h-5 bg-gray-700 rounded w-1/4 mt-2"></div>
        </div>
    </div>
);

export default function UnifiedGroceries() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // Login & OTP states
    const [showLoginPopup, setShowLoginPopup] = useState(true);
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [zeptoOtp, setZeptoOtp] = useState("");
    const [instamartOtp, setInstamartOtp] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");

    // Session IDs
    const [zeptoSessionId, setZeptoSessionId] = useState("");
    const [instamartSessionId, setInstamartSessionId] = useState("");

    // OTP Verification status
    const [zeptoVerified, setZeptoVerified] = useState(false);
    const [instamartVerified, setInstamartVerified] = useState(false);

    // Loading states
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isVerifyingZepto, setIsVerifyingZepto] = useState(false);
    const [isVerifyingInstamart, setIsVerifyingInstamart] = useState(false);
    const [loadingCart, setLoadingCart] = useState(false);
    const [loadingConfirm, setLoadingConfirm] = useState(false);
    const [loadingBook, setLoadingBook] = useState(false);

    // Cart states
    const [cartSelections, setCartSelections] = useState<{
        [id: string]: { quantity: number; product: any };
    }>({});
    const [selectedProductKey, setSelectedProductKey] = useState<string | null>(null);
    const [holdSeconds] = useState(59);

    // Zepto checkout states
    const [zeptoCheckoutData, setZeptoCheckoutData] = useState<any>(null);
    const [selectedZeptoAddressId, setSelectedZeptoAddressId] = useState<number | null>(null);
    const [showZeptoAddressPopup, setShowZeptoAddressPopup] = useState(false);
    const [flatDetails, setFlatDetails] = useState("");
    const [landmark, setLandmark] = useState("");
    const [buildingName, setBuildingName] = useState("");

    // Instamart checkout states
    const [instamartCheckoutData, setInstamartCheckoutData] = useState<any>(null);
    const [selectedInstamartAddressId, setSelectedInstamartAddressId] = useState<number | null>(null);
    const [showInstamartAddressPopup, setShowInstamartAddressPopup] = useState(false);
    const [instamartDoorNo, setInstamartDoorNo] = useState("");
    const [instamartLandmark, setInstamartLandmark] = useState("");

    // UPI states
    const [showUpiPopup, setShowUpiPopup] = useState(false);
    const [upiId, setUpiId] = useState("");
    const [activeCheckoutPlatform, setActiveCheckoutPlatform] = useState<"zepto" | "instamart" | null>(null);

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

    // ===== LOGIN FUNCTION =====
    const handleUnifiedLogin = async () => {
        if (!phone.trim() || !location.trim()) {
            alert("Please enter phone number and location");
            return;
        }
        setIsLoggingIn(true);

        try {
            // Login to Zepto
            console.log("Zepto login starting...");
            const zeptoRes = await fetch(`${BaseURL}api/zepto/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mobile_number: phone,
                    location: location,
                }),
            });
            const zeptoData = await zeptoRes.json();
            console.log("Zepto login response:", zeptoData);
            if (zeptoData.session_id) {
                setZeptoSessionId(zeptoData.session_id);
            }

            // Login to Instamart (uses /api/instamart/signup)
            console.log("Instamart signup starting...");
            const instamartRes = await fetch(`${BaseURL}api/instamart/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mobile_number: phone,
                    name: "Khwaaish User",
                    gmail: "user@khwaaish.com",
                    location: location,
                }),
            });
            const instamartData = await instamartRes.json();
            console.log("Instamart signup response:", instamartData);
            if (instamartData.session_id) {
                setInstamartSessionId(instamartData.session_id);
            }

            setShowLoginPopup(false);
            setShowOtpPopup(true);
        } catch (err) {
            console.error("Login error:", err);
            alert("Something went wrong during login!");
        } finally {
            setIsLoggingIn(false);
        }
    };

    // ===== ZEPTO OTP VERIFICATION =====
    const handleZeptoOtpVerify = async () => {
        if (!zeptoOtp.trim()) {
            alert("Please enter Zepto OTP");
            return;
        }
        setIsVerifyingZepto(true);
        try {
            console.log("Zepto OTP verify starting...");
            const res = await fetch(`${BaseURL}api/zepto/enter-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: zeptoSessionId,
                    otp: zeptoOtp,
                }),
            });
            const data = await res.json();
            console.log("Zepto OTP verify response:", data);
            if (data.status === "success") {
                setZeptoVerified(true);
                pushSystem("✓ Zepto verified successfully!");
            } else {
                alert("Zepto OTP verification failed: " + (data.message || "Invalid OTP"));
            }
        } catch (err) {
            console.error("Zepto OTP error:", err);
            alert("Something went wrong with Zepto OTP verification");
        } finally {
            setIsVerifyingZepto(false);
        }
    };

    // ===== INSTAMART OTP VERIFICATION =====
    const handleInstamartOtpVerify = async () => {
        if (!instamartOtp.trim()) {
            alert("Please enter Instamart OTP");
            return;
        }
        setIsVerifyingInstamart(true);
        try {
            console.log("Instamart OTP verify starting...");
            // CORRECT ENDPOINT: /api/instamart/submit-otp
            const res = await fetch(`${BaseURL}api/instamart/submit-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: instamartSessionId,
                    otp: instamartOtp,
                }),
            });
            const data = await res.json();
            console.log("Instamart OTP verify response:", data);
            if (data.status === "success") {
                setInstamartVerified(true);
                pushSystem("✓ Instamart verified successfully!");
            } else {
                alert("Instamart OTP verification failed: " + (data.message || "Invalid OTP"));
            }
        } catch (err) {
            console.error("Instamart OTP error:", err);
            alert("Something went wrong with Instamart OTP verification");
        } finally {
            setIsVerifyingInstamart(false);
        }
    };

    // ===== CONTINUE AFTER OTP =====
    const handleContinueAfterOtp = () => {
        if (!zeptoVerified || !instamartVerified) {
            alert("Please verify OTP for both Zepto and Instamart before continuing");
            return;
        }
        setShowOtpPopup(false);
    };

    // ===== SEARCH FUNCTION =====
    const handleUnifiedSearch = async () => {
        if (!messageInput.trim()) return;
        setShowChat(true);
        pushUser(messageInput);
        const userText = messageInput;
        setMessageInput("");
        setIsLoading(true);

        try {
            console.log("Searching on both platforms...");

            // Fire both searches in parallel and handle failures per-platform
            const [zeptoResult, instamartResult] = await Promise.allSettled([
                fetch(`${BaseURL}api/zepto/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: userText, max_items: 12 }),
                }),
                fetch(`${BaseURL}api/instamart/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: userText }),
                }),
            ]);

            let zeptoProducts: any[] = [];
            let instamartProducts: any[] = [];

            // ---- Zepto branch ----
            if (zeptoResult.status === "fulfilled") {
                try {
                    const res = zeptoResult.value;
                    let zeptoData: any = null;
                    try {
                        zeptoData = await res.json();
                    } catch (e) {
                        console.error("Zepto JSON parse failed:", e);
                    }

                    console.log("Zepto search response:", zeptoData);

                    if (zeptoData?.session_id) setZeptoSessionId(zeptoData.session_id);

                    zeptoProducts = (zeptoData?.products || [])
                        .slice(0, 12)
                        .map((item: any) => ({ ...item, source: "zepto" }));
                } catch (e) {
                    console.error("Zepto search handling error:", e);
                    pushSystem("Zepto search failed for this query; showing Instamart results if available.");
                }
            } else {
                console.error("Zepto search promise rejected:", zeptoResult.reason);
                pushSystem("Zepto search failed for this query; showing Instamart results if available.");
            }

            // ---- Instamart branch ----
            if (instamartResult.status === "fulfilled") {
                try {
                    const res = instamartResult.value;
                    let instamartData: any = null;
                    try {
                        instamartData = await res.json();
                    } catch (e) {
                        console.error("Instamart JSON parse failed:", e);
                    }

                    console.log("Instamart search response:", instamartData);

                    if (instamartData?.session_id) setInstamartSessionId(instamartData.session_id);

                    instamartProducts = (instamartData?.results || [])
                        .slice(0, 12)
                        .map((item: any) => ({ ...item, source: "instamart" }));
                } catch (e) {
                    console.error("Instamart search handling error:", e);
                    pushSystem("Instamart search failed for this query; showing Zepto results if available.");
                }
            } else {
                console.error("Instamart search promise rejected:", instamartResult.reason);
                pushSystem("Instamart search failed for this query; showing Zepto results if available.");
            }

            const combinedProducts = [...zeptoProducts, ...instamartProducts];
            console.log("Combined products:", combinedProducts.length);

            if (combinedProducts.length === 0) {
                pushSystem("No products found on either platform. Please try a different search.");
            } else {
                if (zeptoProducts.length && !instamartProducts.length) {
                    pushSystem("Note: Instamart returned no products or failed. Showing Zepto only.");
                } else if (!zeptoProducts.length && instamartProducts.length) {
                    pushSystem("Note: Zepto returned no products or failed. Showing Instamart only.");
                }

                pushSystem(
                    JSON.stringify({
                        type: "product_list",
                        products: combinedProducts,
                    })
                );
            }
        } catch (err) {
            console.error("Search error:", err);
            pushSystem("Search failed for both platforms. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // ===== CONFIRM CART =====
    const handleConfirmCart = async () => {
        if (loadingCart) return;

        const zeptoItems: { product: any; quantity: number }[] = [];
        const instamartItems: { product: any; quantity: number }[] = [];

        Object.values(cartSelections).forEach((item) => {
            if (item.quantity > 0) {
                if (item.product.source === "zepto") {
                    zeptoItems.push({ product: item.product, quantity: item.quantity });
                } else if (item.product.source === "instamart") {
                    instamartItems.push({ product: item.product, quantity: item.quantity });
                }
            }
        });

        if (zeptoItems.length === 0 && instamartItems.length === 0) {
            pushSystem("Please select at least one item.");
            return;
        }

        setLoadingCart(true);

        try {
            // Process Zepto items
            if (zeptoItems.length > 0) {
                await processZeptoCart(zeptoItems);
            }

            // Process Instamart items
            if (instamartItems.length > 0) {
                await processInstamartCart(instamartItems);
            }
        } finally {
            setLoadingCart(false);
            setCartSelections({});
        }
    };

    // ===== ZEPTO ADD TO CART =====
    const processZeptoCart = async (items: { product: any; quantity: number }[]) => {
        try {
            const item = items[0];
            const payload = {
                product_name: item.product.name,
                quantity: item.quantity,
                upi_id: "string",
                hold_seconds: holdSeconds,
            };

            console.log("Zepto add-to-cart payload:", payload);

            const res = await fetch(`${BaseURL}api/zepto/add-to-cart`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log("Zepto add-to-cart response:", data);

            if (data?.status === "success") {
                setZeptoCheckoutData(data);
                if (data.session_id) setZeptoSessionId(data.session_id);
                setSelectedZeptoAddressId(
                    Array.isArray(data.addresses) && data.addresses.length > 0
                        ? data.addresses[0]?.id ?? null
                        : null
                );
                pushSystem(
                    JSON.stringify({
                        type: "zepto_checkout",
                        session_id: data.session_id,
                        bill_summary: data.bill_summary,
                        addresses: data.addresses,
                        product_name: item.product.name,
                        quantity: item.quantity,
                    })
                );
            } else if (data?.status === "error" && data?.message === "Cart is empty.") {
                pushSystem(`Zepto item "${item.product.name}" is Out of Stock now!`);
            } else {
                pushSystem(data.message || "Zepto add to cart failed");
            }
        } catch (err) {
            console.error("Zepto cart error:", err);
            pushSystem("Something went wrong while adding to Zepto cart.");
        }
    };

    // ===== INSTAMART ADD TO CART =====
    const processInstamartCart = async (items: { product: any; quantity: number }[]) => {
        try {
            let lastBillDetails: any = null;
            let lastAddresses: any[] = [];
            let latestCheckoutData: any = null;

            for (const item of items) {
                const payload = {
                    product_name: item.product.name,
                    quantity: item.quantity,
                    session_id: instamartSessionId,
                };

                console.log("Instamart add-to-cart payload:", payload);

                const res = await fetch(`${BaseURL}api/instamart/add-to-cart`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                console.log("Instamart add-to-cart response:", data);

                if (data?.bill_details) lastBillDetails = data.bill_details;
                if (Array.isArray(data?.addresses)) lastAddresses = data.addresses;
                latestCheckoutData = data;

                if (data.session_id) setInstamartSessionId(data.session_id);

                if (data.status === "success") {
                    pushSystem(`Added ${item.quantity}x ${item.product.name} to Instamart cart`);
                } else {
                    pushSystem(`Failed to add ${item.product.name}: ${data.message || "Unknown error"}`);
                }
            }

            if (items.length > 0 && latestCheckoutData) {
                setInstamartCheckoutData(latestCheckoutData);
                const bill = latestCheckoutData?.bill_details ?? latestCheckoutData?.bill_summary;
                const addresses = Array.isArray(latestCheckoutData?.addresses) ? latestCheckoutData.addresses : [];

                if (bill && addresses.length > 0) {
                    const firstIndex = typeof addresses[0]?.id === "number" ? addresses[0].id : 0;
                    setSelectedInstamartAddressId(firstIndex);
                    pushSystem(
                        JSON.stringify({
                            type: "instamart_checkout",
                            session_id: latestCheckoutData.session_id,
                            bill_details: bill,
                            addresses: addresses,
                        })
                    );
                } else {
                    pushSystem("No saved address found. Please add an address to continue.");
                    setShowInstamartAddressPopup(true);
                }
            }
        } catch (err) {
            console.error("Instamart cart error:", err);
            pushSystem("Something went wrong with Instamart order");
        }
    };

    // ===== ZEPTO ADDRESS AND PAY =====
    const submitZeptoAddressAndPay = async (upi: string) => {
        if (!zeptoCheckoutData?.session_id) {
            pushSystem("Missing session_id. Please add to cart again.");
            return;
        }

        setLoadingConfirm(true);
        try {
            const hasAddresses = Array.isArray(zeptoCheckoutData?.addresses) && zeptoCheckoutData.addresses.length > 0;
            const payload: any = {
                session_id: zeptoCheckoutData.session_id,
                upi_id: upi,
            };

            if (hasAddresses) {
                if (selectedZeptoAddressId === null) {
                    alert("Please select a delivery address.");
                    setLoadingConfirm(false);
                    return;
                }
                payload.address_id = selectedZeptoAddressId;
            } else {
                payload.location = location;
                payload.flat_details = flatDetails;
                payload.landmark = landmark;
                payload.building_name = buildingName;
            }

            console.log("Zepto address-and-pay payload:", payload);

            const res = await fetch(`${BaseURL}api/zepto/address-and-pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log("Zepto address-and-pay response:", data);

            if (data.status === "success") {
                pushSystem("✓ Your Zepto order has been placed successfully!");
                setZeptoCheckoutData(null);
                setUpiId("");
            } else {
                pushSystem(`Zepto order failed: ${data.message || JSON.stringify(data)}`);
            }
        } catch (err) {
            console.error("Zepto payment error:", err);
            pushSystem("Something went wrong while confirming Zepto order.");
        } finally {
            setLoadingConfirm(false);
        }
    };

    // ===== INSTAMART BUY WITH ADDRESS =====
    const submitInstamartBuyWithAddress = async (upi: string) => {
        if (!instamartSessionId) {
            pushSystem("Missing session_id. Please search and add items again.");
            return;
        }

        if (selectedInstamartAddressId === null) {
            alert("Please select a delivery address.");
            return;
        }

        setLoadingConfirm(true);
        try {
            const payload = {
                session_id: instamartSessionId,
                address_index: selectedInstamartAddressId,
                upi_id: upi,
            };

            console.log("Instamart buy-with-address payload:", payload);

            const res = await fetch(`${BaseURL}api/instamart/buy-with-address`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log("Instamart buy-with-address response:", data);

            if (data.status === "success") {
                pushSystem("✓ Your Instamart order has been placed successfully!");
                setInstamartCheckoutData(null);
                setUpiId("");
            } else {
                pushSystem(`Instamart order failed: ${data.message || JSON.stringify(data)}`);
            }
        } catch (err) {
            console.error("Instamart payment error:", err);
            pushSystem("Something went wrong while confirming Instamart order.");
        } finally {
            setLoadingConfirm(false);
        }
    };

    // ===== INSTAMART BOOK (for new address) =====
    const handleInstamartBook = async () => {
        if (!instamartDoorNo.trim() || !instamartLandmark.trim() || !upiId.trim()) {
            alert("Please fill all fields: Door Number, Landmark, and UPI ID");
            return;
        }

        setLoadingBook(true);
        try {
            const payload = {
                session_id: instamartSessionId,
                door_no: instamartDoorNo,
                landmark: instamartLandmark,
                upi_id: upiId,
            };

            console.log("Instamart book payload:", payload);

            const res = await fetch(`${BaseURL}api/instamart/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log("Instamart book response:", data);

            if (data.status === "success") {
                pushSystem("✓ Your Instamart order has been booked successfully!");
                setInstamartDoorNo("");
                setInstamartLandmark("");
                setShowInstamartAddressPopup(false);
                setCartSelections({});
                setUpiId("");
            } else {
                pushSystem(`Instamart booking failed: ${data.message || "Unknown error"}`);
            }
        } catch (err: any) {
            console.error("Instamart book error:", err);
            pushSystem(`Error: ${err.message || "Something went wrong"}`);
        } finally {
            setLoadingBook(false);
        }
    };

    // ===== UPI SUBMIT HANDLER =====
    const handleUpiSubmit = async () => {
        if (!upiId.trim()) {
            alert("Please enter a valid UPI ID");
            return;
        }

        setShowUpiPopup(false);
        if (activeCheckoutPlatform === "zepto") {
            await submitZeptoAddressAndPay(upiId);
        } else if (activeCheckoutPlatform === "instamart") {
            await submitInstamartBuyWithAddress(upiId);
        }
    };

    // ===== RENDER MESSAGE =====
    const renderMessage = (m: Message) => {
        let parsed: any;

        try {
            parsed = JSON.parse(m.content);
        } catch {
            parsed = m.content;
        }

        let content: React.ReactNode = null;

        // PRODUCT LIST
        if (typeof parsed === "object" && parsed?.type === "product_list") {
            content = (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold mb-2">Here are some options:</h3>

                    <div className="w-full">
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                            {parsed.products?.slice(0, 24).map((p: any, index: number) => {
                                const key = `${p.name}|${p.price}|${p.source}|${index}`;
                                const qty = cartSelections[key]?.quantity || 0;
                                const isSelected = selectedProductKey === key;
                                const sourceColor = p.source === "zepto"
                                    ? "bg-purple-500/15 text-purple-300"
                                    : "bg-orange-500/15 text-orange-300";

                                return (
                                    <div
                                        key={key}
                                        onClick={() => setSelectedProductKey(key)}
                                        className={`relative flex flex-col bg-[#11121a] rounded-2xl overflow-hidden shadow-sm transition-colors cursor-pointer ${isSelected ? "bg-[#181924]" : "hover:bg-[#151622]"}`}
                                    >
                                        {isSelected && (
                                            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold z-10">
                                                +1
                                            </div>
                                        )}
                                        {p.image_url && (
                                            <div className="relative w-full h-36 bg-gray-800">
                                                <img
                                                    src={p.image_url}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1 flex flex-col px-3 py-3 gap-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`text-[10px] px-2 py-1 rounded-full ${sourceColor}`}>
                                                    {p.source === "zepto" ? "Zepto" : "Instamart"}
                                                </span>
                                            </div>

                                            <div className="space-y-1 min-h-[48px]">
                                                <p className="text-sm font-semibold text-white line-clamp-2">{p.name}</p>
                                            </div>

                                            <div className="flex items-baseline justify-between mt-1">
                                                <p className="text-base font-bold text-white">₹{p.price}</p>
                                                {p.original_price && p.original_price !== p.price && (
                                                    <p className="text-xs text-gray-400 line-through">₹{p.original_price}</p>
                                                )}
                                            </div>

                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() =>
                                                            setCartSelections((prev: any) => {
                                                                const current = prev[key] || { quantity: 0, product: p };
                                                                return {
                                                                    ...prev,
                                                                    [key]: { ...current, quantity: Math.max(current.quantity - 1, 0) },
                                                                };
                                                            })
                                                        }
                                                        className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-sm"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-6 text-center text-sm">{qty}</span>
                                                    <button
                                                        onClick={() =>
                                                            setCartSelections((prev: any) => {
                                                                const current = prev[key] || { quantity: 0, product: p };
                                                                return {
                                                                    ...prev,
                                                                    [key]: { ...current, quantity: current.quantity + 1 },
                                                                };
                                                            })
                                                        }
                                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${p.source === "zepto" ? "bg-purple-600" : "bg-orange-600"}`}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleConfirmCart}
                                className={`px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 min-w-[150px] ${loadingCart
                                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                                    : "bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-red-500/25"
                                    }`}
                                disabled={loadingCart}
                            >
                                {loadingCart ? (
                                    <>
                                        <PopupLoader />
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm Cart"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        // ZEPTO CHECKOUT
        else if (typeof parsed === "object" && parsed?.type === "zepto_checkout") {
            const bill = parsed?.bill_summary || {};
            const addresses = Array.isArray(parsed?.addresses) ? parsed.addresses : [];

            content = (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-purple-800/50 bg-purple-900/20 p-4">
                        <div className="text-sm font-semibold mb-2 text-purple-300">Zepto Bill Summary</div>
                        <div className="space-y-2">
                            {Object.entries(bill).map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-300">{k}</span>
                                    <span className="text-white font-medium">{String(v)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-purple-800/50 bg-purple-900/20 p-4">
                        <div className="text-sm font-semibold mb-2 text-purple-300">Delivery Address</div>
                        {addresses.length > 0 ? (
                            <div className="space-y-3">
                                {addresses.map((a: any) => (
                                    <label
                                        key={a.id}
                                        className="flex items-start gap-3 p-3 rounded-xl border border-purple-800/30 hover:border-purple-700/50 cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="zepto_address"
                                            className="mt-1"
                                            checked={selectedZeptoAddressId === a.id}
                                            onChange={() => setSelectedZeptoAddressId(a.id)}
                                        />
                                        <div>
                                            <div className="text-sm font-medium">{a.tag || "Address"}</div>
                                            <div className="text-xs text-gray-300 mt-1">{a.address}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="text-sm text-gray-300">No saved address. Please enter one.</div>
                                <button
                                    onClick={() => setShowZeptoAddressPopup(true)}
                                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2"
                                >
                                    Enter Address
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                if (addresses.length > 0 && selectedZeptoAddressId === null) {
                                    alert("Please select an address.");
                                    return;
                                }
                                if (addresses.length === 0) {
                                    setShowZeptoAddressPopup(true);
                                    return;
                                }
                                setActiveCheckoutPlatform("zepto");
                                setShowUpiPopup(true);
                            }}
                            className={`px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 min-w-[180px] ${loadingConfirm
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-500 text-white"
                                }`}
                            disabled={loadingConfirm}
                        >
                            {loadingConfirm ? (
                                <>
                                    <PopupLoader />
                                    Processing...
                                </>
                            ) : (
                                "Proceed to Payment"
                            )}
                        </button>
                    </div>
                </div>
            );
        }
        // INSTAMART CHECKOUT
        else if (typeof parsed === "object" && parsed?.type === "instamart_checkout") {
            const bill = parsed?.bill_details || parsed?.bill_summary || {};
            const addresses = Array.isArray(parsed?.addresses) ? parsed.addresses : [];

            content = (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-orange-800/50 bg-orange-900/20 p-4">
                        <div className="text-sm font-semibold mb-2 text-orange-300">Instamart Bill Summary</div>
                        <div className="space-y-2">
                            {Object.entries(bill).map(([k, v]: any) => {
                                const isObj = v && typeof v === "object";
                                const finalVal = isObj ? v.final ?? v.value ?? "" : v;
                                return (
                                    <div key={k} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-300">{k}</span>
                                        <span className="text-white font-medium">{String(finalVal)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-orange-800/50 bg-orange-900/20 p-4">
                        <div className="text-sm font-semibold mb-2 text-orange-300">Delivery Address</div>
                        {addresses.length > 0 ? (
                            <div className="space-y-3">
                                {addresses.map((a: any, idx: number) => {
                                    const addressIndex = typeof a?.id === "number" ? a.id : idx;
                                    return (
                                        <label
                                            key={addressIndex}
                                            className="flex items-start gap-3 p-3 rounded-xl border border-orange-800/30 hover:border-orange-700/50 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="instamart_address"
                                                className="mt-1"
                                                checked={selectedInstamartAddressId === addressIndex}
                                                onChange={() => setSelectedInstamartAddressId(addressIndex)}
                                            />
                                            <div>
                                                <div className="text-sm font-medium">{a.label || a.tag || "Address"}</div>
                                                <div className="text-xs text-gray-300 mt-1">{a.address || a.address_text}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="text-sm text-gray-300">No saved address. Please enter one.</div>
                                <button
                                    onClick={() => setShowInstamartAddressPopup(true)}
                                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center gap-2"
                                >
                                    Enter Address
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                if (addresses.length > 0 && selectedInstamartAddressId === null) {
                                    alert("Please select an address.");
                                    return;
                                }
                                if (addresses.length === 0) {
                                    setShowInstamartAddressPopup(true);
                                    return;
                                }
                                setActiveCheckoutPlatform("instamart");
                                setShowUpiPopup(true);
                            }}
                            className={`px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 min-w-[180px] ${loadingConfirm
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-orange-600 hover:bg-orange-500 text-white"
                                }`}
                            disabled={loadingConfirm}
                        >
                            {loadingConfirm ? (
                                <>
                                    <PopupLoader />
                                    Processing...
                                </>
                            ) : (
                                "Proceed to Payment"
                            )}
                        </button>
                    </div>
                </div>
            );
        }
        // SUCCESS MESSAGE
        else if (
            (typeof parsed === "object" && parsed?.status?.toLowerCase() === "success") ||
            (typeof parsed === "string" && parsed.trim().toLowerCase() === "success")
        ) {
            content = <p className="font-semibold text-green-400">✓ Your order has been placed!</p>;
        }
        // DEFAULT TEXT
        else {
            content = <div className="space-y-2 text-sm">{String(parsed)}</div>;
        }

        return typeof parsed === "object" && parsed?.type === "product_list" ? (
            <div key={m.id} className="w-full">{content}</div>
        ) : (
            <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
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
            {/* LOGIN POPUP */}
            {showLoginPopup && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[9999]">
                    <div className="bg-black p-8 rounded-3xl w-full max-w-md space-y-6 border border-red-900/30 shadow-[0_0_50px_rgba(220,38,38,0.1)]">
                        <div className="text-center space-y-2">
                            <img src="/images/LOGO.png" alt="Khwaaish" className="h-12 mx-auto mb-4" />
                            <h2 className="text-3xl font-black tracking-tighter text-white">Welcome Back</h2>
                            <p className="text-sm text-gray-400">Login to Zepto and Swiggy Instamart simultaneously</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter your number"
                                    className="w-full px-5 py-4 rounded-2xl bg-[#0a0a0a] border border-gray-800 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Mumbai, Delhi"
                                    className="w-full px-5 py-4 rounded-2xl bg-[#0a0a0a] border border-gray-800 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleUnifiedLogin}
                            disabled={isLoggingIn}
                            className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 ${isLoggingIn
                                ? "bg-red-900/50 cursor-not-allowed text-gray-400"
                                : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98]"
                                }`}
                        >
                            {isLoggingIn ? (
                                <>
                                    <PopupLoader />
                                    Connecting...
                                </>
                            ) : (
                                "Login Now"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* OTP POPUP - Must verify BOTH before continuing */}
            {showOtpPopup && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[9999]">
                    <div className="bg-black p-8 rounded-3xl w-full max-w-md space-y-6 border border-gray-800">
                        <h2 className="text-2xl font-bold text-center">Verify OTP</h2>
                        <p className="text-sm text-gray-400 text-center">Please verify OTP for both platforms to continue</p>

                        <div className="space-y-4">
                            {/* Zepto OTP */}
                            <div className={`p-4 rounded-xl border ${zeptoVerified ? "bg-green-900/20 border-green-800/50" : "bg-purple-900/20 border-purple-800/30"}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-purple-300">Zepto OTP</label>
                                    {zeptoVerified && <span className="text-xs text-green-400 font-bold">✓ Verified</span>}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={zeptoOtp}
                                        onChange={(e) => setZeptoOtp(e.target.value)}
                                        placeholder="Enter Zepto OTP"
                                        disabled={zeptoVerified}
                                        className={`flex-1 px-4 py-3 rounded-xl bg-black border text-white ${zeptoVerified ? "border-green-800 opacity-50" : "border-purple-800"}`}
                                    />
                                    <button
                                        onClick={handleZeptoOtpVerify}
                                        disabled={isVerifyingZepto || zeptoVerified}
                                        className={`px-4 py-2 rounded-xl font-semibold flex items-center justify-center min-w-[80px] ${zeptoVerified
                                            ? "bg-green-700 cursor-not-allowed"
                                            : isVerifyingZepto
                                                ? "bg-purple-800 cursor-not-allowed"
                                                : "bg-purple-600 hover:bg-purple-500"
                                            } text-white`}
                                    >
                                        {isVerifyingZepto ? <PopupLoader /> : zeptoVerified ? "✓" : "Verify"}
                                    </button>
                                </div>
                            </div>

                            {/* Instamart OTP */}
                            <div className={`p-4 rounded-xl border ${instamartVerified ? "bg-green-900/20 border-green-800/50" : "bg-orange-900/20 border-orange-800/30"}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-orange-300">Instamart OTP</label>
                                    {instamartVerified && <span className="text-xs text-green-400 font-bold">✓ Verified</span>}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={instamartOtp}
                                        onChange={(e) => setInstamartOtp(e.target.value)}
                                        placeholder="Enter Instamart OTP"
                                        disabled={instamartVerified}
                                        className={`flex-1 px-4 py-3 rounded-xl bg-black border text-white ${instamartVerified ? "border-green-800 opacity-50" : "border-orange-800"}`}
                                    />
                                    <button
                                        onClick={handleInstamartOtpVerify}
                                        disabled={isVerifyingInstamart || instamartVerified}
                                        className={`px-4 py-2 rounded-xl font-semibold flex items-center justify-center min-w-[80px] ${instamartVerified
                                            ? "bg-green-700 cursor-not-allowed"
                                            : isVerifyingInstamart
                                                ? "bg-orange-800 cursor-not-allowed"
                                                : "bg-orange-600 hover:bg-orange-500"
                                            } text-white`}
                                    >
                                        {isVerifyingInstamart ? <PopupLoader /> : instamartVerified ? "✓" : "Verify"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Continue Button - Only enabled when BOTH verified */}
                        <button
                            onClick={handleContinueAfterOtp}
                            disabled={!zeptoVerified || !instamartVerified}
                            className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${zeptoVerified && instamartVerified
                                ? "bg-green-600 hover:bg-green-500 text-white"
                                : "bg-gray-800 cursor-not-allowed text-gray-500"
                                }`}
                        >
                            {zeptoVerified && instamartVerified ? "Continue to Shopping" : "Verify Both OTPs to Continue"}
                        </button>
                    </div>
                </div>
            )}

            {/* UPI POPUP */}
            {showUpiPopup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700">
                        <h2 className="text-xl font-semibold">Enter UPI ID</h2>
                        <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@upi"
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowUpiPopup(false)}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg border border-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpiSubmit}
                                disabled={loadingConfirm}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
                            >
                                {loadingConfirm ? <PopupLoader /> : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ZEPTO ADDRESS POPUP */}
            {showZeptoAddressPopup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700">
                        <h2 className="text-xl font-semibold">Enter Zepto Delivery Address</h2>
                        <input
                            type="text"
                            value={flatDetails}
                            onChange={(e) => setFlatDetails(e.target.value)}
                            placeholder="Flat/House No."
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
                        />
                        <input
                            type="text"
                            value={buildingName}
                            onChange={(e) => setBuildingName(e.target.value)}
                            placeholder="Building Name"
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
                        />
                        <input
                            type="text"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            placeholder="Landmark"
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
                        />
                        <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="UPI ID"
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowZeptoAddressPopup(false)}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg border border-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowZeptoAddressPopup(false);
                                    submitZeptoAddressAndPay(upiId);
                                }}
                                disabled={loadingConfirm}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
                            >
                                {loadingConfirm ? <PopupLoader /> : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INSTAMART ADDRESS POPUP */}
            {showInstamartAddressPopup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700">
                        <h2 className="text-xl font-semibold">Enter Instamart Delivery Address</h2>
                        <input
                            type="text"
                            value={instamartDoorNo}
                            onChange={(e) => setInstamartDoorNo(e.target.value)}
                            placeholder="Door No."
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
                        />
                        <input
                            type="text"
                            value={instamartLandmark}
                            onChange={(e) => setInstamartLandmark(e.target.value)}
                            placeholder="Landmark"
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
                        />
                        <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="UPI ID"
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowInstamartAddressPopup(false)}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg border border-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInstamartBook}
                                disabled={loadingBook}
                                className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
                            >
                                {loadingBook ? <PopupLoader /> : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            {showChat ? (
                <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col">
                    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                        <div className="flex items-center gap-3">
                            <img src="/logo/zepto.jpg" alt="Zepto" className="w-8 h-8 rounded-lg" />
                            <span className="text-xl font-bold">+</span>
                            <img src="/logo/swiggy-instamart.jpg" alt="Swiggy Instamart" className="w-8 h-8 rounded-lg" />
                            <span className="text-lg font-semibold ml-2">Combined Shopping</span>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map(renderMessage)}

                        {/* Loading Skeleton */}
                        {isLoading && (
                            <div className="w-full">
                                <div className="mb-4">
                                    <div className="h-6 bg-gray-800 rounded w-48 animate-pulse mb-4"></div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                                    {[...Array(12)].map((_, i) => (
                                        <ProductSkeleton key={i} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="sticky bottom-0 bg-black/80 backdrop-blur-md border-t border-gray-800 p-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUnifiedSearch();
                            }}
                            className="flex items-center gap-3 max-w-4xl mx-auto"
                        >
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Search groceries on both platforms..."
                                className="flex-1 px-5 py-4 rounded-2xl bg-white/5 border border-gray-800 text-white outline-none focus:border-red-600 transition-all"
                            />
                            <VoiceRecorderButton onTextReady={(t) => setMessageInput(t)} />
                            <button
                                type="submit"
                                disabled={!messageInput.trim() || isLoading}
                                className={`p-4 rounded-full transition-all flex items-center justify-center ${messageInput.trim() && !isLoading
                                    ? "bg-red-600 hover:bg-red-500"
                                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {isLoading ? (
                                    <PopupLoader />
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen flex flex-col items-center justify-center p-8">
                    <div className="text-center space-y-6 max-w-2xl">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <img src="/logo/zepto.jpg" alt="Zepto" className="w-16 h-16 rounded-2xl" />
                            <span className="text-4xl font-black text-gray-600">+</span>
                            <img src="/logo/instamart.png" alt="Instamart" className="w-16 h-16 rounded-2xl" />
                        </div>
                        <h1 className="text-4xl font-black">Combined Shopping</h1>
                        <p className="text-gray-400 text-lg">Search for products across Zepto and Instamart simultaneously. Compare prices and choose the best deal!</p>
                        <button
                            onClick={() => setShowChat(true)}
                            className="px-8 py-4 bg-red-600 hover:bg-red-500 rounded-2xl font-bold text-lg transition-all hover:scale-105"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
