import { useState } from "react";
import { Link } from "react-router-dom";
import VoiceRecorderButton from "../components/VoiceRecorderButton";
import RideComparison from "./RideComparison";
// Last working Code!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
interface Message {
  role: "user" | "system" | "comparison";
  content: string;
  comparisonData?: {
    olaData?: any;
    rapidoData?: any;
    timestamp?: Date;
  };
}

export default function Cabs() {
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  // Book me a Bike from Ghatkoper East to Juhu Beach. My Number is 6350511150
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [olaOtp, setOlaOtp] = useState("");
  const [olaOtpPopup, setOlaOtpPopup] = useState(false);
  const [olaSessionId, setOlaSessionId] = useState("");

  async function handleSend() {
    setShowChat(true);
    pushUser(messageInput);
    setIsLoading(true);

    // 1️⃣ Create EMPTY comparison card immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "comparison",
        content: "Ride comparison results:",
        comparisonData: {
          olaData: undefined,
          rapidoData: undefined,
        },
      },
    ]);

    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: messageInput }),
    };

    // 2️⃣ RAPIDO API (FAST)
    fetch("https://api.khwaaish.com/api/rapido-llm/search", config)
      .then((res) => res.json())
      .then((data) => {
        updateComparison("rapido", data);
      })
      .catch(() => {
        updateComparison("rapido", { error: "Rapido failed" });
      });

    // 3️⃣ OLA API (SLOW)
    fetch("https://api.khwaaish.com/api/ola/location-login", config)
      .then((res) => res.json())
      .then((data) => {
        setOlaSessionId(data.session_id);
        updateComparison("ola", data);

        if (data.status === "otp_sent") {
          setOlaOtpPopup(true);
        }
      })
      .catch(() => {
        updateComparison("ola", { error: "Ola failed" });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function updateComparison(type: "ola" | "rapido", data: any) {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.role === "comparison"
          ? {
              ...msg,
              comparisonData: {
                ...msg.comparisonData,
                [type === "ola" ? "olaData" : "rapidoData"]: data,
              },
            }
          : msg
      )
    );
  }

  const pushSystem = (text: string) =>
    setMessages((prev) => [...prev, { role: "system", content: text }]);

  const pushUser = (text: string) =>
    setMessages((prev) => [...prev, { role: "user", content: text }]);

  const renderMessage = (message: Message) => {
    if (message.role === "comparison" && message.comparisonData) {
      return (
        <div key={`comparison-${Date.now()}`} className="my-4">
          <RideComparison
            olaData={message.comparisonData.olaData}
            rapidoData={message.comparisonData.rapidoData}
            prompt={messageInput}
            pushSystem={pushSystem}
          />
        </div>
      );
    }
    if (message.role === "system") {
      return (
        <div
          key={message.content}
          className={`flex ${message.role === "system" ? "justify-start" : ""}`}
        >
          <p className="max-w-[80%] py-2 px-3 text-white bg-gray-900 rounded-full">
            {message.content}
          </p>
        </div>
      );
    }
    return (
      <div
        key={message.content}
        className={`flex ${message.role === "user" ? "justify-end" : ""}`}
      >
        <p className="max-w-[80%] py-2 px-3 text-white bg-gray-800 rounded-full">
          {message.content}
        </p>
      </div>
    );
  };

  async function verifyOlaOTP() {
    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: olaSessionId,
        otp: olaOtp,
      }),
    };

    const response = await fetch(
      "https://api.khwaaish.com/api/ola/verify-otp",
      config
    );
    const data = await response.json();
    console.log(data);
    if (data.status === "success") {
      updateComparison("ola", data);
    }

    setOlaOtpPopup(false);
  }

  return (
    <>
      {showChat ? (
        <div className="relative min-h-screen w-full bg-black overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((m) => renderMessage(m))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
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
                    handleSend();
                  }
                }}
                placeholder="What is your khwaaish?"
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
      ) : (
        // Chat Interface No Changes Needed
        <div className="min-h-screen w-screen bg-black text-white">
          {/* Sidebar - always visible */}
          <aside
            className={
              `fixed left-0 top-0 z-40 h-full border-r border-gray-800 bg-black transition-transform duration-300 ` +
              `w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            }
          >
            {/* Logo and collapse */}
            <div className="flex justify-between items-center gap-2 px-4 py-3">
              {/* Brand logo - clicking opens sidebar if ever used when closed */}
              <button
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <img
                  src="/images/LOGO.png"
                  alt="Khwaaish AI"
                  className="h-12 w-auto sm:h-14 md:h-16 shrink-0 object-contain"
                />
              </button>
              {/* Collapse / Toggle inside sidebar */}
              <button
                aria-label="Toggle sidebar"
                className="inline-flex items-center justify-center rounded-lg p-1.5 hover:bg-gray-900"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* New Chat */}
            <div className="px-3">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                onClick={() => {
                  setShowChat(true);
                  //   setMessages([]);
                  setMessageInput("");
                }}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>New chat</span>
              </button>
            </div>

            {/* Sections */}
            <div className="mt-3 space-y-2 px-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>History</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Drafts</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col relative">
            {/* Top bar */}
            <div className="sticky top-0 left-0 right-0 z-20 p-2 flex items-center justify-between">
              {/* Sidebar toggle */}
              {!sidebarOpen && (
                <button
                  aria-label="Open sidebar"
                  className="absolute left-4 top-4 z-40 inline-flex items-center justify-center rounded-lg p-1 hover:bg-gray-900"
                  onClick={() => setSidebarOpen(true)}
                >
                  <img
                    src="/images/Circle.png"
                    alt="Open sidebar"
                    className="h-8 w-8 object-contain"
                  />
                </button>
              )}
              <div className="ml-auto flex items-center gap-3">
                <button className="p-2 hover:bg-gray-900 rounded-lg transition-colors">
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
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>
                <div className="p-2 hover:bg-gray-900 rounded-full transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    L
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3">
                  <img src="/images/LOGO.png" alt="" />
                </div>
                {/* Greeting */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl flex items-center justify-center sm:text-3xl font-semibold">
                    Good to see you Laksh....
                  </h2>
                  <p className="text-gray-400 text-base sm:text-lg">
                    What can I help you with today?
                  </p>
                </div>
                <div className="w-full relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Book me a Bike from Location A to Location B. My Number is 98295XXXXX"
                    className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleSend()}
                      className={`p-2 ${
                        messageInput
                          ? "bg-red-600 hover:bg-red-500"
                          : "bg-white/20 hover:bg-white/30"
                      } rounded-full transition-colors`}
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
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Card */}
                <div className="flex flex-wrap justify-center lg:flex-nowrap w-full gap-4">
                  <Link
                    to="/cabs"
                    className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
                  border border-gray-700 hover:border-yellow-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6"
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
                    <h3 className="text-lg font-semibold mb-2">Cabs</h3>
                    <p className="text-sm text-gray-400">
                      Book a Ride at best price possible
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
      {olaOtpPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-80">
            <h2 className="text-lg font-semibold mb-4 text-white">Enter OTP</h2>
            <input
              type="text"
              value={olaOtp}
              onChange={(e) => setOlaOtp(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Enter 6-digit OTP"
            />
            <button
              onClick={verifyOlaOTP}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              Verify
            </button>
          </div>
        </div>
      )}
    </>
  );
}
