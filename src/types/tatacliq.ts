export type Role = "user" | "system";

export type Message = {
  id: string;
  role: Role;
  content: string; // plain text OR JSON string
};

export type TataCliqProduct = {
  brand: string | null;
  title: string;
  price: string | null;
  mrp: string | null;
  discount: string | null;
  rating: string | null;
  reviews: string | null;
  image_url: string | null;
  url: string;
};

export type TataCliqSearchResponse = {
  status: string; // "success" | ...
  products: TataCliqProduct[];
  message?: string;
};

export type TataCliqViewResponse = {
  status: string; // "success" | ...
  sizes: string[];
  message?: string;
};

export type TataCliqAddToCartResponse = {
  status: string; // "success" | ...
  message?: string;
  session_id?: string;
  bill?: {
    coupon_code?: string | null;
    summary?: Record<string, unknown>;
  };
};

export type ProductListMessageTataCliq = {
  type: "productlisttatacliq";
  products: TataCliqProduct[];
};
