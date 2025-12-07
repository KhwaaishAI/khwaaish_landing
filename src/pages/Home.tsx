import { useState } from "react";
import HomeSidebar from "../components/home/HomeSidebar";
import HomeTopBar from "../components/home/HomeTopBar";
import HomeHero from "../components/home/HomeHero";
import HomeChatBar from "../components/home/HomeChatBar";
import AuthWelcomePopup from "../components/auth/AuthWelcomePopup";
import AuthPhonePopup from "../components/auth/AuthPhonePopup";
import AuthOtpPopup from "../components/auth/AuthOtpPopup";
import AuthProfilePopup from "../components/auth/AuthProfilePopup";
import AuthDobPopup from "../components/auth/AuthDobPopup";
import AuthToast from "../components/auth/AuthToast";
import { PharmEasyFlowProvider, usePharmEasyFlow } from "../components/pharmeasy/PharmEasyFlowContext";
import { PharmEasyFlow } from "../components/pharmeasy/PharmEasyFlow";


function HomeContent() {
  type AuthStep = "none" | "welcome" | "phone" | "otp" | "profile" | "dob";
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [authStep, setAuthStep] = useState<AuthStep>("none");
  const [toastMessage, setToastMessage] = useState("");
  const { isActive } = usePharmEasyFlow();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  };

  return (
    <div className="min-h-screen w-screen flex bg-black text-white">
      <div className="hidden md:block h-full">
        <HomeSidebar />
      </div>

      <main
        className={`flex-1 relative flex flex-col transition-all duration-300 ${
          isActive ? "bg-black" : ""
        }`}
        style={
          !isActive
            ? {
                backgroundImage: "url('/images/khwaaish_bg.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {
                backgroundColor: '#000000',
              }
        }
      >
        <HomeTopBar
          onLoginClick={() => {
            setAuthStep("welcome");
            showToast("Login started");
          }}
        />
        <div className="flex-1 flex flex-col items-center">
          <HomeHero />
          <HomeChatBar />
        </div>
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
            setAuthStep("profile");
            showToast("OTP verified");
          }}
        />
      )}

      {authStep === "profile" && (
        <AuthProfilePopup
          onBack={() => setAuthStep("otp")}
          onOpenDob={() => {
            setAuthStep("dob");
            showToast("Select date of birth");
          }}
        />
      )}

      {authStep === "dob" && (
        <AuthDobPopup
          onClose={() => {
            setAuthStep("none");
            showToast("Profile completed");
          }}
        />
      )}

      <AuthToast message={toastMessage} />
      <PharmEasyFlow />
    </div>
  );
}

export default function Home() {
  return (
    <PharmEasyFlowProvider>
      <HomeContent />
    </PharmEasyFlowProvider>
  );
}
