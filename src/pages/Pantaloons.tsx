import { useState } from "react";
import FlowerLoader from "../components/FlowerLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";
import LandingView from "../components/LandingView";

import type { Message, ProductListMessage } from "../types/pantaloons";
import { pantaloonsSearch } from "../utils/api/pantaloonsApi";
import { usePantaloonsFlow } from "../utils/hooks/usePantaloonsFlow";

import PantaloonsProductGrid from "../components/pantaloons/PantaloonsProductGrid";
import PantaloonsPincodePopup from "../components/pantaloons/PantaloonsPincodePopup";
import PantaloonsSizePopup from "../components/pantaloons/PantaloonsSizePopup";
import PantaloonsPhoneOtpPopup from "../components/pantaloons/PantaloonsPhoneOtpPopup";
import PantaloonsUpiAddressPopup from "../components/pantaloons/PantaloonsUpiAddressPopup";

const BaseURL = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;

export default function PantaloonsChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const flow = usePantaloonsFlow({ BaseURL, pushSystem });

  const handleSearch = async (query: string) => {
    console.log("PANTALOONS SEARCH triggered with query:", query);

    setIsLoading(true);
    try {
      const { res, data, body } = await pantaloonsSearch(BaseURL, {
        query,
        page: 1,
        sort_by: "popularity",
      });

      console.log("PANTALOONS SEARCH request body:", body);
      console.log("PANTALOONS SEARCH response data:", data);

      if (!res.ok) {
        pushSystem(
          data?.message || data?.detail || "Search failed. Please try again."
        );
        return;
      }

      const rawProducts = Array.isArray(data?.products) ? data.products : [];
      console.log("PANTALOONS SEARCH raw products count:", rawProducts.length);
      console.log("PANTALOONS SEARCH raw products sample:", rawProducts?.[0]);

      const filtered = rawProducts
        .filter((p: any) => {
          const ok = p?.product_url != null && p?.image != null;
          if (!ok) console.log("PANTALOONS SEARCH filtered out:", p);
          return ok;
        })
        .slice(0, 5);

      console.log(
        "PANTALOONS SEARCH filtered products count:",
        filtered.length
      );

      // Map backend keys -> UI keys used by PantaloonsProductGrid + flow
      const products = filtered.map((p: any) => ({
        productname: p?.product_name ?? p?.name ?? "Unnamed product",
        producturl: p?.product_url,
        imageurl: p?.image,
        price: p?.price ?? p?.final_price ?? p?.mrp ?? "",
      }));

      console.log("PANTALOONS SEARCH final mapped products:", products);

      const payload: ProductListMessage = { type: "productlist", products };
      pushSystem(JSON.stringify(payload));
    } catch (err) {
      console.log("PANTALOONS SEARCH ERROR:", err);
      pushSystem("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!messageInput.trim()) return;

    setShowChat(true);
    const userText = messageInput.trim();
    setMessageInput("");
    pushUser(userText);
    await handleSearch(userText);
  };

  const handleNewChat = () => {
    setShowChat(true);
    setMessages([]);
    setMessageInput("");
  };

  const renderMessage = (m: Message) => {
    let parsed: any;
    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    if (typeof parsed === "object" && parsed?.type === "productlist") {
      return (
        <div key={m.id} className="w-full">
          <PantaloonsProductGrid
            products={parsed.products}
            selectedProductUrl={flow.pendingProduct?.producturl || null}
            onSelect={(p) => flow.openProductThenAskPincode(p)}
          />
        </div>
      );
    }

    // same success UI behavior as your Westside page (keep it simple)
    if (
      (typeof parsed === "object" &&
        String(parsed?.status || "")
          .toLowerCase()
          .includes("success")) ||
      (typeof parsed === "string" && parsed.trim().toLowerCase() === "success")
    ) {
      return (
        <div
          key={m.id}
          className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-600 rounded-xl"
        >
          <div>
            <p className="font-semibold text-green-400">Order Confirmed!</p>
            <p className="text-sm text-green-300 mt-1">
              Your Pantaloons item will be delivered soon.
            </p>
          </div>
        </div>
      );
    }

    const text = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
    return (
      <div
        key={m.id}
        className={`flex ${
          m.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={[
            "max-w-[85%] rounded-2xl px-4 py-3 border",
            m.role === "user"
              ? "bg-white/15 text-white border-white/20"
              : "bg-gray-900/80 text-gray-100 border-gray-800",
          ].join(" ")}
        >
          <p className="text-sm sm:text-base leading-relaxed">{text}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* POPUPS */}
      <PantaloonsPincodePopup
        open={flow.showPincodePopup}
        pincode={flow.pincode}
        setPincode={flow.setPincode}
        onSubmit={flow.submitPincodeAndFetchInfo}
        onClose={() => flow.setShowPincodePopup(false)}
        loading={flow.loadingInfo}
      />

      <PantaloonsSizePopup
        open={flow.showSizePopup}
        productName={
          flow.productInfo?.productname || flow.pendingProduct?.productname
        }
        productPrice={flow.productInfo?.price || flow.pendingProduct?.price}
        sizes={flow.sizesToShow}
        selectedSize={flow.selectedSize}
        onSelectSize={flow.setSelectedSize}
        onContinue={flow.continueAfterSize}
        onClose={() => flow.setShowSizePopup(false)}
        loading={false}
      />

      <PantaloonsPhoneOtpPopup
        open={flow.showPhoneOtpPopup}
        phone={flow.phone}
        setPhone={flow.setPhone}
        otp={flow.otp}
        setOtp={flow.setOtp}
        onCheckSession={flow.checkSession}
        onSendOtp={flow.sendOtp}
        onVerifyOtp={flow.verifyOtp}
        onClose={() => flow.setShowPhoneOtpPopup(false)}
        loadingCheck={flow.loadingCheck}
        loadingSend={flow.loadingSendOtp}
        loadingVerify={flow.loadingVerifyOtp}
        phase={flow.phonePhase}
      />

      <PantaloonsUpiAddressPopup
        open={flow.showUpiAddressPopup}
        upiId={flow.upiId}
        setUpiId={flow.setUpiId}
        couponCode={flow.couponCode}
        setCouponCode={flow.setCouponCode}
        address={flow.address}
        setAddress={flow.setAddress}
        onRun={flow.runAutomation}
        onClose={() => flow.setShowUpiAddressPopup(false)}
        loading={flow.loadingRun}
      />

      {/* CHAT / LANDING */}
      {showChat ? (
        <div className="relative min-h-screen w-full bg-black overflow-hidden">
          <div className="h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
            {messages.map(renderMessage)}
            {isLoading ? <FlowerLoader /> : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="absolute bottom-0 left-0 right-0 z-40 mx-auto max-w-4xl px-4 py-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          >
            <div className="flex items-center gap-3 rounded-full px-4 py-3 border border-gray-800 bg-white/10 backdrop-blur">
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Search Pantaloons products..."
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
              />
              <VoiceRecorderButton
                onTextReady={(text) =>
                  setMessageInput((prev) => (prev ? prev + " " + text : text))
                }
              />
              <button
                type="submit"
                className={[
                  "p-2.5 rounded-full",
                  messageInput
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-white/20 hover:bg-white/30",
                ].join(" ")}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <LandingView
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSend={handleSend}
          onNewChat={handleNewChat}
          title="Welcome to Pantaloons Shopping!"
          subtitle="Search for any product you want to buy."
          searchPlaceholder="Search for products on Pantaloons..."
          cardTitle="Pantaloons Shopping"
          cardDescription="Search and buy products from Pantaloons with voice commands."
        />
      )}
    </div>
  );
}
