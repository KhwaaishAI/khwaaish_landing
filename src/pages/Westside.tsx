import React, { useState } from "react";
import FlowerLoader from "../components/FlowerLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";
import LandingView from "../components/LandingView";

import type { Message, ProductListMessage } from "../types/westside";
import { westsideSearch } from "../utils/api/westsideApi";
import { useWestsideFlow } from "../utils/hooks/useWestsideFlow";

import WestsideProductGrid from "../components/westside/WestsideProductGrid";
import WestsideSizePopup from "../components/westside/WestsideSizePopup";
import WestsideUpiPopup from "../components/westside/WestsideUpiPopup";
import WestsideAddressPopup from "../components/westside/WestsideAddressPopup";
import WestsideLoginOtpPopup from "../components/westside/WestsideLoginOtpPopup";

const BaseURL = import.meta.env.DEV ? import.meta.env.VITE_API_BASE_URL : "";

export default function WestsideChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pushSystem = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "system", content: text },
    ]);
  };

  const pushUser = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);
  };

  const flow = useWestsideFlow({ BaseURL, pushSystem });

  const handleSearch = async (query: string) => {
    console.log("WESTSIDE SEARCH triggered with query", query);
    setIsLoading(true);

    try {
      const { res, data } = await westsideSearch(BaseURL, query);
      console.log("WESTSIDE SEARCH response", data);

      if (!res.ok) {
        pushSystem(data?.message || "Search failed. Please try again.");
        return;
      }

      const products = data?.products || [];
      const payload: ProductListMessage = { type: "productlist", products };
      pushSystem(JSON.stringify(payload));
    } catch (err) {
      console.log("WESTSIDE SEARCH ERROR", err);
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
          <WestsideProductGrid
            products={parsed.products}
            selectedProductUrl={flow.pendingProduct?.product_url || null}
            onSelect={(p) => flow.openProductAndFetchSizes(p)}
          />
        </div>
      );
    }

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
              Your Westside item will be delivered soon.
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

  const sizesToShow = flow.viewData?.sizes?.length
    ? flow.viewData.sizes
    : flow.sizesFallback;

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      <WestsideSizePopup
        open={flow.showSizePopup}
        productName={
          flow.viewData?.product_name || flow.pendingProduct?.product_name
        }
        productPrice={flow.viewData?.price || flow.pendingProduct?.price}
        sizes={sizesToShow}
        selectedSize={flow.selectedSize}
        onSelectSize={flow.setSelectedSize}
        onAddToCart={flow.handleAddToCartThenAccountCheck}
        onClose={() => flow.setShowSizePopup(false)}
        loading={flow.loadingAddToCart || flow.loadingView}
      />

      <WestsideUpiPopup
        open={flow.showUpiPopup}
        upiId={flow.upiId}
        setUpiId={(v) => flow.setUpiId(v)}
        onPay={flow.proceedAfterUpi}
        onClose={() => flow.setShowUpiPopup(false)}
        loading={false}
      />

      <WestsideAddressPopup
        open={flow.showAddressPopup}
        address={flow.address}
        setAddress={flow.setAddress}
        onSave={flow.handleAddressSaveThenAccountCheck}
        onClose={() => flow.setShowAddressPopup(false)}
        loading={flow.loadingBuy}
      />

      <WestsideLoginOtpPopup
        open={flow.showLoginOtpPopup}
        mobile={flow.mobile}
        setMobile={flow.setMobile}
        otp={flow.otp}
        setOtp={flow.setOtp}
        onSendOtp={flow.sendOtp}
        onVerifyOtp={flow.verifyOtp}
        onClose={() => flow.setShowLoginOtpPopup(false)}
        loadingSend={flow.loadingSendOtp}
        loadingVerify={flow.loadingVerifyOtp}
      />

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
                placeholder="Search Westside products..."
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
              />

              <VoiceRecorderButton
                onTextReady={(text) =>
                  setMessageInput((prev) => (prev ? prev + text : text))
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
          title="Welcome to Westside Shopping!"
          subtitle="Search for any product you want to buy..."
          searchPlaceholder="Search for products on Westside..."
          cardTitle="Westside Shopping"
          cardDescription="Search and buy products from Westside with voice commands"
        />
      )}
    </div>
  );
}
