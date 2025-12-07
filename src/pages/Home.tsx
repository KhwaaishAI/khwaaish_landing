import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeSidebar from "../components/home/HomeSidebar";
import HomeTopBar from "../components/home/HomeTopBar";
import HomeHero from "../components/home/HomeHero";
import HomeChatBar from "../components/home/HomeChatBar";
import ActiveChat from "../components/chat/ActiveChat";
import AuthWelcomePopup from "../components/auth/AuthWelcomePopup";
import AuthPhonePopup from "../components/auth/AuthPhonePopup";
import AuthOtpPopup from "../components/auth/AuthOtpPopup";
import AuthDobPopup from "../components/auth/AuthDobPopup";
import AuthToast from "../components/auth/AuthToast";

export default function Home() {
  type AuthStep = "none" | "welcome" | "phone" | "otp" | "profile" | "dob";

  const navigate = useNavigate();
  const [authStep, setAuthStep] = useState<AuthStep>("none");
  const [toastMessage, setToastMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "ai" }>>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  };

  const handleSendMessage = (text: string) => {
    if (selectedCompany === "Ola") {
      navigate("/ola", { state: { initialMessage: text, userName } });
      return;
    }

    if (selectedCompany === "Pharmeasy") {
      navigate("/pharmeasy", { state: { initialMessage: text, userName } });
      return;
    }

    setMessages((prev) => [...prev, { text, sender: "user" }]);
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "This is a simulated AI response.", sender: "ai" },
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-screen flex bg-black text-white">
      <div className="hidden md:block h-full">
        <HomeSidebar userName={userName} />
      </div>

      <main
        className={`flex-1 relative flex flex-col transition-all duration-500 ${messages.length > 0 ? "bg-black" : ""
          }`}
        style={
          messages.length === 0
            ? {
              backgroundImage: "url('/images/khwaaish_bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
            : {}
        }
      >
        <HomeTopBar
          onLoginClick={() => {
            setAuthStep("welcome");
            showToast("Login started");
          }}
        />

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center">
            <HomeHero />
            <HomeChatBar
              onSendMessage={handleSendMessage}
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
            />
          </div>
        ) : (
          <ActiveChat
            messages={messages}
            onSendMessage={handleSendMessage}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
          />
        )}
      </main>

      {authStep === "welcome" && (
        <AuthWelcomePopup
          onContinuePhone={() => {
            setAuthStep("phone");
            showToast("Continue with phone");
          }}
          onContinueGoogle={() => {
            showToast("Google sign-in coming soon");
          }}
        />
      )}

      {authStep === "phone" && (
        <AuthPhonePopup
          onBack={() => setAuthStep("welcome")}
          onNext={() => {
            setAuthStep("otp");
            showToast("OTP sent");
          }}
        />
      )}

      {authStep === "otp" && (
        <AuthOtpPopup
          onBack={() => setAuthStep("phone")}
          onNext={() => {
            setAuthStep("dob");
            showToast("OTP verified");
          }}
        />
      )}

      {/* AuthProfilePopup removed as it is replaced by AuthDobPopup */}

      {authStep === "dob" && (
        <AuthDobPopup
          onBack={() => setAuthStep("otp")}
          onClose={(name) => {
            setUserName(name);
            setAuthStep("none");
            showToast("Profile completed");
          }}
        />
      )}

      <AuthToast message={toastMessage} />
    </div>
  );
}
