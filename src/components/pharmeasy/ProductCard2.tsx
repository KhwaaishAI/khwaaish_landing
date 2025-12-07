
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";


export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  originalPrice: number;
  currentPrice: number;
  discount: number;
  quantity: string;
  image: string;
}
interface ProductCardProps {
  product: Product;
  className?: string;
  onAddToCart?: (productId: string) => void;
}

const ProductCard2 = ({ product, className = "", onAddToCart }: ProductCardProps) => {
  return (
    <div
      className={`relative flex flex-col bg-card border border-border rounded-lg overflow-hidden min-w-[200px] w-[200px] transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 ${className}`}
    >
      {/* Product Image */}
      <div className="relative h-36 bg-muted overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-1 p-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground">By {product.manufacturer}</p>
        
        {/* Pricing */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground line-through">
            ₹{product.originalPrice.toFixed(2)}
          </span>
          <span className="text-base font-bold text-foreground">
            ₹{product.currentPrice.toFixed(2)}
          </span>
        </div>

        {/* Quantity & Discount */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">{product.quantity}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
            {product.discount}% off
          </Badge>
        </div>

        {/* Add to Cart Button */}
        {onAddToCart && (
          <Button
            onClick={() => onAddToCart(product.id)}
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1.5 h-auto"
            size="sm"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard2;
