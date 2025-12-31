import type { Product } from "../../types/flipkart";
import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  pendingProduct: Product | null;
  availableSizes: string[];
  selectedSize: string;
  setSelectedSize: (v: string) => void;
  isClothingSearch: boolean;
  loadingCart: boolean;
  onConfirm: () => void;
  onSkipNonClothing: () => Promise<void> | void;
};

export default function SizePopup({
  open,
  pendingProduct,
  availableSizes,
  selectedSize,
  setSelectedSize,
  isClothingSearch,
  loadingCart,
  onConfirm,
  onSkipNonClothing,
}: Props) {
  if (!open || !pendingProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Select Size</h2>

        <div className="bg-gray-800 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-300">
            {pendingProduct.title || "Product"}
          </p>
          <p className="text-green-400 font-semibold mt-1">
            {pendingProduct.price}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(availableSizes.length > 0
            ? availableSizes
            : ["S", "M", "L", "XL", "XXL"]
          ).map((size: string) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedSize === size
                  ? "border-red-500 bg-red-500/20 text-white"
                  : "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <button
          onClick={onConfirm}
          disabled={(isClothingSearch && !selectedSize) || loadingCart}
          className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
        >
          {loadingCart ? (
            <PopupLoader />
          ) : isClothingSearch ? (
            "Add to Cart"
          ) : (
            "Continue"
          )}
        </button>

        {!isClothingSearch && (
          <button
            onClick={onSkipNonClothing}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold mt-2"
          >
            Skip Size Selection
          </button>
        )}
      </div>
    </div>
  );
}
