import React from "react";
import PopupLoader from "../PopupLoader";
import type {
  AmazonProductDetails,
  AmazonSearchResultItem,
} from "../../types/amazon";

type Props = {
  open: boolean;
  product: AmazonSearchResultItem | null;
  details: AmazonProductDetails | null;
  loading: boolean;
  onClose: () => void;
  onSelectSize: () => void;
};

export default function AmazonProductDetailsCard({
  open,
  product,
  details,
  loading,
  onClose,
  onSelectSize,
}: Props) {
  if (!open) return null;

  const title = details?.title || product?.name || "Amazon product";
  const price = details?.price || product?.price || "";
  const image =
    (details?.image_urls && details.image_urls[0]) || product?.image_url || "";
  const color = details?.color || "N/A";

  const hasSizes =
    Array.isArray(details?.available_sizes) &&
    details!.available_sizes.length > 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9998]">
      <div className="bg-gray-900 p-6 rounded-2xl w-[92vw] max-w-xl space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Product details
            </h2>
            <p className="text-xs text-gray-400">Amazon</p>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-300">
            <PopupLoader />
            <span className="text-sm">Loading product details...</span>
          </div>
        ) : null}

        <div className="flex gap-4">
          <div className="w-28 h-28 rounded-xl overflow-hidden bg-black/40 shrink-0">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                No image
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="text-sm text-white">{title}</div>
            <div className="text-base font-semibold text-red-300">{price}</div>
            <div className="text-xs text-gray-400">Color: {color}</div>
          </div>
        </div>

        {Array.isArray(details?.about_item) &&
        details!.about_item.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">About</div>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
              {details!.about_item.slice(0, 6).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <button
          onClick={() => {
            console.log("AMAZON UI: Select size clicked from details popup");
            onSelectSize();
          }}
          disabled={loading || !hasSizes}
          className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold disabled:opacity-50 disabled:hover:bg-red-600"
          title={!hasSizes ? "No sizes available for this product" : undefined}
        >
          Select size
        </button>

        {!loading && !hasSizes ? (
          <p className="text-xs text-gray-400">
            Sizes are not available for this product.
          </p>
        ) : null}
      </div>
    </div>
  );
}
