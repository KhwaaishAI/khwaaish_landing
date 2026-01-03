import React, { useState } from "react";

import FlowerLoader from "../components/FlowerLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";
import LandingView from "../components/LandingView";

import FlipkartProductGrid from "../components/flipkart/FlipkartProductGrid";
import AmazonProductGrid from "../components/amazon/AmazonProductGrid";

import FlipkartPhonePopup from "../components/flipkart/FlipkartPhonePopup";
import FlipkartSizePopup from "../components/flipkart/FlipkartSizePopup";
import FlipkartOtpPopup from "../components/flipkart/FlipkartOtpPopup";
import FlipkartAddressPopup from "../components/flipkart/FlipkartAddressPopup";
import FlipkartUpiPopup from "../components/flipkart/FlipkartUpiPopup";

import AmazonProductDetailsCard from "../components/amazon/AmazonProductDetailsCard";
import AmazonSizePopup from "../components/amazon/AmazonSizePopup";
import AmazonPhonePopup from "../components/amazon/AmazonPhonePopup";
import AmazonOtpPopup from "../components/amazon/AmazonOtpPopup";
import AmazonAddressPopup from "../components/amazon/AmazonAddressPopup";
import AmazonUpiPopup from "../components/amazon/AmazonUpiPopup";
import AmazonSelectAddressPopup from "../components/amazon/AmazonSelectAddressPopup";

import useCombinedSearchFlow from "../utils/hooks/useCombinedSearchFlow";

const BaseURL = import.meta.env.VITE_API_BASE_URL;

type Message = { id: string; role: "user" | "system"; content: string };

export default function Combined() {
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

  const flow = useCombinedSearchFlow({
    BaseURL,
    pushSystem,
    pushUser,
    setIsLoading,
    setLastSearchQuery,
  });

  const handleSend = async () => {
    if (!messageInput.trim()) return;

    setShowChat(true);
    const q = messageInput.trim();
    setMessageInput("");

    await flow.handleSearch(q);
  };

  const handleNewChat = () => {
    setShowChat(true);
    setMessages([]);
    setMessageInput("");
    flow.resetAllPopups();
  };

  const renderMessage = (m: Message) => {
    let parsed: any;
    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    // 1) Combined results bubble (stacked grids)
    if (typeof parsed === "object" && parsed?.type === "combinedproductlist") {
      const flipkartProducts = parsed?.flipkart?.products || [];
      const amazonProducts = parsed?.amazon?.products || [];

      return (
        <div key={m.id} className="w-full">
          <div className="space-y-4">
            <div className="text-sm text-gray-300">Flipkart results</div>
            <FlipkartProductGrid
              products={flipkartProducts}
              pendingProduct={flow.flipkartFlow.pendingProduct}
              lastSearchQuery={lastSearchQuery}
              onSelect={(p) => flow.onFlipkartSelect(p)}
            />

            <div className="text-sm text-gray-300 mt-6">Amazon results</div>
            <AmazonProductGrid
              products={amazonProducts}
              onDetails={(p) => flow.onAmazonSelect(p)}
            />
          </div>
        </div>
      );
    }

    // 2) Keep existing success rendering style (both flows use {type:"ordersuccess"})
    if (typeof parsed === "object" && parsed?.type === "ordersuccess") {
      return (
        <div
          key={m.id}
          className="w-full p-4 bg-green-900/20 border border-green-600 rounded-xl"
        >
          <div className="text-green-300 font-semibold">
            Order/Payment status
          </div>
          <div className="text-sm text-green-200 mt-1">{parsed.message}</div>
        </div>
      );
    }

    // 3) Default chat bubble rendering (same general style)
    return (
      <div
        key={m.id}
        className={`flex ${
          m.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 border ${
            m.role === "user"
              ? "bg-white/15 text-white border-white/20"
              : "bg-gray-900/80 text-gray-100 border-gray-800"
          }`}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {typeof parsed === "string" ? parsed : String(parsed)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* POPUPS: Flipkart */}
      <FlipkartPhonePopup
        open={flow.flipkartFlow.showPhonePopup}
        phone={flow.flipkartFlow.phone}
        setPhone={flow.flipkartFlow.setPhone}
        onContinue={flow.flipkartFlow.handlePhoneSubmit}
        loading={flow.flipkartFlow.loadingPhone}
      />

      <FlipkartSizePopup
        open={flow.flipkartFlow.showSizePopup}
        pendingProduct={flow.flipkartFlow.pendingProduct}
        availableSizes={flow.flipkartFlow.availableSizes}
        selectedSize={flow.flipkartFlow.selectedSize}
        setSelectedSize={flow.flipkartFlow.setSelectedSize}
        isClothingSearch={flow.flipkartFlow.isClothingSearch}
        loadingCart={flow.flipkartFlow.loadingCart}
        onContinue={flow.flipkartFlow.handleSizeSelect}
        onSkip={async () => {
          flow.flipkartFlow.setShowSizePopup(false);
          await flow.flipkartFlow.handleAddToCart();
        }}
      />

      <FlipkartOtpPopup
        open={flow.flipkartFlow.showOtpPopup}
        phone={flow.flipkartFlow.phone}
        otp={flow.flipkartFlow.otp}
        setOtp={flow.flipkartFlow.setOtp}
        onVerify={flow.flipkartFlow.handleOtpSubmit}
        loading={flow.flipkartFlow.loadingOtp}
      />

      <FlipkartAddressPopup
        open={flow.flipkartFlow.showAddressPopup}
        addresses={flow.flipkartFlow.addresses}
        selectedAddressId={flow.flipkartFlow.selectedAddressId}
        setSelectedAddressId={flow.flipkartFlow.setSelectedAddressId}
        address={flow.flipkartFlow.address}
        setAddress={flow.flipkartFlow.setAddress}
        loadingBuy={flow.flipkartFlow.loadingBuy}
        onCancelExisting={() => {
          flow.flipkartFlow.setShowAddressPopup(false);
          pushSystem("Address selection cancelled.");
        }}
        onUseExisting={flow.flipkartFlow.handleBuy}
        onBuyWithNew={flow.flipkartFlow.handleBuyWithNewAddress}
      />

      <FlipkartUpiPopup
        open={flow.flipkartFlow.showUpiPopup}
        pendingProduct={flow.flipkartFlow.pendingProduct}
        upiId={flow.flipkartFlow.upiId}
        setUpiId={flow.flipkartFlow.setUpiId}
        onPay={flow.flipkartFlow.handleUpiSubmit}
        loading={flow.flipkartFlow.loadingPayment}
      />

      {/* POPUPS: Amazon */}
      <AmazonProductDetailsCard
        open={flow.amazonFlow.showProductDetails}
        product={flow.amazonFlow.selectedProduct}
        details={flow.amazonFlow.details}
        loading={flow.amazonFlow.loadingDetails}
        onClose={() => flow.amazonFlow.setShowProductDetails(false)}
        onSelectSize={() => {
          flow.amazonFlow.setShowProductDetails(false);
          flow.amazonFlow.setShowSizePopup(true);
        }}
      />

      <AmazonSizePopup
        open={flow.amazonFlow.showSizePopup}
        title={flow.amazonFlow.details?.title}
        sizes={flow.amazonFlow.details?.available_sizes || []}
        selectedSize={flow.amazonFlow.selectedSize}
        setSelectedSize={flow.amazonFlow.setSelectedSize}
        onContinue={flow.amazonFlow.handleSizeContinue}
        onCancel={flow.amazonFlow.cancelFromSize}
        loading={flow.amazonFlow.loadingCart}
      />

      <AmazonPhonePopup
        open={flow.amazonFlow.showPhonePopup}
        phone={flow.amazonFlow.phone}
        setPhone={flow.amazonFlow.setPhone}
        onContinue={flow.amazonFlow.handlePhoneContinue}
        onCancel={flow.amazonFlow.cancelFromPhone}
        loading={flow.amazonFlow.loadingLogin}
      />

      <AmazonOtpPopup
        open={flow.amazonFlow.showOtpPopup}
        phone={flow.amazonFlow.phone}
        otp={flow.amazonFlow.otp}
        setOtp={flow.amazonFlow.setOtp}
        onVerify={flow.amazonFlow.handleOtpVerify}
        onCancel={flow.amazonFlow.cancelFromOtp}
        loading={flow.amazonFlow.loadingOtp}
      />

      <AmazonSelectAddressPopup
        open={flow.amazonFlow.showSelectAddressPopup}
        addresses={flow.amazonFlow.shippingAddresses}
        selectedAddressIndex={flow.amazonFlow.selectedAddressIndex}
        setSelectedAddressIndex={flow.amazonFlow.setSelectedAddressIndex}
        loading={flow.amazonFlow.loadingPayment}
        onCancel={flow.amazonFlow.cancelFromSelectAddress}
        onPay={flow.amazonFlow.handleProceedFromSelectAddress}
      />

      <AmazonAddressPopup
        open={flow.amazonFlow.showAddressPopup}
        address={flow.amazonFlow.address}
        setAddress={flow.amazonFlow.setAddress}
        onSave={flow.amazonFlow.handleSaveAddress}
        onCancel={flow.amazonFlow.cancelFromAddress}
        loading={flow.amazonFlow.loadingAddress}
      />

      <AmazonUpiPopup
        open={flow.amazonFlow.showUpiPopup}
        upiId={flow.amazonFlow.upiId}
        setUpiId={flow.amazonFlow.setUpiId}
        onPay={flow.amazonFlow.handlePayWithUpi}
        onCancel={flow.amazonFlow.cancelFromUpi}
        loading={flow.amazonFlow.loadingPayment}
        amountLabel={flow.amazonFlow.details?.price}
      />

      {/* Mobile overlay for sidebar (same pattern as Flipkart/Amazon) */}
      {sidebarOpen ? (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      ) : null}

      {/* Main UI: Chat vs LandingView (same pattern) */}
      {showChat ? (
        <div className="relative min-h-screen w-full bg-black overflow-hidden">
          <div className="flex-1 h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!messageInput.trim()) return;
                    setShowChat(true);
                    handleSend();
                  }
                }}
                placeholder="Search for products on Flipkart + Amazon..."
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
              />

              <VoiceRecorderButton
                onTextReady={(text) =>
                  setMessageInput((prev) => (prev ? prev + " " + text : text))
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
                    strokeWidth="2"
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleNewChat}
                className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-gray-800"
              >
                New chat
              </button>
            </div> */}
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
          title="Combined Shopping"
          subtitle="Search Flipkart + Amazon together, then checkout on either."
          searchPlaceholder="Search for products on Flipkart + Amazon..."
          cardTitle="Combined Shopping"
          cardDescription="Search results are stacked: Flipkart first, then Amazon."
        />
      )}
    </div>
  );
}
