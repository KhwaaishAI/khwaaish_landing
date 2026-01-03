import React, { useState } from "react";

import FlowerLoader from "../components/FlowerLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";
import LandingView from "../components/LandingView";

import AmazonProductGrid from "../components/amazon/AmazonProductGrid";
import AmazonProductDetailsCard from "../components/amazon/AmazonProductDetailsCard";
import AmazonSizePopup from "../components/amazon/AmazonSizePopup";
import AmazonPhonePopup from "../components/amazon/AmazonPhonePopup";
import AmazonOtpPopup from "../components/amazon/AmazonOtpPopup";
import AmazonAddressPopup from "../components/amazon/AmazonAddressPopup";
import AmazonUpiPopup from "../components/amazon/AmazonUpiPopup";

import useAmazonFlow from "../utils/hooks/useAmazonFlow";
import AmazonSelectAddressPopup from "../components/amazon/AmazonSelectAddressPopup";

const BaseURL = import.meta.env.VITE_API_BASE_URL;

type Message = { id: string; role: "user" | "system"; content: string };

export default function Amazon() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");

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

  const flow = useAmazonFlow({
    BaseURL,
    pushSystem,
    pushUser,
    setIsLoading,
    setLastSearchQuery,
  });

  const onNewChat = () => {
    console.log("AMAZON UI: New chat");
    setShowChat(true);
    setMessages([]);
    setMessageInput("");
    flow.resetCheckoutPopups?.();
  };

  const handleSend = async () => {
    if (!messageInput.trim()) return;
    const q = messageInput;
    setShowChat(true);
    setMessageInput("");
    await flow.handleSearch(q);
  };

  const renderMessage = (m: Message) => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    if (typeof parsed === "object" && parsed?.type === "amazon_productlist") {
      return (
        <div key={m.id} className="w-full">
          <AmazonProductGrid
            products={parsed.products}
            onDetails={(p) => flow.handleOpenDetails(p)}
          />
        </div>
      );
    }

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
      {/* POPUPS */}
      <AmazonProductDetailsCard
        open={flow.showProductDetails}
        product={flow.selectedProduct}
        details={flow.details}
        loading={flow.loadingDetails}
        onClose={() => flow.setShowProductDetails(false)}
        onSelectSize={() => {
          flow.setShowProductDetails(false); // close details popup
          flow.setShowSizePopup(true); // open size popup
        }}
      />

      <AmazonSizePopup
        open={flow.showSizePopup}
        title={flow.details?.title}
        sizes={flow.details?.available_sizes || []}
        selectedSize={flow.selectedSize}
        setSelectedSize={flow.setSelectedSize}
        onContinue={flow.handleSizeContinue}
        onCancel={flow.cancelFromSize}
        loading={flow.loadingCart}
      />

      <AmazonPhonePopup
        open={flow.showPhonePopup}
        phone={flow.phone}
        setPhone={flow.setPhone}
        onContinue={flow.handlePhoneContinue}
        onCancel={flow.cancelFromPhone}
        loading={flow.loadingLogin}
      />

      <AmazonOtpPopup
        open={flow.showOtpPopup}
        phone={flow.phone}
        otp={flow.otp}
        setOtp={flow.setOtp}
        onVerify={flow.handleOtpVerify}
        onCancel={flow.cancelFromOtp}
        loading={flow.loadingOtp}
      />

      <AmazonSelectAddressPopup
        open={flow.showSelectAddressPopup}
        addresses={flow.shippingAddresses}
        selectedAddressIndex={flow.selectedAddressIndex}
        setSelectedAddressIndex={flow.setSelectedAddressIndex}
        loading={flow.loadingPayment}
        onCancel={flow.cancelFromSelectAddress}
        onPay={flow.handleProceedFromSelectAddress}
      />

      <AmazonAddressPopup
        open={flow.showAddressPopup}
        address={flow.address}
        setAddress={flow.setAddress}
        onSave={flow.handleSaveAddress}
        onCancel={flow.cancelFromAddress}
        loading={flow.loadingAddress}
      />

      <AmazonUpiPopup
        open={flow.showUpiPopup}
        upiId={flow.upiId}
        setUpiId={flow.setUpiId}
        onPay={flow.handlePayWithUpi}
        onCancel={flow.cancelFromUpi}
        loading={flow.loadingPayment}
        amountLabel={flow.details?.price}
      />

      {/* MAIN UI */}
      {showChat ? (
        <div className="relative min-h-screen w-full bg-black overflow-hidden">
          {/* <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-sm text-gray-300 hover:text-white">
                Back
              </Link>
              <div className="text-sm text-gray-200">
                Amazon Shopping {lastSearchQuery ? `• ${lastSearchQuery}` : ""}
              </div>
            </div>
            <button
              onClick={onNewChat}
              className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-gray-800"
            >
              New chat
            </button>
          </div> */}

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
                    handleSend();
                  }
                }}
                placeholder="Search for products on Amazon..."
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
              />
              <VoiceRecorderButton
                onTextReady={(t) =>
                  setMessageInput((p) => (p ? `${p} ${t}` : t))
                }
              />
              <button
                type="submit"
                className={`p-2.5 rounded-full ${
                  messageInput
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-white/20 hover:bg-white/30"
                } transition-colors`}
              >
                <span className="text-sm font-semibold">Send</span>
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
          onNewChat={onNewChat}
          title="Amazon Shopping"
          subtitle="Search and buy products from Amazon with voice chat."
          searchPlaceholder="Search for products on Amazon..."
          cardTitle="Amazon Shopping"
          cardDescription="Search products and complete checkout via UPI."
        />
      )}
    </div>
  );
}
