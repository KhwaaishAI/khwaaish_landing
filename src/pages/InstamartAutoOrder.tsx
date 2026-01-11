import { useState } from "react";
import FlowerLoader from "../components/FlowerLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";
import PopupLoader from "../components/PopupLoader";

// const BaseURL = import.meta.env.VITE_BASE_URL;

type Role = "user" | "system";

type Message = {
  id: string;
  role: Role;
  content: string;
};

// Order a Uncle Chips for me and my number is 6350511150 and upi id is aktheking17@ibl

// {
//   "status": "incomplete",
//   "message": "I couldn't find a logged-in session for mobile number 6350511150. Please sign up first using the /instamart/signup endpoint.",
//   "missing_params": [],
//   "error": "Session not found"
// }

export default function InstamartAutoOrder() {
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phonePopup, setPhonePopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [otpPopup, setOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [session_id, setSession_id] = useState("");

  const pushSystem = (text: string) =>
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "system", content: text },
    ]);

  const pushUser = (text: string) =>
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);

  function renderMessage(message: Message) {
    if (message.role === "system") {
      return (
        <div key={message.id} className="w-full flex justify-start">
          <p className="text-white px-4 py-2 rounded-lg bg-gray-800">
            {message.content}
          </p>
        </div>
      );
    }

    if (message.role === "user") {
      return (
        <div key={message.id} className="w-full flex justify-end">
          <p className="text-white px-4 py-2 rounded-lg bg-gray-800">
            {message.content}
          </p>
        </div>
      );
    }
  }

  async function handleSend() {
    setShowChat(true);
    setIsLoading(true);

    console.log("handleSend triggerd, messageInput: ", messageInput);
    try {
      const response = await fetch(
        `https://api.khwaaish.com/api/instamart/auto-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: messageInput,
          }),
        }
      );
      console.log("Response: ", response);
      const data = await response.json();
      console.log("Data: ", data);

      if (data.status === "incomplete") {
        setPhonePopup(true);
        return;
      } else if (data.status === "success") {
        pushSystem("Order Placed Successfully, Please complete the payment on your UPI App.");
        return;
      } else {
        pushSystem(data.response);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error in handleSend: ", error);
      setIsLoading(false);
    }
  }

  async function handleLogin() {
    setLoadingPhone(true);

    try {
      const response = await fetch(
        `https://api.khwaaish.com/api/instamart/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile_number: phoneNumber,
            name: "",
            gmail: "",
            location: location,
          }),
        }
      );
      console.log("Response: ", response);
      const data = await response.json();
      console.log("Data: ", data);
      setSession_id(data.session_id);
      setLoadingPhone(false);
      setPhonePopup(false);
      setOtpPopup(true);
    } catch (error) {
      console.error("Error in handleSend: ", error);
      setLoadingPhone(false);
    }
  }

  async function handleOtp() {
    setLoadingOtp(true);

    try {
      const response = await fetch(
        `https://api.khwaaish.com/api/instamart/submit-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: session_id,
            otp: otp,
          }),
        }
      );
      console.log("Response: ", response);
      const data = await response.json();
      console.log("Data: ", data);

      if (data.status === "success") {
        pushSystem("OTP Submitted Successfully, Executing Your Khwaaish!");
        handleSend();
      } else {
        pushSystem("Failed to Verify OTP, please try again");
      }

      setLoadingOtp(false);
      setOtpPopup(false);
    } catch (error) {
      console.error("Error in handleSend: ", error);
      setLoadingOtp(false);
    }
  }

  return (
    <>
      <div className="w-full">
        {showChat ? (
          <div className="relative min-h-screen w-full bg-black overflow-hidden">
            <div className="flex-1 h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
              {messages.map((m) => renderMessage(m))}
              {isLoading && <FlowerLoader />}
            </div>
          </div>
        ) : (
          <div className="min-h-screen w-screen bg-black text-white">
            <aside
              className={
                `fixed left-0 top-0 z-40 h-full border-r border-gray-800 bg-black transition-transform duration-300 ` +
                `w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
              }
            >
              <div className="flex justify-between items-center gap-2 px-4 py-3">
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

              <div className="px-3">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                  onClick={() => {
                    setShowChat(true);
                    setMessages([]);
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
            </aside>

            <main className="flex-1 flex flex-col relative">
              <div className="sticky top-0 left-0 right-0 z-20 p-2 flex items-center justify-between">
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
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-orange-500 rounded-full flex items-center justify-center text-sm font-semibold">
                      I
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 relative">
                <div className="max-w-5xl mx-auto space-y-6">
                  <div className="flex items-center justify-center gap-3">
                    <img src="/images/LOGO.png" alt="" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl flex items-center justify-center sm:text-3xl font-semibold">
                      Swiggy Instamart with Khwaaish AI
                    </h2>
                    <p className="text-gray-400 text-base sm:text-lg">
                      Tell me what you need and I’ll shop Instamart for you.
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
                          pushUser(messageInput);
                        }
                      }}
                      placeholder="What do you want to order from Instamart?"
                      className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                      <VoiceRecorderButton
                        onTextReady={(text) => {
                          setMessageInput(text);
                        }}
                      />
                      <button
                        onClick={() => {
                          handleSend();
                          pushUser(messageInput);
                        }}
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
                </div>
              </div>
            </main>
          </div>
        )}
      </div>
      {phonePopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Enter your details
            </h2>

            <input
              type="text"
              placeholder="Mobile Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <input
              type="text"
              placeholder="Location"
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <button
              onClick={handleLogin}
              disabled={loadingPhone}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingPhone ? <PopupLoader /> : "Continue"}
            </button>
            <button
              onClick={() => setPhonePopup(false)}
              className="w-full py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {otpPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Enter your details
            </h2>

            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

           <button
              onClick={handleOtp}
              disabled={loadingOtp}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingOtp ? <PopupLoader /> : "Continue"}
            </button>
            <button
              onClick={() => setPhonePopup(false)}
              className="w-full py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
