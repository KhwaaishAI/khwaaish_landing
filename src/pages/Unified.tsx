import React, { useMemo, useState } from "react";

import FlowerLoader from "../components/FlowerLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";
import LandingView from "../components/LandingView";

// Grids (existing UI)
import ProductGrid from "../components/nykaa/ProductGrid";
import WestsideProductGrid from "../components/westside/WestsideProductGrid";
import PantaloonsProductGrid from "../components/pantaloons/PantaloonsProductGrid";
import ShoppersStopProductGrid from "../components/shoppersstop/ShoppersStopProductGrid";

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

// Shoppers Stop popups (preserve original component names)
import ShoppersStopProductPopup from "../components/shoppersstop/ShoppersStopProductPopup";
import ShoppersStopOtpPopup from "../components/shoppersstop/ShoppersStopOtpPopup";
import ShoppersStopSignupPopup from "../components/shoppersstop/ShoppersStopSignupPopup";
import ShoppersStopSelectAddressPopup from "../components/shoppersstop/ShoppersStopSelectAddressPopup";
import ShoppersStopAddAddressPopup from "../components/shoppersstop/ShoppersStopAddAddressPopup";
import ShoppersStopUpiPopup from "../components/shoppersstop/ShoppersStopUpiPopup";

// Flows (existing logic)
import { useNykaaFlow } from "../utils/hooks/useNykaaFlow";
import { useWestsideFlow } from "../utils/hooks/useWestsideFlow";
import { usePantaloonsFlow } from "../utils/hooks/usePantaloonsFlow";
import { useShoppersStopFlow } from "../utils/hooks/useShoppersStopFlow";

import type { NykaaProduct } from "../types/nykaa";
import type { WestsideProduct } from "../types/westside";
import type { PantaloonsProduct } from "../types/pantaloons";
import type { ShoppersStopProduct } from "../types/shoppersstop";

// New unified search hook
import { useUnifiedSearch } from "../utils/hooks/useUnifiedSearch";

type Role = "user" | "system";
type Message = { id: string; role: Role; content: string };

// This message format is unique to this page (does not touch existing brand types)
import type { TataCliqProduct } from "../types/tatacliq";
import TataCliqProductGrid from "../components/tatacliq/TataCliqProductGrid";
import useTataCliqFlow from "../utils/hooks/useTataCliqFlow";
import TataCliqProductPopup from "../components/tatacliq/TataCliqProductPopup";

type UnifiedProductsMessage = {
  type: "unified-products";
  query: string;

  nykaa: NykaaProduct[];
  westside: WestsideProduct[];
  pantaloons: PantaloonsProduct[];
  shoppersstop: ShoppersStopProduct[];
  tatacliq: TataCliqProduct[];

  errors?: {
    nykaa?: string;
    westside?: string;
    pantaloons?: string;
    shoppersstop?: string;
    tatacliq?: string;
  };

  order?: ("nykaa" | "westside" | "pantaloons" | "shoppersstop" | "tatacliq")[];

  loading?: {
    nykaa?: boolean;
    westside?: boolean;
    pantaloons?: boolean;
    shoppersstop?: boolean;
    tatacliq?: boolean;
  };
};

const BaseURL = import.meta.env.VITE_API_BASE_URL;

export default function Unified() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const updateMessageById = (id: string, content: string) => {
    setMessages((prev) =>
      prev.map((m: any) => (m.id === id ? { ...m, content } : m))
    );
  };

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

  // ShoppersStop flow (preserve original key/variable/function names)
  const shoppersstopFlow = useShoppersStopFlow({ BaseURL, pushSystem });
  const tatacliqFlow = useTataCliqFlow({ BaseURL, pushSystem });

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

    const resultMessageId = crypto.randomUUID();

    const initialPayload: UnifiedProductsMessage = {
      type: "unified-products",
      query: q,
      nykaa: [],
      westside: [],
      pantaloons: [],
      shoppersstop: [],
      errors: {},
      order: [],
      loading: {
        nykaa: true,
        westside: true,
        pantaloons: true,
        shoppersstop: true,
        tatacliq: true,
      },
    };

    setMessages((prev: any) => [
      ...prev,
      {
        id: resultMessageId,
        role: "system",
        content: JSON.stringify(initialPayload),
      },
    ]);

    const seen = new Set<
      "nykaa" | "westside" | "pantaloons" | "shoppersstop" | "tatacliq"
    >();

    const updateBubble = (
      updater: (cur: UnifiedProductsMessage) => UnifiedProductsMessage
    ) => {
      setMessages((prev: any) =>
        prev.map((m: any) => {
          if (m.id !== resultMessageId) return m;

          let cur: UnifiedProductsMessage;
          try {
            cur = JSON.parse(m.content);
          } catch {
            cur = initialPayload;
          }

          const next = updater(cur);
          return { ...m, content: JSON.stringify(next) };
        })
      );
    };

    try {
      await unified.searchAllStreaming(q, (patch) => {
        const brand =
          patch?.shoppersstop !== undefined
            ? "shoppersstop"
            : patch?.pantaloons !== undefined
            ? "pantaloons"
            : patch?.westside !== undefined
            ? "westside"
            : patch?.nykaa !== undefined
            ? "nykaa"
            : patch?.tatacliq !== undefined
            ? "tatacliq"
            : null;

        if (!brand) {
          // no brand found; just merge patch safely
          updateBubble((cur) => ({
            ...cur,
            ...(patch as any),
            errors: unified.errors,
          }));
          return;
        }

        const isFirstTime = !seen.has(brand);
        if (isFirstTime) seen.add(brand);

        updateBubble((cur) => {
          const nextOrder = isFirstTime
            ? [...(cur.order ?? []), brand]
            : cur.order ?? [];

          return {
            ...cur,
            ...(patch as any),
            order: nextOrder,
            loading: { ...(cur.loading ?? {}), [brand]: false },
            errors: unified.errors,
          };
        });
      });
    } catch (err) {
      console.log("UNIFIED SEARCH ERROR", err);
      pushSystem("Something went wrong!");
    } finally {
      // Just ensure errors are synced at end; loading flags are already turned off per brand.
      updateBubble((cur) => ({
        ...cur,
        errors: unified.errors,
      }));

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

    // preserve existing flows; additionally close ShoppersStop popups
    shoppersstopFlow.closeAllPopups();
    tatacliqFlow.closeAllPopups();
  };

  const renderUnifiedProducts = (p: UnifiedProductsMessage) => {
    const nykaaSelected = nykaaFlow.pendingProduct;
    const westsideSelectedUrl =
      westsideFlow.pendingProduct?.product_url ?? null;
    const pantaloonsSelectedUrl =
      pantaloonsFlow.pendingProduct?.producturl ?? null;
    const shoppersstopSelectedUrl =
      shoppersstopFlow.pendingProduct?.url ?? null;

    const getNykaaAvailableSizesLocal = (prod: any): string[] => {
      const raw =
        prod?.availablesizes ??
        prod?.available_sizes ??
        prod?.availableSizes ??
        [];
      const arr = Array.isArray(raw) ? raw : [];
      const cleaned = arr.map((s: any) => String(s).trim()).filter(Boolean);
      return Array.from(new Set(cleaned));
    };

    const order = p.order?.length
      ? p.order
      : ([
          "nykaa",
          "westside",
          "pantaloons",
          "shoppersstop",
          "tatacliq",
        ] as const);

    const isLoadingBrand = (
      brand: "nykaa" | "westside" | "pantaloons" | "shoppersstop" | "tatacliq"
    ) => Boolean(p.loading?.[brand]);

    const BrandLoader = ({ text }: { text: string }) => (
      <div className="text-white/70 text-sm flex items-center gap-2">
        {/* <FlowerLoader /> */}
        <span>{text}</span>
      </div>
    );

    const BrandSection = ({
      brand,
    }: {
      brand: "nykaa" | "westside" | "pantaloons" | "shoppersstop" | "tatacliq";
    }) => {
      if (brand === "shoppersstop") {
        return (
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Shoppers Stop results</h3>

            {isLoadingBrand("shoppersstop") ? (
              <BrandLoader text="Shoppers Stop data loading..." />
            ) : p.shoppersstop?.length ? (
              <ShoppersStopProductGrid
                products={p.shoppersstop}
                onSelect={(product: any) =>
                  shoppersstopFlow.openProductAndFetchSizes(product)
                }
                selectedProductUrl={shoppersstopSelectedUrl}
              />
            ) : (
              <div className="text-white/70 text-sm">
                No Shoppers Stop products found.
              </div>
            )}
          </div>
        );
      }

      if (brand === "pantaloons") {
        return (
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Pantaloons results</h3>

            {isLoadingBrand("pantaloons") ? (
              <BrandLoader text="Pantaloons data loading..." />
            ) : p.pantaloons?.length ? (
              <PantaloonsProductGrid
                products={p.pantaloons}
                onSelect={(product: any) =>
                  pantaloonsFlow.openProductThenAskPincode(product)
                }
                selectedProductUrl={pantaloonsSelectedUrl}
              />
            ) : (
              <div className="text-white/70 text-sm">
                No Pantaloons products found.
              </div>
            )}
          </div>
        );
      }

      if (brand === "westside") {
        return (
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Westside results</h3>

            {isLoadingBrand("westside") ? (
              <BrandLoader text="Westside data loading..." />
            ) : p.westside?.length ? (
              <WestsideProductGrid
                products={p.westside}
                onSelect={(product: any) =>
                  westsideFlow.openProductAndFetchSizes(product)
                }
                selectedProductUrl={westsideSelectedUrl}
              />
            ) : (
              <div className="text-white/70 text-sm">
                No Westside products found.
              </div>
            )}
          </div>
        );
      }
      if (brand === "tatacliq") {
        return (
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Tata Cliq results</h3>
            {isLoadingBrand("tatacliq") ? (
              <BrandLoader text="Tata Cliq data loading..." />
            ) : p.tatacliq?.length ? (
              <TataCliqProductGrid
                products={p.tatacliq}
                onSelect={(product) =>
                  tatacliqFlow.openProductAndFetchSizes(product)
                }
                selectedProductUrl={tatacliqFlow.pendingProduct?.url ?? null}
              />
            ) : (
              <div className="text-white/70 text-sm">
                No Tata Cliq products found.
              </div>
            )}
          </div>
        );
      }

      // nykaa
      return (
        <div className="space-y-2">
          <h3 className="text-white font-semibold">Nykaa results</h3>

          {isLoadingBrand("nykaa") ? (
            <BrandLoader text="Nykaa data loading..." />
          ) : p.nykaa?.length ? (
            <ProductGrid
              products={p.nykaa}
              onSelect={(product: any) => nykaaFlow.openSizeForProduct(product)}
              selectedProduct={nykaaSelected}
            />
          ) : (
            <div className="text-white/70 text-sm">
              No Nykaa products found.
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {p.errors?.nykaa ||
        p.errors?.westside ||
        p.errors?.pantaloons ||
        p.errors?.shoppersstop ? (
          <div className="text-red-300 text-sm space-y-1">
            {p.errors?.nykaa ? <div>Nykaa: {p.errors.nykaa}</div> : null}
            {p.errors?.westside ? (
              <div>Westside: {p.errors.westside}</div>
            ) : null}
            {p.errors?.pantaloons ? (
              <div>Pantaloons: {p.errors.pantaloons}</div>
            ) : null}
            {p.errors?.shoppersstop ? (
              <div>Shoppers Stop: {p.errors.shoppersstop}</div>
            ) : null}
            {p.errors?.tatacliq ? (
              <div>Tata Cliq: {p.errors.tatacliq}</div>
            ) : null}
          </div>
        ) : null}

        {order.map((brand) => (
          <BrandSection key={brand} brand={brand} />
        ))}
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

    // Preserve existing "success" UI behavior
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
            : nykaaFlow.sizesFallback
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
          westsideFlow.viewData?.product_name ??
          westsideFlow.pendingProduct?.product_name
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

      {/* SHOPPERS STOP POPUPS (wire EXACT prop names used by these components) */}
      <ShoppersStopProductPopup
        open={shoppersstopFlow.showProductPopup}
        loading={shoppersstopFlow.loadingView}
        loadingAddToCart={shoppersstopFlow.loadingAddToCart}
        productTitle={shoppersstopFlow.pendingProduct?.title}
        productPrice={shoppersstopFlow.pendingProduct?.price}
        sizes={shoppersstopFlow.sizesToShow}
        selectedSize={shoppersstopFlow.selectedSize}
        onSelectSize={shoppersstopFlow.setSelectedSize}
        phone={shoppersstopFlow.phone}
        setPhone={shoppersstopFlow.setPhone}
        bill={shoppersstopFlow.bill}
        onAddToCart={shoppersstopFlow.handleAddToCart}
        onClose={() => shoppersstopFlow.setShowProductPopup(false)}
      />

      <ShoppersStopOtpPopup
        open={shoppersstopFlow.showOtpPopup}
        otp={shoppersstopFlow.otp}
        setOtp={shoppersstopFlow.setOtp}
        bill={shoppersstopFlow.bill}
        onVerifyOtp={shoppersstopFlow.verifyOtpAndContinue}
        onCancelBack={shoppersstopFlow.backToProductFromOtp}
        loadingVerify={
          shoppersstopFlow.loadingVerifyOtp ||
          shoppersstopFlow.loadingSaveAddress
        }
      />

      <ShoppersStopSignupPopup
        open={shoppersstopFlow.showSignupPopup}
        signup={shoppersstopFlow.signup}
        setSignup={shoppersstopFlow.setSignup}
        onSubmit={shoppersstopFlow.submitSignupThenContinue}
        onCancelBack={shoppersstopFlow.backToOtpFromSignup}
        loading={
          shoppersstopFlow.loadingSignup || shoppersstopFlow.loadingSaveAddress
        }
      />

      <ShoppersStopSelectAddressPopup
        open={shoppersstopFlow.showSelectAddressPopup}
        addresses={shoppersstopFlow.addresses}
        selectedAddressId={shoppersstopFlow.selectedAddressId}
        setSelectedAddressId={shoppersstopFlow.setSelectedAddressId}
        bill={shoppersstopFlow.bill}
        onContinue={shoppersstopFlow.proceedAfterAddressSelected}
        onCancelBack={shoppersstopFlow.backToOtpFromAddressSelection}
        loading={shoppersstopFlow.loadingSaveAddress}
      />

      <ShoppersStopAddAddressPopup
        open={shoppersstopFlow.showAddAddressPopup}
        addAddress={shoppersstopFlow.addAddress}
        setAddAddress={shoppersstopFlow.setAddAddress}
        onSubmit={shoppersstopFlow.submitAddAddressThenContinue}
        onCancelBack={shoppersstopFlow.backToOtpFromAddAddress}
        loading={shoppersstopFlow.loadingAddAddress}
      />

      <ShoppersStopUpiPopup
        open={shoppersstopFlow.showUpiPopup}
        upiId={shoppersstopFlow.upiId}
        setUpiId={shoppersstopFlow.setUpiId}
        onPay={shoppersstopFlow.payNow}
        onCancelBack={shoppersstopFlow.backToAddressSelectionFromUpi}
        loading={shoppersstopFlow.loadingPayment}
      />

      {/* After last ShoppersStopUpiPopup */}
      <TataCliqProductPopup
        open={tatacliqFlow.showProductPopup}
        loading={tatacliqFlow.loadingView}
        loadingAddToCart={tatacliqFlow.loadingAddToCart}
        productTitle={tatacliqFlow.pendingProduct?.title}
        productPrice={tatacliqFlow.pendingProduct?.price}
        sizes={tatacliqFlow.sizesToShow}
        selectedSize={tatacliqFlow.selectedSize}
        onSelectSize={tatacliqFlow.setSelectedSize}
        phone={tatacliqFlow.phone}
        setPhone={tatacliqFlow.setPhone}
        onAddToCart={tatacliqFlow.handleAddToCart}
        onCancel={tatacliqFlow.cancelProductPopup}
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
          subtitle="Search once and browse Nykaa, Westside, Pantaloons & Tata Cliq together."
          searchPlaceholder="Search products across all brands..."
          cardTitle="Unified Shopping"
          cardDescription="Search and buy products from Nykaa, Westside and Pantaloons with voice commands."
        />
      )}
    </div>
  );
}
