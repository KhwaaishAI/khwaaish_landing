// src/pages/Flipkart/components/ChatView.tsx

import React from "react";

import ProductListMessage from "./ProductListMessage";
import type { Message, Product } from "../../types/flipkart";
import FlowerLoader from "../FlowerLoader";
import VoiceRecorderButton from "../VoiceRecorderButton";

type Props = {
  messages: Message[];
  pendingProduct: Product | null;
  lastSearchQuery: string;

  isLoading: boolean;

  messageInput: string;
  setMessageInput: (v: string) => void;

  onSend: () => void;
  onProductSelect: (p: Product) => void;
};

export default function ChatView({
  messages,
  pendingProduct,
  lastSearchQuery,
  isLoading,
  messageInput,
  setMessageInput,
  onSend,
  onProductSelect,
}: Props) {
  const renderFormatted = (text: string) => {
    return text.split("\n").map((line, i) => {
      let formatted = line;
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      return (
        <p
          key={i}
          className="text-sm sm:text-base leading-relaxed mb-2 last:mb-0"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
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
        <ProductListMessage
          products={parsed.products}
          pendingProduct={pendingProduct}
          lastSearchQuery={lastSearchQuery}
          onSelect={onProductSelect}
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
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      <div className="flex-1 h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((m) => renderMessage(m))}
        {isLoading && <FlowerLoader />}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="absolute bottom-0 left-0 right-0 z-40 mx-auto max-w-4xl px-4 py-4 
                     bg-gradient-to-t from-black/80 via-black/40 to-transparent"
      >
        <div className="flex items-center gap-3 rounded-full px-4 py-3 border border-gray-800 bg-white/10 backdrop-blur">
          <input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!messageInput.trim()) return;
                onSend();
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
  );
}
