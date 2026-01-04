import React, { useState } from "react";
import FlowerLoader from "../components/FlowerLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";
import LandingView from "../components/LandingView";

import type { Message, ProductListMessageTataCliq } from "../types/tatacliq";
import { tatacliqSearch } from "../utils/api/tatacliqApi";
import useTataCliqFlow from "../utils/hooks/useTataCliqFlow";

import TataCliqProductGrid from "../components/tatacliq/TataCliqProductGrid";
import TataCliqProductPopup from "../components/tatacliq/TataCliqProductPopup";

const BaseURL = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_BASE_URL as string);

export default function TataCliqChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pushSystem = (text: string) => {
    console.log("TATACLIQ pushSystem:", text);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "system", content: text },
    ]);
  };

  const pushUser = (text: string) => {
    console.log("TATACLIQ pushUser:", text);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);
  };

  const flow = useTataCliqFlow({ BaseURL, pushSystem });

  const handleSearch = async (query: string) => {
    console.log("TATACLIQ SEARCH triggered:", query);

    setShowChat(true); // <-- add this
    setIsLoading(true);

    try {
      const result = await tatacliqSearch(BaseURL, query, 30);
      const { res, data, body } = result;

      console.log("TATACLIQ SEARCH POST /api/tatacliq/search body:", body);
      console.log("TATACLIQ SEARCH response:", data);

      const ok =
        res.ok && String(data?.status || "").toLowerCase() === "success";
      if (!ok) {
        pushSystem(data?.message || "Search failed. Please try again.");
        return;
      }

      const products = Array.isArray(data?.products) ? data.products : [];
      pushSystem(JSON.stringify({ type: "productlisttatacliq", products }));
    } catch (err) {
      console.log("TATACLIQ SEARCH ERROR:", err);
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

    if (typeof parsed === "object" && parsed?.type === "productlisttatacliq") {
      return (
        <div key={m.id} className="w-full">
          <TataCliqProductGrid
            products={parsed.products}
            selectedProductUrl={flow.pendingProduct?.url || null}
            onSelect={(p) => flow.openProductAndFetchSizes(p)}
          />
        </div>
      );
    }

    // green success bubble (based on your requirement: show Success message in chat)
    if (
      (typeof parsed === "string" &&
        parsed.toLowerCase().startsWith("success")) ||
      (typeof parsed === "object" &&
        String(parsed?.status || "")
          .toLowerCase()
          .includes("success"))
    ) {
      return (
        <div
          key={m.id}
          className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-600 rounded-xl"
        >
          <div>
            <p className="font-semibold text-green-400">Success!</p>
            <p className="text-sm text-green-300 mt-1">
              {typeof parsed === "string" ? parsed : JSON.stringify(parsed)}
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
      {/* Popup */}
      <TataCliqProductPopup
        open={flow.showProductPopup}
        loading={flow.loadingView}
        loadingAddToCart={flow.loadingAddToCart}
        productTitle={flow.pendingProduct?.title}
        productPrice={flow.pendingProduct?.price || undefined}
        sizes={flow.sizesToShow}
        selectedSize={flow.selectedSize}
        onSelectSize={flow.setSelectedSize}
        phone={flow.phone}
        setPhone={flow.setPhone}
        onAddToCart={flow.handleAddToCart}
        onCancel={flow.cancelProductPopup}
      />

      {showChat ? (
        <div className="relative min-h-screen w-full bg-black overflow-hidden">
          <div className="h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4 max-w-4xl mx-auto">
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
                placeholder="Search TataCliq products..."
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
          title="Welcome to TataCliq Shopping!"
          subtitle="Search for any product you want to buy from TataCliq."
          searchPlaceholder="Search for products on TataCliq..."
          cardTitle="TataCliq"
          cardDescription="Search products, view sizes, and add to cart using phone + size."
        />
      )}
    </div>
  );
}
