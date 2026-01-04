import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "system";
  text: string;
  time: string;
};

export default function KhwaaishGPT() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const timeNow = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      role: "user",
      text: input,
      time: timeNow(),
    };

    setMessages((p) => [...p, userMsg]);
    setInput("");

    // simulate API
    setTimeout(() => {
      setMessages((p) => [
        ...p,
        {
          role: "system",
          text: "I hear you. Tell me more about your khwaaish.",
          time: timeNow(),
        },
      ]);
    }, 700);
  };

  return (
    <>
      {/* Glass overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Collapsed Card */}
      {!open && (
        <div
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-72 h-80 flex flex-col justify-between cursor-pointer rounded-2xl bg-black text-white shadow-2xl border border-white/10 p-4 space-y-3 hover:scale-[1.02] transition"
        >
          <div className="text-sm font-medium w-full text-center">
            Hi, I am <span className="text-red-500">KhwaaishGPT</span>
          </div>

          <div className="w-full h-full relative ">
            <span className="absolute top-1/3 left-1/2 bg-gray-600 py-2 px-3 rounded-bl-xl rounded-t-xl text-xs">Compare Hotels <br /> in Mumbai</span>
            <span className="absolute ">Compare Cabs for me</span>
          </div>

          <div className="w-full rounded-lg bg-white/5 px-3 py-2 text-white/40 text-sm">
            Ask me anything…
          </div>
        </div>
      )}

      {/* Expanded Chat */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[380px] bg-black border-l border-white/10 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="text-lg font-semibold">
            Khwaaish<span className="text-red-500">GPT</span>
          </div>
          <div className="text-xs text-white/50">
            Your wishes, thoughtfully answered
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/50 text-sm mt-20">
              What’s on your mind today?
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "bg-red-600 text-white rounded-br-md"
                    : "bg-white/10 text-white backdrop-blur-sm rounded-bl-md"
                }`}
              >
                <p>{m.text}</p>
                <span className="block mt-1 text-[10px] text-white/50 text-right">
                  {m.time}
                </span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="What’s your khwaaish"
              className="flex-1 rounded-xl bg-white/10 px-4 py-2 text-white placeholder-white/40 outline-none"
            />
            <button
              onClick={sendMessage}
              className="rounded-xl bg-red-600 px-4 text-white hover:bg-red-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
