import type { AmazonProduct, FlipkartProduct } from "../../types/unified";
import AmazonProductGrid from "./AmazonProductGrid";
import FlipkartProductGrid from "./FlipkartProductGrid";

type Props = {
  flipkartProducts: FlipkartProduct[];
  amazonProducts: AmazonProduct[];
  lastSearchQuery: string;

  onFlipkartSelect: (p: FlipkartProduct) => void;
  onAmazonSelect: (p: AmazonProduct) => void;
};

export default function CombinedResults({
  flipkartProducts,
  amazonProducts,
  lastSearchQuery,
  onFlipkartSelect,
  onAmazonSelect,
}: Props) {
  const hasAny =
    (flipkartProducts?.length || 0) > 0 || (amazonProducts?.length || 0) > 0;

  if (!hasAny) return null;

  return (
    <div className="space-y-10">
      <FlipkartProductGrid
        products={flipkartProducts}
        lastSearchQuery={lastSearchQuery}
        onSelect={onFlipkartSelect}
      />

      <AmazonProductGrid
        products={amazonProducts}
        lastSearchQuery={lastSearchQuery}
        onSelect={onAmazonSelect}
      />
    </div>
  );
}
