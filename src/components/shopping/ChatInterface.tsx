import React, { useState, useEffect } from "react";
import ProductComparison from "./ProductComparison";
import VoiceRecorderButton from "../VoiceRecorderButton";

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  brand: "zara" | "pantaloon";
  product_url: string;
}

interface ChatInterfaceProps {
  query: string;
  onBack: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSendMessage: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  query,
  onBack,
  messages,
  setMessages,
  sidebarOpen,
  setSidebarOpen,
  onSendMessage,
}) => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [zaraProducts, setZaraProducts] = useState<Product[]>([]);
  const [pantaloonProducts, setPantaloonProducts] = useState<Product[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<
    "zara" | "pantaloon" | null
  >(null);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showUpiPopup, setShowUpiPopup] = useState(false);

  // Simulate API calls
  useEffect(() => {
    const searchProducts = async () => {
      setIsLoading(true);

      try {
        // Call Zara API
        const zaraResponse = await fetch("/api/zara/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query,
            gender: "male",
          }),
        });

        const zaraData = await zaraResponse.json();
        const formattedZaraProducts =
          zaraData.products?.map((product: any, index: number) => ({
            id: `zara-${index}`,
            name: product.name || `Zara ${query}`,
            price: product.price || "₹4999",
            imageUrl: product.imageUrl || `https://via.placeholder.com/150`,
            brand: "zara" as const,
            product_url: product.url || "#",
          })) || [];

        setZaraProducts(formattedZaraProducts);

        // Try Pantaloon API but don't fail if it errors
        try {
          const pantaloonResponse = await fetch("/api/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: query,
            }),
          });

          const pantaloonData = await pantaloonResponse.json();
          const formattedPantaloonProducts =
            pantaloonData.products?.map((product: any, index: number) => ({
              id: `pantaloon-${index}`,
              name: product.name || `Pantaloon ${query}`,
              price: product.price || "₹3999",
              imageUrl: product.imageUrl || `https://via.placeholder.com/150`,
              brand: "pantaloon" as const,
              product_url: product.url || "#",
            })) || [];

          setPantaloonProducts(formattedPantaloonProducts);
        } catch (pantaloonError) {
          console.log("Pantaloon API error, continuing with Zara only");
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "system",
              content:
                "Pantaloon is currently unavailable. Showing Zara products only.",
            },
          ]);
        }
      } catch (error) {
        console.error("Error searching products:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "system",
            content: "Sorry, there was an error searching for products.",
          },
        ]);
      } finally {
        setIsLoading(false);
        const productMessage = {
          type: "product_list",
          products: [
            ...zaraProducts.map((p) => ({ ...p, source: "zara" })),
            ...pantaloonProducts.map((p) => ({ ...p, source: "pantaloon" })),
          ],
        };

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "system",
            content: JSON.stringify(productMessage),
          },
        ]);
      }
    };

    searchProducts();
  }, [query]);

  const handleSend = () => {
    onSendMessage(inputMessage);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedBrand(product.brand);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "system",
        content: `Selected ${product.name} from ${
          product.brand.charAt(0).toUpperCase() + product.brand.slice(1)
        }. What would you like to do? (Add to cart / Place order)`,
      },
    ]);
  };

  const handleAddToCart = async (product: Product) => {
    if (product.brand === "zara") {
      setShowUpiPopup(true);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          content:
            "Pantaloon service is currently unavailable. Please select a Zara product.",
        },
      ]);
    }
  };

  const renderMessage = (m: Message) => {
    let parsed: any;

    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    let content: React.ReactNode = null;

    if (typeof parsed === "object" && parsed?.type === "product_list") {
      content = (
        <ProductComparison
          products={parsed.products}
          onProductSelect={handleProductSelect}
          onAddToCart={handleAddToCart}
        />
      );
    } else {
      const renderFormatted = (text: string) => {
        return text.split("\n").map((line, i) => {
          let formatted = line;

          formatted = formatted.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
          );

          formatted = formatted.replace(
            /([🛍️📋🎯💡📝💬❌🔍💰📦])/g,
            '<span class="text-xl">$1</span>'
          );

          return (
            <p
              key={i}
              className="text-sm sm:text-base leading-relaxed mb-2 last:mb-0"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          );
        });
      };

      content = (
        <div className="space-y-2">{renderFormatted(String(parsed))}</div>
      );
    }

    return typeof parsed === "object" && parsed?.type === "product_list" ? (
      <div key={m.id} className="w-full">
        {content}
      </div>
    ) : (
      <div
        key={m.id}
        className={`flex ${
          m.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`${
            m.role === "user"
              ? "bg-white/15 text-white border-white/20"
              : "bg-gray-900/80 text-gray-100 border-gray-800"
          } 
          max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-3 border`}
        >
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* ALL POPUPS */}
      {/* PHONE NUMBER POPUP */}
      {showPhonePopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Enter your details for Zara
            </h2>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />
            <button className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold">
              Login to Zara
            </button>
          </div>
        </div>
      )}

      {/* UPI POPUP */}
      {showUpiPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Enter UPI ID for Zara
            </h2>
            <input
              type="text"
              placeholder="example@upi"
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />
            <button
              onClick={() => {
                setShowUpiPopup(false);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    role: "system",
                    content:
                      "Payment Request Sent to your UPI ID for Zara items",
                  },
                ]);
              }}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={
          `fixed left-0 top-0 z-40 h-full border-r border-gray-800 bg-black transition-transform duration-300 ` +
          `w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
        }
      >
        {/* Logo and collapse */}
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

        {/* New Chat */}
        <div className="px-3">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            onClick={onBack}
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Home</span>
          </button>
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

        {/* Chat Messages */}
        <div className="flex-1 h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
          {messages.map((m) => renderMessage(m))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-900/80 text-gray-100 border-gray-800 max-w-[60%] rounded-2xl px-4 py-3 border">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <p>Searching for products...</p>
                </div>
              </div>
            </div>
          )}
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
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!inputMessage.trim()) return;
                  handleSend();
                }
              }}
              placeholder="What is your khwaaish?"
              className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
            />

            <VoiceRecorderButton
              onTextReady={(text) =>
                setInputMessage((prev) => (prev ? `${prev} ${text}` : text))
              }
            />

            <button
              type="submit"
              className={`p-2.5 rounded-full ${
                inputMessage
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
      </main>
    </div>
  );
};

export default ChatInterface;
