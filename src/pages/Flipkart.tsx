import React, { useState } from "react";
import FlowerLoader from "../components/FlowerLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";

import LandingView from "../components/LandingView";

import FlipkartProductGrid from "../components/flipkart/FlipkartProductGrid";
import FlipkartPhonePopup from "../components/flipkart/FlipkartPhonePopup";
import FlipkartSizePopup from "../components/flipkart/FlipkartSizePopup";
import FlipkartOtpPopup from "../components/flipkart/FlipkartOtpPopup";
import FlipkartAddressPopup from "../components/flipkart/FlipkartAddressPopup";
import FlipkartUpiPopup from "../components/flipkart/FlipkartUpiPopup";

import { useFlipkartFlow } from "../utils/hooks/useFlipkartFlow";

const BaseURL = import.meta.env.VITE_API_BASE_URL;

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

export default function Flipkart() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");

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

  const flow = useFlipkartFlow({
    BaseURL,
    pushSystem,
    pushUser,
    setIsLoading,
    setLastSearchQuery,
  });

  const handleSend = async () => {
    if (!messageInput.trim()) {
      console.log("Empty message, stopping.");
      return;
    }

    setShowChat(true);
    const userText = messageInput.trim();
    setMessageInput("");

    await flow.handleSearch(userText);
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

    let content: React.ReactNode = null;

    if (typeof parsed === "object" && parsed?.type === "product_list") {
      content = (
        <FlipkartProductGrid
          products={parsed.products || []}
          pendingProduct={flow.pendingProduct}
          lastSearchQuery={lastSearchQuery}
          onSelect={(p) => flow.handleProductSelect(p)}
        />
      );
    } else if (typeof parsed === "object" && parsed?.type === "order_success") {
      content = (
        <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-600 rounded-xl">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-400">Order Confirmed! 🎉</p>
            <p className="text-sm text-green-300 mt-1">
              {parsed.message ||
                "Your Flipkart order has been placed successfully!"}
            </p>
          </div>
        </div>
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

      content = (
        <div className="space-y-2">{renderFormatted(String(parsed))}</div>
      );
    }

    return typeof parsed === "object" && parsed?.type === "product_list" ? (
      <div key={m.id} className="w-full">
        {content}
      </div>
    ) : (
      <div
        key={m.id}
        className={`flex ${
          m.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`${
            m.role === "user"
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
      {/* POPUPS */}
      <FlipkartPhonePopup
        open={flow.showPhonePopup}
        phone={flow.phone}
        setPhone={flow.setPhone}
        onContinue={flow.handlePhoneSubmit}
        onCancel={() => flow.setShowPhonePopup(false)}
        loading={flow.loadingPhone}
      />

      <FlipkartSizePopup
        open={flow.showSizePopup}
        pendingProduct={flow.pendingProduct}
        availableSizes={flow.availableSizes}
        selectedSize={flow.selectedSize}
        setSelectedSize={flow.setSelectedSize}
        isClothingSearch={flow.isClothingSearch}
        loadingCart={flow.loadingCart}
        onContinue={flow.handleSizeSelect}
        onSkip={async () => {
          flow.setShowSizePopup(false);
          await flow.handleAddToCart();
        }}
      />

      <FlipkartOtpPopup
        open={flow.showOtpPopup}
        phone={flow.phone}
        otp={flow.otp}
        setOtp={flow.setOtp}
        onVerify={flow.handleOtpSubmit}
        onCancel={() => {
          flow.setShowOtpPopup(false);
          flow.setShowPhonePopup(true);
          flow.setOtp(""); // optional
        }}
        loading={flow.loadingOtp}
      />

      <FlipkartAddressPopup
        open={flow.showAddressPopup}
        addresses={flow.addresses}
        selectedAddressId={flow.selectedAddressId}
        setSelectedAddressId={flow.setSelectedAddressId}
        address={flow.address}
        setAddress={flow.setAddress}
        loadingBuy={flow.loadingBuy}
        onCancelExisting={() => {
          flow.setShowAddressPopup(false);
          pushSystem("Address selection cancelled.");
        }}
        onUseExisting={flow.handleBuy}
        onBuyWithNew={flow.handleBuyWithNewAddress}
      />

      <FlipkartUpiPopup
        open={flow.showUpiPopup}
        pendingProduct={flow.pendingProduct}
        upiId={flow.upiId}
        setUpiId={flow.setUpiId}
        onPay={flow.handleUpiSubmit}
        loading={flow.loadingPayment}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      {/* CONDITIONAL RENDERING FOR CHAT VS LANDING PAGE */}
      {showChat ? (
        <div className="relative min-h-screen w-full bg-black overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((m) => renderMessage(m))}
            {isLoading && <FlowerLoader />}
          </div>

          {/* Input */}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!messageInput.trim()) return;
                    setShowChat(true);
                    handleSend();
                  }
                }}
                placeholder="Search for products on Flipkart..."
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
              />

              <VoiceRecorderButton
                onTextReady={(text) =>
                  setMessageInput((prev) => (prev ? `${prev} ${text}` : text))
                }
              />

              <button
                type="submit"
                className={`p-2.5 rounded-full ${
                  messageInput
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
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
          title="Welcome to Flipkart Shopping!"
          subtitle="Search for any product you want to buy"
          searchPlaceholder="Search for products on Flipkart..."
          cardTitle="Flipkart Shopping"
          cardDescription="Search and buy products from Flipkart with voice commands"
        />
      )}
    </div>
  );
}
