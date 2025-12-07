
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  quantity: number;
  packInfo: string;
  imageUrl: string;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const ProductCard = ({
  id,
  name,
  brand,
  originalPrice,
  discountedPrice,
  discountPercent,
  quantity,
  packInfo,
  imageUrl,
  onQuantityChange,
  onRemove,
}: ProductCardProps) => {
  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(id, quantity - 1);
    }
  };

  const handleIncrement = () => {
    onQuantityChange(id, quantity + 1);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 transition-all hover:border-muted-foreground/30">
      <div className="flex items-start gap-4">
        {/* Product Image */}
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">By {brand}</p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Qty :</span>
              <div className="flex items-center rounded-md border border-border overflow-hidden">
                <button
                  onClick={handleDecrement}
                  className="px-3 py-1.5 text-foreground hover:bg-secondary transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-3 py-1.5 min-w-[40px] text-center font-medium bg-secondary/50">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="px-3 py-1.5 text-foreground hover:bg-secondary transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Price and Remove */}
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  ₹{originalPrice.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  ₹{discountedPrice.toFixed(1)}
                </span>
                <span className="rounded bg-success/20 px-1.5 py-0.5 text-xs font-medium text-success">
                  {discountPercent}% off
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{packInfo}</p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(id)}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
