import { useState } from "react";
import { ChevronRight, CheckCircle2, ChevronDown } from "lucide-react";
import ProductCard2 from "./ProductCard2";
import { demoProducts }  from "@/data/products";
import type { Product } from '@/data/products';
import { Button } from "@/components/ui/button";
import { usePharmEasyFlow } from "./PharmEasyFlowContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProductList = () => {
  const [products] = useState<Product[]>(demoProducts);
  const [sortBy, setSortBy] = useState<string>("default");
  const { updateSelectedProducts, orderData } = usePharmEasyFlow();

  const handleAddToCart = (productId: string) => {
    const existingProduct = orderData.selectedProducts.find(p => p.id === productId);
    if (existingProduct) {
      // Increase quantity if already in cart
      updateSelectedProducts(
        orderData.selectedProducts.map(p =>
          p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      // Add new product to cart
      updateSelectedProducts([
        ...orderData.selectedProducts,
        { id: productId, quantity: 1 }
      ]);
    }
  };

  const sortProducts = (items: Product[], sort: string) => {
    const sorted = [...items];
    switch (sort) {
      case "price-low":
        return sorted.sort((a, b) => a.currentPrice - b.currentPrice);
      case "price-high":
        return sorted.sort((a, b) => b.currentPrice - a.currentPrice);
      case "discount":
        return sorted.sort((a, b) => b.discount - a.discount);
      default:
        return sorted;
    }
  };

  const sortedProducts = sortProducts(products, sortBy);
  const displayProducts = sortedProducts.slice(0, 3);

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Status Messages */}
      <div className="mb-6 space-y-2">
        <p className="text-sm text-foreground flex items-center gap-2">
          <span className="text-destructive">★</span>
          <span className="text-muted-foreground">Executing your Khwaaish.....</span>
        </p>
        <p className="text-sm text-foreground">
          Please provide the delivery location and mobile number for the order to proceed.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Order location & Mobile number confirmed</span>
          <a href="#" className="text-primary hover:underline">Check</a>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Product found</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Select your product</h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-1">
              Sort
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy("default")}>
              Default
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("price-low")}>
              Price: Low to High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("price-high")}>
              Price: High to Low
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("discount")}>
              Highest Discount
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Product Cards */}
      <div className="flex gap-4 items-stretch">
        {/* Scrollable Products */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {displayProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard2 product={product} onAddToCart={handleAddToCart} />
            </div>
          ))}
        </div>

        {/* View All Button/Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center min-w-[100px] bg-secondary hover:bg-secondary/80 rounded-lg border border-border transition-all duration-300 hover:border-primary/50 px-4">
              <span className="text-sm font-medium text-foreground">View All</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
            </button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg bg-background border-border overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-foreground">All Products ({products.length})</SheetTitle>
            </SheetHeader>
            <div className="mt-6 grid gap-4">
              {sortedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard2 product={product} className="w-full min-w-full" />
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ProductList;
