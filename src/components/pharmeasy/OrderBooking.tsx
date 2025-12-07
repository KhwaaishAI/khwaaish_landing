import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import ProductCard from "./ProductCard";
import StatusIndicator from "./StatusIndicator";
import { Button } from "@/components/ui/button";
import { usePharmEasyFlow } from "./PharmEasyFlowContext";
import { demoProducts } from "@/data/products";
import type { Product } from "@/data/products";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const OrderBooking = () => {
  const { orderData, updateSelectedProducts } = usePharmEasyFlow();
  const [sortBy, setSortBy] = useState("relevance");

  // Convert selected products from context to display format
  const getDisplayProducts = () => {
    return orderData.selectedProducts.map(selected => {
      const product = demoProducts.find(p => p.id === selected.id);
      if (!product) return null;
      
      return {
        id: product.id,
        name: product.name,
        brand: product.manufacturer,
        originalPrice: product.originalPrice,
        discountedPrice: product.currentPrice,
        discountPercent: product.discount,
        quantity: selected.quantity,
        packInfo: product.quantity,
        imageUrl: product.image,
      };
    }).filter(Boolean) as Array<{
      id: string;
      name: string;
      brand: string;
      originalPrice: number;
      discountedPrice: number;
      discountPercent: number;
      quantity: number;
      packInfo: string;
      imageUrl: string;
    }>;
  };

  const [products, setProducts] = useState(getDisplayProducts());

  useEffect(() => {
    setProducts(getDisplayProducts());
  }, [orderData.selectedProducts]);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemove(id);
      return;
    }
    updateSelectedProducts(
      orderData.selectedProducts.map(p =>
        p.id === id ? { ...p, quantity } : p
      )
    );
  };

  const handleRemove = (id: string) => {
    updateSelectedProducts(
      orderData.selectedProducts.filter(p => p.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Status Header */}
        <div className="space-y-3">
          <StatusIndicator type="loading" text="Executing your Khwaaish....." />
          
          <p className="text-foreground">
            Please Provide the Location and other details for the booking to proceed.
          </p>

          <div className="space-y-2">
            <StatusIndicator
              type="success"
              text="Order location & Mobile number confirmed"
              linkText="Check"
              linkHref="#"
            />
            <StatusIndicator type="success" text="Product found" />
          </div>
        </div>

        {/* Product Selection Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Select your product
            </h2>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  Sort
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("relevance")}>
                  Relevance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-low")}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-high")}>
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("discount")}>
                  Discount
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Product Cards */}
          <div className="space-y-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {products.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">No products selected</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-4">
          <StatusIndicator type="waiting" text="Waiting for the details confirmation...." />
          
          <Button 
            className="bg-secondary hover:bg-secondary/80 text-foreground"
            disabled={products.length === 0}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderBooking;
