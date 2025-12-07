import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import HomeSidebar from "../components/home/HomeSidebar";
import HomeTopBar from "../components/home/HomeTopBar";
import HomeHero from "../components/home/HomeHero";
import HomeChatBar from "../components/home/HomeChatBar";

// Auth Popups
import AuthWelcomePopup from "../components/auth/AuthWelcomePopup";
import AuthPhonePopup from "../components/auth/AuthPhonePopup";
import AuthOtpPopup from "../components/auth/AuthOtpPopup";
import AuthProfilePopup from "../components/auth/AuthProfilePopup";
import AuthDobPopup from "../components/auth/AuthDobPopup";
import AuthToast from "../components/auth/AuthToast";

export default function Home() {
  const navigate = useNavigate();

  type AuthStep = "none" | "welcome" | "phone" | "otp" | "profile" | "dob";

  const [authStep, setAuthStep] = useState<AuthStep>("none");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  };

  return (
    <div className="min-h-screen w-screen flex bg-black text-white">
      {/* Sidebar - Hidden on mobile, visible on medium screens and up */}
      <div className="hidden md:block h-full">
        <HomeSidebar />
      </div>

      {/* Main Background Area */}
      <main
        className="flex-1 relative flex flex-col"
        style={{
          backgroundImage: "url('/images/khwaaish_bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <HomeTopBar
          onLoginClick={() => {
            setAuthStep("welcome");
            showToast("Login started");
          }}
        />
        
        <div className="flex-1 flex flex-col items-center">
          <HomeHero />
          
          {/* 
            Wrapper to make the Chat Bar clickable. 
            When clicked, it navigates to your new '/food' Chat Screen.
          */}
          <div 
            className="w-full flex justify-center cursor-pointer" 
            onClick={() => navigate('/food')}
          >
            <HomeChatBar />
          </div>
        </div>
      </main>

      {/* --- Auth Modals --- */}
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
    </div>
  );
}