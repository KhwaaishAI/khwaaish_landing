import React, { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  brand: "zara" | "pantaloon";
  product_url: string;
  source: string;
}

interface ProductComparisonProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({
  products,
  onProductSelect,
  onAddToCart,
}) => {
  const [cartSelections, setCartSelections] = useState<{
    [key: string]: { quantity: number; product: Product };
  }>({});
  const [selectedProductKey, setSelectedProductKey] = useState<string | null>(
    null
  );

  const zaraProducts = products.filter((p) => p.source === "zara");
  const pantaloonProducts = products.filter((p) => p.source === "pantaloon");

  const renderProductCard = (p: Product, index: number) => {
    const key = `${p.name}|${p.price}|${p.source}`;
    const qty = cartSelections[key]?.quantity || 0;
    const isSelected = selectedProductKey === key;
    const isZara = p.source === "zara";

    return (
      <div
        key={key + index}
        onClick={() => {
          setSelectedProductKey(key);
          onProductSelect(p);
        }}
        className={`relative flex flex-col bg-[#11121a] rounded-2xl overflow-hidden shadow-sm transition-colors cursor-pointer ${
          isSelected ? "bg-[#181924]" : "hover:bg-[#151622]"
        }`}
      >
        {isSelected && (
          <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">
            +1
          </div>
        )}

        <div className="relative w-full h-48 bg-gray-800">
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="flex-1 flex flex-col px-3 py-3 gap-2">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[10px] px-2 py-1 rounded-full ${
                isZara
                  ? "bg-blue-500/15 text-blue-300"
                  : "bg-purple-500/15 text-purple-300"
              }`}
            >
              {isZara ? "Zara" : "Pantaloon"}
            </span>
            {!isZara && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-300">
                Limited
              </span>
            )}
          </div>

          <div className="space-y-1 min-h-[48px]">
            <p className="text-sm font-semibold text-white line-clamp-2">
              {p.name}
            </p>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <p className="text-base font-bold text-white">₹{p.price}</p>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() =>
                  setCartSelections((prev) => {
                    const current = prev[key] || {
                      quantity: 0,
                      product: p,
                    };
                    return {
                      ...prev,
                      [key]: {
                        ...current,
                        quantity: Math.max(current.quantity - 1, 0),
                      },
                    };
                  })
                }
                className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-sm hover:bg-gray-700"
              >
                -
              </button>
              <span className="w-6 text-center text-sm">{qty}</span>
              <button
                onClick={() =>
                  setCartSelections((prev) => {
                    const current = prev[key] || {
                      quantity: 0,
                      product: p,
                    };
                    return {
                      ...prev,
                      [key]: {
                        ...current,
                        quantity: current.quantity + 1,
                      },
                    };
                  })
                }
                className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-sm hover:bg-red-500"
              >
                +
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (qty > 0) {
                  onAddToCart(p);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                qty > 0
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
              disabled={qty === 0}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-2">Here are your options:</h3>

      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Zara Column */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-black px-4 py-2 rounded-full">
                <span className="font-bold">ZARA</span>
                <span className="text-xs bg-green-500 px-2 py-1 rounded">
                  Available
                </span>
              </div>
            </div>

            {zaraProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {zaraProducts.map((product, index) =>
                  renderProductCard(product, index)
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-800 rounded-xl p-6">
                  <p className="text-gray-400">No products found from Zara</p>
                </div>
              </div>
            )}
          </div>

          {/* Pantaloon Column */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-black px-4 py-2 rounded-full">
                <span className="font-bold">PANTALOON</span>
                <span className="text-xs bg-yellow-500 px-2 py-1 rounded">
                  {pantaloonProducts.length > 0 ? "Available" : "Limited"}
                </span>
              </div>
            </div>

            {pantaloonProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pantaloonProducts.map((product, index) =>
                  renderProductCard(product, index)
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-800 rounded-xl p-6 border border-yellow-500/50">
                  <div className="text-yellow-500 mb-2">
                    <svg
                      className="w-8 h-8 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.67 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-300">
                    Pantaloon service is currently unavailable
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Please select products from Zara
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="text-center text-gray-400 text-sm">
            <p>Select a product to continue with checkout process</p>
            <p className="mt-1">
              Zara services are fully operational • Pantaloon services may be
              limited
            </p>
          </div>

          {Object.values(cartSelections).some((item) => item.quantity > 0) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  const items = Object.values(cartSelections).filter(
                    (item) => item.quantity > 0
                  );
                  if (items.length > 0) {
                    const hasZara = items.some(
                      (item) => item.product.source === "zara"
                    );
                    if (hasZara) {
                      onAddToCart(items[0].product);
                    }
                  }
                }}
                className="px-5 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-red-500/25"
              >
                Confirm Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;
