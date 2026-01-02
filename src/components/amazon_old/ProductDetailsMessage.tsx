import type { Product, ProductDetails } from "../../types/amazon_old";

type Props = {
  details: ProductDetails;
  product: Product;
};

export default function ProductDetailsMessage({ details, product }: Props) {
  return (
    <div className="space-y-4 p-4 bg-gray-900/50 rounded-xl">
      <h3 className="text-lg font-semibold text-white">Product Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {details.image_urls && details.image_urls.length > 0 && (
          <div className="space-y-2">
            <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={details.image_urls[0]}
                alt={details.title || "Product image"}
                className="w-full h-full object-contain"
              />
            </div>

            {details.image_urls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {details.image_urls
                  .slice(0, 4)
                  .map((url: string, idx: number) => (
                    <div
                      key={idx}
                      className="w-16 h-16 bg-gray-800 rounded-md overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={url}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-400">Title</h4>
            <p className="text-white">
              {details.title?.trim() || product?.name}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400">Price</h4>
            <p className="text-xl font-bold text-yellow-400">
              {details.price || product?.price}
            </p>
          </div>

          {details.color && (
            <div>
              <h4 className="text-sm font-medium text-gray-400">Color</h4>
              <p className="text-white">{details.color.trim()}</p>
            </div>
          )}

          {details.available_sizes && details.available_sizes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400">
                Available Sizes
              </h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {details.available_sizes.map((size: string) => (
                  <span
                    key={size}
                    className="px-3 py-1 bg-gray-800 rounded-lg text-sm"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {details.about_item && details.about_item.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400">
                About this item
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 mt-1">
                {details.about_item.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
