import { useEffect, useRef, useState } from "react";

const API_ENDPOINT = import.meta.env.VITE_CHAT2_API;
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function Chat2() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const handleVoiceToggle = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        if (!ELEVENLABS_API_KEY) {
          console.error("VITE_ELEVENLABS_API_KEY is not set");
          stream.getTracks().forEach((t) => t.stop());
          setIsRecording(false);
          return;
        }

        try {
          const res = await fetch(ELEVENLABS_STT_URL, {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
              "Content-Type": "audio/webm",
            },
            body: blob,
          });

          if (!res.ok) {
            console.error("ElevenLabs STT error", res.status, res.statusText);
            return;
          }

          const data = await res.json();
          const text = data?.text || data?.transcript || "";
          if (text) {
            setMessageInput((prev) => (prev ? prev + " " + text : text));
          }
        } catch (err) {
          console.error("ElevenLabs STT request failed", err);
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          setIsRecording(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or failed", err);
    }
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
              {formatContent(msg.content)}
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
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-2 rounded-full border ${
              isRecording
                ? "bg-red-600 border-red-400"
                : "bg-white/10 border-white/30 hover:bg-white/20"
            } transition-colors`}
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
                d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3z" 
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-14 0m7 7v3"
              />
            </svg>
          </button>

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
