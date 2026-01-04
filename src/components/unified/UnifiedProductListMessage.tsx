import type { AmazonProduct, FlipkartProduct } from "../../types/unified";
import CombinedResults from "./CombinedResults";

type Props = {
  flipkartProducts: FlipkartProduct[];
  amazonProducts: AmazonProduct[];
  lastSearchQuery: string;

  onFlipkartSelect: (p: FlipkartProduct) => void;
  onAmazonSelect: (p: AmazonProduct) => void;
};

export default function UnifiedProductListMessage({
  flipkartProducts,
  amazonProducts,
  lastSearchQuery,
  onFlipkartSelect,
  onAmazonSelect,
}: Props) {
  return (
    <div className="w-full rounded-2xl border border-gray-800 bg-gray-900/40 p-4">
      <div className="mb-3">
        <p className="text-sm text-gray-300">
          Results for{" "}
          <span className="text-white font-semibold">{lastSearchQuery}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Pick any product to continue checkout in that marketplace.
        </p>
      </div>

      <CombinedResults
        flipkartProducts={flipkartProducts}
        amazonProducts={amazonProducts}
        lastSearchQuery={lastSearchQuery}
        onFlipkartSelect={onFlipkartSelect}
        onAmazonSelect={onAmazonSelect}
      />
    </div>
  );
}
