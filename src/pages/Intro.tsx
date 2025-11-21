import { useEffect, useState } from "react";

const VALID_EMAIL = import.meta.env.VITE_APP_EMAIL;
const VALID_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

interface IntroProps {
  onLoginSuccess: () => void;
}

export default function Intro({ onLoginSuccess }: IntroProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [animatedText, setAnimatedText] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const welcomeText = "welcome to Khwaaish";

  // Typing animation
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= welcomeText.length) {
        setAnimatedText(welcomeText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Switch to login after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setShowLogin(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) return;

    if (trimmedEmail === VALID_EMAIL && trimmedPassword === VALID_PASSWORD) {
      onLoginSuccess();
    } else {
      alert("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Rotating frame */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="animate-spin" style={{ animationDuration: "10s" }}>
          <img
            src="/images/Frame 533.png"
            alt="Background"
            className="w-[180vmin] h-[150vmin] max-w-[200vw] max-h-[100vh] object-contain"
          />
        </div>
      </div>

      {/* Welcome screen */}
      {showWelcome && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 transform -translate-y-1.5">
          <div className="mb-8">
            <img
              src="/images/LOGO.png"
              alt="Khwaaish Logo"
              className="w-20 sm:w-28 object-contain"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide">
            {animatedText}
            <span className="animate-pulse">|</span>
          </h1>
        </div>
      )}

      {/* Login screen */}
      {showLogin && (
        <div className="absolute inset-0 flex flex-col items-center justify-center mb-12 z-10 px-4 transform -translate-y-1.5">
          <div className="mb-6">
            <img
              src="/images/LOGO.png"
              alt="Khwaaish Logo"
              className="w-20 h-16 sm:w-24 sm:h-24 object-contain"
            />
          </div>

          <div className="w-full max-w-md bg-black/60 backdrop-blur-md border border-gray-800 rounded-2xl p-5 sm:p-6 -mt-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
              Welcome Back
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 bg-white/10 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 bg-white/10 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Continue to Khwaaish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
