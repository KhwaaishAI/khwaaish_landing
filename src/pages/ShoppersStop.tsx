import React, { useState } from "react";
import FlowerLoader from "../components/FlowerLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";
import LandingView from "../components/LandingView";

import type { Message, ProductListMessageSS } from "../types/shoppersstop";
import { shoppersstopSearch } from "../utils/api/shoppersstopApi";
import { useShoppersStopFlow } from "../utils/hooks/useShoppersStopFlow";

import ShoppersStopProductGrid from "../components/shoppersstop/ShoppersStopProductGrid";
import ShoppersStopProductPopup from "../components/shoppersstop/ShoppersStopProductPopup";
import ShoppersStopOtpPopup from "../components/shoppersstop/ShoppersStopOtpPopup";
import ShoppersStopSignupPopup from "../components/shoppersstop/ShoppersStopSignupPopup";
import ShoppersStopSelectAddressPopup from "../components/shoppersstop/ShoppersStopSelectAddressPopup";
import ShoppersStopAddAddressPopup from "../components/shoppersstop/ShoppersStopAddAddressPopup";
import ShoppersStopUpiPopup from "../components/shoppersstop/ShoppersStopUpiPopup";

const BaseURL = import.meta.env.DEV ? import.meta.env.VITE_API_BASE_URL : "";

export default function ShoppersStopChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pushSystem = (text: string) => {
    console.log("SHOPPERSSTOP pushSystem:", text);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "system", content: text },
    ]);
  };

  const pushUser = (text: string) => {
    console.log("SHOPPERSSTOP pushUser:", text);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);
  };

  const flow = useShoppersStopFlow({ BaseURL, pushSystem });

  const handleSearch = async (query: string) => {
    console.log("SHOPPERSSTOP SEARCH triggered:", query);
    setIsLoading(true);

    try {
      const { res, data, body } = await shoppersstopSearch(BaseURL, query);
      console.log(
        "SHOPPERSSTOP SEARCH POST /api/shoppersstop/search body:",
        body
      );
      console.log("SHOPPERSSTOP SEARCH response:", data);

      if (!res.ok || String(data?.status).toLowerCase() !== "success") {
        pushSystem(data?.message || "Search failed. Please try again.");
        return;
      }

      const products = Array.isArray(data?.products) ? data.products : [];
      const payload: ProductListMessageSS = {
        type: "productlist_shoppersstop",
        products,
      };
      pushSystem(JSON.stringify(payload));
    } catch (err) {
      console.log("SHOPPERSSTOP SEARCH ERROR:", err);
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
    flow.closeAllPopups();
  };

  const renderMessage = (m: Message) => {
    let parsed: any;
    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    if (
      typeof parsed === "object" &&
      parsed?.type === "productlist_shoppersstop"
    ) {
      return (
        <div key={m.id} className="w-full">
          <ShoppersStopProductGrid
            products={parsed.products}
            selectedProductUrl={flow.pendingProduct?.url || null}
            onSelect={(p) => flow.openProductAndFetchSizes(p)}
          />
        </div>
      );
    }

    // success bubble
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
            <p className="font-semibold text-green-400">Payment triggered!</p>
            <p className="text-sm text-green-300 mt-1">
              Complete approval in your UPI app.
            </p>
          </div>
        </div>
      );
    }

    const text = typeof parsed === "string" ? parsed : JSON.stringify(parsed);

    return (
      <div
        key={m.id}
        className={[
          "flex",
          m.role === "user" ? "justify-end" : "justify-start",
        ].join(" ")}
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
      {/* Popups */}
      <ShoppersStopProductPopup
        open={flow.showProductPopup}
        loading={flow.loadingView}
        loadingAddToCart={flow.loadingAddToCart}
        productTitle={flow.pendingProduct?.title}
        productPrice={flow.pendingProduct?.price}
        sizes={flow.sizesToShow}
        selectedSize={flow.selectedSize}
        onSelectSize={flow.setSelectedSize}
        phone={flow.phone}
        setPhone={flow.setPhone}
        bill={flow.bill}
        onAddToCart={flow.handleAddToCart}
        onClose={() => flow.setShowProductPopup(false)}
      />

      <ShoppersStopOtpPopup
        open={flow.showOtpPopup}
        otp={flow.otp}
        setOtp={flow.setOtp}
        bill={flow.bill}
        onVerifyOtp={flow.verifyOtpAndContinue}
        onCancelBack={flow.backToProductFromOtp}
        loadingVerify={flow.loadingVerifyOtp || flow.loadingSaveAddress} // ✅ add this
      />

      <ShoppersStopSignupPopup
        open={flow.showSignupPopup}
        signup={flow.signup}
        setSignup={flow.setSignup}
        onSubmit={flow.submitSignupThenContinue}
        onCancelBack={flow.backToOtpFromSignup}
        loading={flow.loadingSignup || flow.loadingSaveAddress}
      />

      <ShoppersStopSelectAddressPopup
        open={flow.showSelectAddressPopup}
        addresses={flow.addresses}
        selectedAddressId={flow.selectedAddressId}
        setSelectedAddressId={flow.setSelectedAddressId}
        bill={flow.bill}
        onContinue={flow.proceedAfterAddressSelected}
        onCancelBack={flow.backToOtpFromAddressSelection}
        loading={flow.loadingSaveAddress}
      />

      <ShoppersStopAddAddressPopup
        open={flow.showAddAddressPopup}
        addAddress={flow.addAddress}
        setAddAddress={flow.setAddAddress}
        onSubmit={flow.submitAddAddressThenContinue}
        onCancelBack={flow.backToOtpFromAddAddress}
        loading={flow.loadingAddAddress}
      />

      <ShoppersStopUpiPopup
        open={flow.showUpiPopup}
        upiId={flow.upiId}
        setUpiId={flow.setUpiId}
        onPay={flow.payNow}
        onCancelBack={flow.backToAddressSelectionFromUpi}
        loading={flow.loadingPayment}
      />

      {showChat ? (
        <div className="relative min-h-screen w-full bg-black overflow-hidden">
          <div className="h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
            {messages.map(renderMessage)}
          </div>

          {isLoading ? <FlowerLoader /> : null}

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
                placeholder="Search Shoppers Stop products..."
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
          title="Welcome to Shoppers Stop Shopping!"
          subtitle="Search for any product you want to buy..."
          searchPlaceholder="Search for products on Shoppers Stop..."
          cardTitle="Shoppers Stop"
          cardDescription="Search and buy products from Shoppers Stop with OTP and UPI flow."
        />
      )}
    </div>
  );
}
