import { useEffect, useRef, useState } from "react";
import VoiceRecorderButton from "./VoiceRecorderButton";

type Message = {
  role: "user" | "system";
  text: string;
  time: string;
};

const API_BASE_URL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const timeNow = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMsg: Message = {
      role: "user",
      text: messageText,
      time: timeNow(),
    };

    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Call the API
      const response = await fetch(`${API_BASE_URL}/api/ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      setIsTyping(false);
      setMessages((p) => [
        ...p,
        {
          role: "system",
          text: data.response || data.message || "I'm here to help! How can I assist you?",
          time: timeNow(),
        },
      ]);
    } catch (error) {
      console.error("Error calling AI API:", error);
      setIsTyping(false);
      setMessages((p) => [
        ...p,
        {
          role: "system",
          text: "Sorry, I'm having trouble connecting. Please try again.",
          time: timeNow(),
        },
      ]);
    }
  };

  const handleVoiceText = (text: string) => {
    setInput(text);
    sendMessage(text);
  };

  return (
    <>
      {/* Glass overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Floating Bot Button - Collapsed */}
      {!open && (
        <div
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 cursor-pointer group"
        >
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full bg-red-600/20 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-red-600/40 animate-pulse" />

          {/* Bot Image */}
          <div className="relative w-16 h-16 rounded-full bg-black border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.6)] overflow-hidden hover:scale-110 transition-transform duration-300">
            <img
              src="/images/bot.png"
              alt="Khwaaish Bot"
              className="w-full h-full object-cover animate-bounce"
              style={{ animationDuration: "3s" }}
            />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black border border-red-600 rounded-lg text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            Chat with me! 💬
          </div>
        </div>
      )}

      {/* Expanded Chat Panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full sm:w-[420px] bg-black border-l-2 border-red-600 transition-all duration-500 transform shadow-[0_0_50px_rgba(220,38,38,0.3)] ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-black">
          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-red-600/20 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Bot Avatar & Title */}
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-800 p-0.5 shadow-lg shadow-red-600/50">
              <div className="w-full h-full rounded-full bg-black overflow-hidden">
                <img
                  src="/images/bot.png"
                  alt="Bot"
                  className="w-full h-full object-cover animate-pulse"
                  style={{ animationDuration: "4s" }}
                />
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold">
                <span className="bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent">
                  Khwaaish AI
                </span>
              </h2>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Online • Ready to help
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 h-[calc(100vh-180px)] overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center space-y-4 mt-20">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-600 to-red-800 p-0.5 shadow-lg shadow-red-600/50 animate-bounce">
                <div className="w-full h-full rounded-full bg-black overflow-hidden">
                  <img
                    src="/images/bot.png"
                    alt="Bot"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-white/70 text-lg font-medium animate-pulse">
                  Hey! I'm here to help 👋
                </p>
                <p className="text-white/50 text-sm">
                  What's your khwaaish today?
                </p>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-fade-in ${m.role === "user" ? "justify-end" : "justify-start"
                }`}
              style={{
                animation: "fadeIn 0.5s ease-in-out",
              }}
            >
              {m.role === "system" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 p-0.5 flex-shrink-0 shadow-lg shadow-red-600/30">
                  <div className="w-full h-full rounded-full bg-black overflow-hidden">
                    <img
                      src="/images/bot.png"
                      alt="Bot"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-lg ${m.role === "user"
                  ? "bg-gradient-to-br from-red-600 to-red-700 text-white rounded-br-md shadow-red-600/30 border border-red-500/30"
                  : "bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-bl-md border border-red-600/20"
                  }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                <span className="block mt-1.5 text-[10px] text-white/40 text-right">
                  {m.time}
                </span>
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
                  U
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 p-0.5 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-black overflow-hidden">
                  <img
                    src="/images/bot.png"
                    alt="Bot"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-3 rounded-2xl rounded-bl-md border border-red-600/20">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black">
          {/* Bot Image above input */}
          <div className="flex justify-center mb-3">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 p-0.5 shadow-lg shadow-red-600/50 animate-pulse">
              <div className="w-full h-full rounded-full bg-black overflow-hidden">
                <img
                  src="/images/bot.png"
                  alt="Bot"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask me anything..."
                className="w-full rounded-xl bg-gray-900 border-2 border-red-600/30 px-4 py-3 pr-12 text-white placeholder-gray-500 outline-none focus:border-red-600 transition-colors shadow-inner"
              />
              {/* Microphone icon inside input */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceRecorderButton onTextReady={handleVoiceText} />
              </div>
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="rounded-xl bg-gradient-to-br from-red-600 to-red-700 px-5 py-3 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #dc2626;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ef4444;
        }
      `}</style>
    </>
  );
}
