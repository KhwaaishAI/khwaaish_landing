import React, { useState } from "react";
import FlowerLoader from "../components/FlowerLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";
import type { Message, ProductListMessage } from "../types/nykaa";
import { useNykaaFlow } from "../utils/hooks/useNykaaFlow";
import { nykaaSearch } from "../utils/api/nykaaApi";
import ProductGrid from "../components/nykaa/ProductGrid";
import SizePopup from "../components/nykaa/SizePopup";
import AddressPopup from "../components/nykaa/AddressPopup";
import UpiPopup from "../components/nykaa/UpiPopup";
import LandingView from "../components/LandingView";

const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITEAPIBASEURL;

export default function NykaaChat() {
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

  const flow = useNykaaFlow({ BaseURL, pushSystem });

  const handleSearch = async (query: string) => {
    console.log("NYKAA SEARCH: triggered with query =", query);
    setIsLoading(true);
    try {
      const { res, data } = await nykaaSearch(BaseURL, query);
      console.log("NYKAA SEARCH: response =", data);

      if (!res.ok) {
        pushSystem(data?.message || "Search failed. Please try again.");
        return;
      }

      const products = data.products || data.results || [];
      const payload: ProductListMessage = { type: "productlist", products };
      pushSystem(JSON.stringify(payload));
    } catch (err) {
      console.log("NYKAA SEARCH ERROR:", err);
      pushSystem("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!messageInput.trim()) return;
    setShowChat(true);

    const userText = messageInput;
    setMessageInput("");

    pushUser(userText);
    await handleSearch(userText);
  };

  const getAvailableSizes = (p: any): string[] => {
    const raw = p?.available_sizes;

    const arr = Array.isArray(raw) ? raw : [];

    // normalize + remove junk
    const cleaned = arr.map((s) => String(s).trim()).filter(Boolean);

    // unique
    return Array.from(new Set(cleaned));
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
          <ProductGrid
            products={parsed.products || []}
            selectedProduct={flow.pendingProduct}
            onSelect={(p) => flow.openSizeForProduct(p)}
          />
        </div>
      );
    }

    // Reuse your "Order Confirmed UI" behavior:
    if (
      (typeof parsed === "object" &&
        String(parsed?.status || "").toLowerCase() === "success") ||
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
              Your fashion item will be delivered soon.
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
          className={`max-w-[85%] rounded-2xl px-4 py-3 border ${
            m.role === "user"
              ? "bg-white/15 text-white border-white/20"
              : "bg-gray-900/80 text-gray-100 border-gray-800"
          }`}
        >
          <p className="text-sm sm:text-base leading-relaxed">{text}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* Popups */}
      <SizePopup
        open={flow.showSizePopup}
        productBrand={flow.pendingProduct?.brand}
        productName={flow.pendingProduct?.name}
        productPrice={flow.pendingProduct?.price}
        sizes={
          flow.pendingProduct ? getAvailableSizes(flow.pendingProduct) : []
        }
        selectedSize={flow.selectedSize}
        onSelectSize={flow.setSelectedSize}
        onAddToCart={flow.openAddressPopupForCart}
        onClose={() => flow.setShowSizePopup(false)}
        loading={flow.loadingCart}
      />

      <AddressPopup
        open={flow.showAddressPopup}
        address={flow.nykaaAddress}
        setAddress={flow.setNykaaAddress}
        onSave={flow.handleNykaaAddToCart}
        onClose={() => flow.setShowAddressPopup(false)}
        loading={flow.loadingCart}
      />

      <UpiPopup
        open={flow.showUpiPopup}
        upiId={flow.upiId}
        setUpiId={(v) => flow.setUpiId(v)}
        onPay={flow.handleNykaaUpiSubmit}
        onClose={() => flow.setShowUpiPopup(false)}
        loading={flow.loadingPayment}
      />

      {/* Chat */}
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
                placeholder="What is your khwaaish?"
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
          title="Welcome to Nykaa Shopping!"
          subtitle="Search for any product you want to buy"
          searchPlaceholder="Search for products on Nykaa..."
          cardTitle="Nykaa Shopping"
          cardDescription="Search and buy products from Nykaa with voice commands"
        />
      )}
    </div>
  );
}
