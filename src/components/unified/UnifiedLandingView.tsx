import type { AmazonProduct, FlipkartProduct } from "../../types/unified";
import CombinedResults from "./CombinedResults";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  onSearch: () => void;

  isLoading: boolean;
  lastSearchQuery: string;

  flipkartProducts: FlipkartProduct[];
  amazonProducts: AmazonProduct[];

  onFlipkartSelect: (p: FlipkartProduct) => void;
  onAmazonSelect: (p: AmazonProduct) => void;
};

export default function UnifiedLandingView({
  query,
  setQuery,
  onSearch,
  isLoading,
  lastSearchQuery,
  flipkartProducts,
  amazonProducts,
  onFlipkartSelect,
  onAmazonSelect,
}: Props) {
  return (
    <div className="min-h-screen w-screen bg-black text-white">
      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-3">
              <img src="/images/LOGO.png" alt="" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl flex items-center justify-center sm:text-3xl font-semibold">
                Search Flipkart + Amazon
              </h2>
              <p className="text-gray-400 text-base sm:text-lg">
                Type a product query and get results from both marketplaces
              </p>
            </div>

            <div className="w-full relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSearch();
                  }
                }}
                placeholder="Search for products on Flipkart & Amazon..."
                className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                <button
                  onClick={onSearch}
                  className={`p-2 ${
                    query
                      ? "bg-white/20 hover:bg-white/30"
                      : "bg-white/10 hover:bg-white/20"
                  } rounded-full transition-colors`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
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
                  )}
                </button>
              </div>
            </div>

            <CombinedResults
              flipkartProducts={flipkartProducts}
              amazonProducts={amazonProducts}
              lastSearchQuery={lastSearchQuery}
              onFlipkartSelect={onFlipkartSelect}
              onAmazonSelect={onAmazonSelect}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
