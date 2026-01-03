import React, { useMemo, useState } from "react";

import FlowerLoader from "../components/FlowerLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";
import LandingView from "../components/LandingView";

// Grids (existing UI)
import ProductGrid from "../components/nykaa/ProductGrid";
import WestsideProductGrid from "../components/westside/WestsideProductGrid";
import PantaloonsProductGrid from "../components/pantaloons/PantaloonsProductGrid";

// Nykaa popups
import SizePopup from "../components/nykaa/SizePopup";
import AddressPopup from "../components/nykaa/AddressPopup";
import UpiPopup from "../components/nykaa/UpiPopup";

// Westside popups
import WestsideSizePopup from "../components/westside/WestsideSizePopup";
import WestsideUpiPopup from "../components/westside/WestsideUpiPopup";
import WestsideAddressPopup from "../components/westside/WestsideAddressPopup";
import WestsideLoginOtpPopup from "../components/westside/WestsideLoginOtpPopup";

// Pantaloons popups
import PantaloonsPincodePopup from "../components/pantaloons/PantaloonsPincodePopup";
import PantaloonsSizePopup from "../components/pantaloons/PantaloonsSizePopup";
import PantaloonsPhoneOtpPopup from "../components/pantaloons/PantaloonsPhoneOtpPopup";
import PantaloonsUpiAddressPopup from "../components/pantaloons/PantaloonsUpiAddressPopup";

// Flows (existing logic)
import { useNykaaFlow } from "../utils/hooks/useNykaaFlow";
import { useWestsideFlow } from "../utils/hooks/useWestsideFlow";
import { usePantaloonsFlow } from "../utils/hooks/usePantaloonsFlow";

import type { NykaaProduct } from "../types/nykaa";
import type { WestsideProduct } from "../types/westside";
import type { PantaloonsProduct } from "../types/pantaloons";

// New unified search hook
import { useUnifiedSearch } from "../utils/hooks/useUnifiedSearch";

type Role = "user" | "system";
type Message = { id: string; role: Role; content: string };

// This message format is unique to this page (does not touch existing brand types)
type UnifiedProductsMessage = {
  type: "unified-products";
  query: string;
  nykaa: NykaaProduct[];
  westside: WestsideProduct[];
  pantaloons: PantaloonsProduct[];
  errors?: {
    nykaa?: string;
    westside?: string;
    pantaloons?: string;
  };
};

const BaseURL = import.meta.env.VITE_API_BASE_URL;

export default function Unified() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Brand flows (existing)
  const nykaaFlow = useNykaaFlow({ BaseURL, pushSystem });
  const westsideFlow = useWestsideFlow({ BaseURL, pushSystem });
  const pantaloonsFlow = usePantaloonsFlow({ BaseURL, pushSystem });

  // Unified search
  const unified = useUnifiedSearch({ BaseURL });

  const getNykaaAvailableSizes = (p: any): string[] => {
    const raw = p?.availablesizes;
    const arr = Array.isArray(raw) ? raw : [];
    const cleaned = arr.map((s: any) => String(s).trim()).filter(Boolean);
    return Array.from(new Set(cleaned));
  };

  const handleUnifiedSearch = async (query: string) => {
    const q = query.trim();
    if (!q) return;

    setIsLoading(true);
    try {
      const { nykaa, westside, pantaloons } = await unified.searchAll(q);

      const payload: UnifiedProductsMessage = {
        type: "unified-products",
        query: q,
        nykaa,
        westside,
        pantaloons,
        errors: unified.errors,
      };

      pushSystem(JSON.stringify(payload));
    } catch (err) {
      console.log("UNIFIED SEARCH ERROR", err);
      pushSystem("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!messageInput.trim()) return;
    setShowChat(true);

    const userText = messageInput.trim();
    setMessageInput("");
    pushUser(userText);

    await handleUnifiedSearch(userText);
  };

  const handleNewChat = () => {
    setShowChat(true);
    setMessages([]);
    setMessageInput("");
  };

  const renderUnifiedProducts = (p: UnifiedProductsMessage) => {
    const nykaaSelected = nykaaFlow.pendingProduct;
    const westsideSelectedUrl =
      westsideFlow.pendingProduct?.product_url ?? null;
    const pantaloonsSelectedUrl =
      pantaloonsFlow.pendingProduct?.producturl ?? null;

    const getNykaaAvailableSizes = (p: any): string[] => {
      const raw =
        p?.availablesizes ?? p?.available_sizes ?? p?.availableSizes ?? [];
      const arr = Array.isArray(raw) ? raw : [];
      const cleaned = arr.map((s: any) => String(s).trim()).filter(Boolean);
      return Array.from(new Set(cleaned));
    };

    return (
      <div className="w-full space-y-6">
        {p.errors?.nykaa || p.errors?.westside || p.errors?.pantaloons ? (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
            {p.errors?.nykaa ? <div>Nykaa: {p.errors.nykaa}</div> : null}
            {p.errors?.westside ? (
              <div>Westside: {p.errors.westside}</div>
            ) : null}
            {p.errors?.pantaloons ? (
              <div>Pantaloons: {p.errors.pantaloons}</div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Nykaa results</h3>
          {p.nykaa?.length ? (
            <ProductGrid
              products={p.nykaa}
              selectedProduct={nykaaSelected}
              onSelect={(product) => nykaaFlow.openSizeForProduct(product)}
            />
          ) : (
            <div className="text-sm text-white/60">
              No Nykaa products found.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Westside results</h3>
          {p.westside?.length ? (
            <WestsideProductGrid
              products={p.westside}
              selectedProductUrl={westsideSelectedUrl}
              onSelect={(product) =>
                westsideFlow.openProductAndFetchSizes(product)
              }
            />
          ) : (
            <div className="text-sm text-white/60">
              No Westside products found.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Pantaloons results</h3>
          {p.pantaloons?.length ? (
            <PantaloonsProductGrid
              products={p.pantaloons}
              selectedProductUrl={pantaloonsSelectedUrl}
              onSelect={(product) =>
                pantaloonsFlow.openProductThenAskPincode(product)
              }
            />
          ) : (
            <div className="text-sm text-white/60">
              No Pantaloons products found.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMessage = (m: Message) => {
    let parsed: any;
    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    // Unified grid message
    if (typeof parsed === "object" && parsed?.type === "unified-products") {
      return (
        <div key={m.id} className="w-full">
          {renderUnifiedProducts(parsed as UnifiedProductsMessage)}
        </div>
      );
    }

    // Preserve your existing "success" UI behavior (same pattern as brand pages)
    const isSuccess =
      (typeof parsed === "object" &&
        String(parsed?.status).toLowerCase().includes("success")) ||
      (typeof parsed === "string" && parsed.trim().toLowerCase() === "success");

    if (isSuccess) {
      return (
        <div
          key={m.id}
          className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-600 rounded-xl"
        >
          <div>
            <p className="font-semibold text-green-400">Order Confirmed!</p>
            <p className="text-sm text-green-300 mt-1">
              Your item will be delivered soon.
            </p>
          </div>
        </div>
      );
    }

    const text = typeof parsed === "string" ? parsed : JSON.stringify(parsed);

    return (
      <div
        key={m.id}
        className={`flex ${
          m.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={[
            "max-w-[85%] rounded-2xl px-4 py-3 border",
            m.role === "user"
              ? "bg-white/15 text-white border-white/20"
              : "bg-gray-900/80 text-gray-100 border-gray-800",
          ].join(" ")}
        >
          <p className="text-sm sm:text-base leading-relaxed">{text}</p>
        </div>
      </div>
    );
  };

  // Westside size list logic (same as Westside.tsx)
  const westsideSizesToShow = useMemo(() => {
    return westsideFlow.viewData?.sizes?.length
      ? westsideFlow.viewData.sizes
      : westsideFlow.sizesFallback;
  }, [westsideFlow.viewData?.sizes, westsideFlow.sizesFallback]);

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* NYKAA POPUPS */}
      <SizePopup
        open={nykaaFlow.showSizePopup}
        productBrand={nykaaFlow.pendingProduct?.brand}
        productName={nykaaFlow.pendingProduct?.name}
        productPrice={nykaaFlow.pendingProduct?.price}
        sizes={
          nykaaFlow.pendingProduct
            ? getNykaaAvailableSizes(nykaaFlow.pendingProduct)
            : []
        }
        selectedSize={nykaaFlow.selectedSize}
        onSelectSize={nykaaFlow.setSelectedSize}
        onAddToCart={nykaaFlow.openAddressPopupForCart}
        onClose={() => nykaaFlow.setShowSizePopup(false)}
        loading={nykaaFlow.loadingCart}
      />
      <AddressPopup
        open={nykaaFlow.showAddressPopup}
        address={nykaaFlow.nykaaAddress}
        setAddress={nykaaFlow.setNykaaAddress}
        onSave={nykaaFlow.handleNykaaAddToCart}
        onClose={() => nykaaFlow.setShowAddressPopup(false)}
        loading={nykaaFlow.loadingCart}
      />
      <UpiPopup
        open={nykaaFlow.showUpiPopup}
        upiId={nykaaFlow.upiId}
        setUpiId={(v) => nykaaFlow.setUpiId(v)}
        onPay={nykaaFlow.handleNykaaUpiSubmit}
        onClose={() => nykaaFlow.setShowUpiPopup(false)}
        loading={nykaaFlow.loadingPayment}
      />

      {/* WESTSIDE POPUPS */}
      <WestsideSizePopup
        open={westsideFlow.showSizePopup}
        productName={
          westsideFlow.viewData?.productname ??
          westsideFlow.pendingProduct?.productname
        }
        productPrice={
          westsideFlow.viewData?.price ?? westsideFlow.pendingProduct?.price
        }
        sizes={westsideSizesToShow}
        selectedSize={westsideFlow.selectedSize}
        onSelectSize={westsideFlow.setSelectedSize}
        onAddToCart={westsideFlow.handleAddToCartThenAccountCheck}
        onClose={() => westsideFlow.setShowSizePopup(false)}
        loading={westsideFlow.loadingAddToCart || westsideFlow.loadingView}
      />
      <WestsideUpiPopup
        open={westsideFlow.showUpiPopup}
        upiId={westsideFlow.upiId}
        setUpiId={(v) => westsideFlow.setUpiId(v)}
        onPay={westsideFlow.proceedAfterUpi}
        onClose={() => westsideFlow.setShowUpiPopup(false)}
        loading={false}
      />
      <WestsideAddressPopup
        open={westsideFlow.showAddressPopup}
        address={westsideFlow.address}
        setAddress={westsideFlow.setAddress}
        onSave={westsideFlow.handleAddressSaveThenAccountCheck}
        onClose={() => westsideFlow.setShowAddressPopup(false)}
        loading={westsideFlow.loadingBuy}
      />
      <WestsideLoginOtpPopup
        open={westsideFlow.showLoginOtpPopup}
        mobile={westsideFlow.mobile}
        setMobile={westsideFlow.setMobile}
        otp={westsideFlow.otp}
        setOtp={westsideFlow.setOtp}
        onSendOtp={westsideFlow.sendOtp}
        onVerifyOtp={westsideFlow.verifyOtp}
        onClose={() => westsideFlow.setShowLoginOtpPopup(false)}
        loadingSend={westsideFlow.loadingSendOtp}
        loadingVerify={westsideFlow.loadingVerifyOtp}
      />

      {/* PANTALOONS POPUPS */}
      <PantaloonsPincodePopup
        open={pantaloonsFlow.showPincodePopup}
        pincode={pantaloonsFlow.pincode}
        setPincode={pantaloonsFlow.setPincode}
        onSubmit={pantaloonsFlow.submitPincodeAndFetchInfo}
        onClose={() => pantaloonsFlow.setShowPincodePopup(false)}
        loading={pantaloonsFlow.loadingInfo}
      />
      <PantaloonsSizePopup
        open={pantaloonsFlow.showSizePopup}
        productName={
          pantaloonsFlow.productInfo?.productname ??
          pantaloonsFlow.pendingProduct?.productname
        }
        productPrice={
          pantaloonsFlow.productInfo?.price ??
          pantaloonsFlow.pendingProduct?.price
        }
        sizes={pantaloonsFlow.sizesToShow}
        selectedSize={pantaloonsFlow.selectedSize}
        onSelectSize={pantaloonsFlow.setSelectedSize}
        onContinue={pantaloonsFlow.continueAfterSize}
        onClose={() => pantaloonsFlow.setShowSizePopup(false)}
        loading={false}
      />
      <PantaloonsPhoneOtpPopup
        open={pantaloonsFlow.showPhoneOtpPopup}
        phone={pantaloonsFlow.phone}
        setPhone={pantaloonsFlow.setPhone}
        otp={pantaloonsFlow.otp}
        setOtp={pantaloonsFlow.setOtp}
        onCheckSession={pantaloonsFlow.checkSession}
        onSendOtp={pantaloonsFlow.sendOtp}
        onVerifyOtp={pantaloonsFlow.verifyOtp}
        onClose={() => pantaloonsFlow.setShowPhoneOtpPopup(false)}
        loadingCheck={pantaloonsFlow.loadingCheck}
        loadingSend={pantaloonsFlow.loadingSendOtp}
        loadingVerify={pantaloonsFlow.loadingVerifyOtp}
        phase={pantaloonsFlow.phonePhase}
      />
      <PantaloonsUpiAddressPopup
        open={pantaloonsFlow.showUpiAddressPopup}
        upiId={pantaloonsFlow.upiId}
        setUpiId={pantaloonsFlow.setUpiId}
        couponCode={pantaloonsFlow.couponCode}
        setCouponCode={pantaloonsFlow.setCouponCode}
        address={pantaloonsFlow.address}
        setAddress={pantaloonsFlow.setAddress}
        onRun={pantaloonsFlow.runAutomation}
        onClose={() => pantaloonsFlow.setShowUpiAddressPopup(false)}
        loading={pantaloonsFlow.loadingRun}
      />

      {showChat ? (
        <div className="relative min-h-screen w-full bg-black overflow-hidden">
          <div className="h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
            {messages.map(renderMessage)}
            {isLoading || unified.loading ? <FlowerLoader /> : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="absolute bottom-0 left-0 right-0 z-40 mx-auto max-w-4xl px-4 py-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          >
            <div className="flex items-center gap-3 rounded-full px-4 py-3 border border-gray-800 bg-white/10 backdrop-blur">
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Search across Nykaa, Westside & Pantaloons..."
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
              />
              <VoiceRecorderButton
                onTextReady={(text) =>
                  setMessageInput((prev) => (prev ? prev + " " + text : text))
                }
              />
              <button
                type="submit"
                className={[
                  "p-2.5 rounded-full",
                  messageInput.trim()
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-white/20 hover:bg-white/30",
                ].join(" ")}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <LandingView
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSend={handleSend}
          onNewChat={handleNewChat}
          title="Welcome to Unified Shopping!"
          subtitle="Search once and browse Nykaa, Westside & Pantaloons together."
          searchPlaceholder="Search products across all brands..."
          cardTitle="Unified Shopping"
          cardDescription="Search and buy products from Nykaa, Westside and Pantaloons with voice commands."
        />
      )}
    </div>
  );
}
