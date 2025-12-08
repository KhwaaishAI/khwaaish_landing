import { useEffect, useRef, useState } from "react";

const API_ENDPOINT = import.meta.env.VITE_CHAT2_API;

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function Chat2() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = messageInput.trim();
    if (!text) return;

    const newMsg: Message = {
      id: Date.now(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageInput("");

    setIsLoading(true);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const botReply = data?.reply ?? "No response.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: botReply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Something went wrong. Try again.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const formatContent = (raw: string) => {
    const lines = raw.split("\n");

    return lines.map((line, index) => {
      let formatted = line;

      formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      formatted = formatted.replace(
        /([🛍️📋🎯💡📝💬❌🔍💰📦])/g,
        '<span class="text-xl">$1</span>'
      );

      return (
        <p
          key={index}
          className="text-sm sm:text-base leading-relaxed mb-2 last:mb-0"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  const renderAssistantContent = (raw: string) => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    if (parsed && typeof parsed === "object" && parsed.type === "product_list") {
      const products = parsed.products?.slice(0, 16) || [];

      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold mb-2">Here are some options:</h3>
          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
              {products.map((p: any, index: number) => {
                const key = (p.name || p.title || "") + (p.price || p.dmart_price || "") + index;
                const isSelected = selectedKey === key;

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={`relative flex flex-col bg-[#11121a] rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-colors ${
                      isSelected ? "bg-[#181924]" : "hover:bg-[#151622]"
                    }`}
                  >
                    {p.image_url && (
                      <div className="relative w-full h-36 bg-gray-800">
                        <img
                          src={p.image_url}
                          alt={p.name || p.title || "Item"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="flex-1 flex flex-col px-3 py-3 gap-2">
                      <div className="min-h-[48px] space-y-1">
                        <p className="text-sm font-semibold text-white line-clamp-2">
                          {p.name || p.title || "Untitled"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        {p.price || p.dmart_price ? (
                          <p className="text-base font-bold text-white">
                            ₹{p.price || p.dmart_price}
                          </p>
                        ) : (
                          <span className="text-xs text-gray-400">No price</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return formatContent(raw);
  };

  return (
    <div className="relative w-full h-screen bg-black text-white flex flex-col justify-between">
      {/* Chat container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`${
                msg.role === "user"
                  ? "bg-white/15 text-white border-white/20"
                  : "bg-gray-900/80 text-gray-100 border-gray-800"
              } max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-3 border`}
            >
              {msg.role === "assistant"
                ? renderAssistantContent(msg.content)
                : formatContent(msg.content)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl px-4 py-3 text-gray-300 text-sm animate-pulse">
              Typing…
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="px-4 sm:px-6 py-4 bg-black/70 border-t border-white/10 backdrop-blur"
      >
        <div className="flex items-center gap-3 rounded-full px-4 py-3 border border-gray-800 bg-white/10 backdrop-blur">
          <input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 bg-transparent text-white placeholder-white/60 outline-none text-sm sm:text-base"
          />

          <button
            type="submit"
            className={`p-2 rounded-full ${
              messageInput
                ? "bg-red-600 hover:bg-red-500"
                : "bg-white/20 hover:bg-white/30"
            } transition`}
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
