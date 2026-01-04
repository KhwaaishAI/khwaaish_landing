// src/pages/Unified/types.ts

export type Marketplace = "flipkart" | "amazon";

export interface FlipkartProduct {
  product_url?: string;
  title?: string;
  price?: string;
  image?: string;
  rating?: string;
  discount?: string;
  original_price?: string;
}

export interface AmazonProduct {
  product_url?: string;
  name?: string;
  title?: string;
  price?: string;
  image_url?: string;
  rating?: string;
  reviews_count?: string;
}

export interface UnifiedResults {
  flipkart: FlipkartProduct[];
  amazon: AmazonProduct[];
  // Needed by flows:
  flipkartSessionId?: string;
  amazonSessionId?: string;
}
