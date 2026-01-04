export type Role = "user" | "system";

export type Message = {
  id: string;
  role: Role;
  content: string;
};

export interface FlipkartProduct {
  url?: string;
  product_url?: string;
  title?: string;
  product_title?: string;
  price?: string;
  image_url?: string;
  rating?: string;
  discount?: string;
  brand?: string;
  name?: string;
  original_price?: string;
  available_sizes?: string[];
}

export interface FlipkartAddress {
  name: string;
  phone: string;
  pincode: string;
  locality: string;
  address_line1: string;
}

export interface FlipkartAddressFromAPI {
  address_id: string;
  name: string;
  phone: string;
  address: string;
  is_default: boolean;
}

// Responses: keep permissive because backend may vary
export type FlipkartSearchResponse = {
  session_id?: string;
  data?: any;
  products?: any[];
  results?: any[];
  [k: string]: any;
};

export type FlipkartAddToCartResponse = {
  status?: string;
  session_id?: string;
  message?: string;
  sizes?: string[];
  requires_otp?: boolean;
  [k: string]: any;
};

export type FlipkartVerifyOtpResponse = {
  status?: string;
  session_id?: string;
  addresses?: FlipkartAddressFromAPI[];
  detail?: string;
  message?: string;
  [k: string]: any;
};

export type FlipkartBuyResponse = {
  status?: string;
  message?: string;
  detail?: string;
  [k: string]: any;
};

export type FlipkartSubmitUpiResponse = {
  status?: string;
  message?: string;
  detail?: string;
  [k: string]: any;
};

// Bodies
export type FlipkartSearchBody = { query: string };

export type FlipkartAddToCartBody = {
  product_url: string;
  product_title?: string;
  phone_number: string;
  size_label?: string;
};

export type FlipkartVerifyOtpBody = {
  session_id: string;
  otp: string;
};

export type FlipkartBuyBody =
  | {
      session_id: string;
      address_id: string;
    }
  | {
      session_id: string;
      address_id: "";
      name: string;
      phone: string;
      pincode: string;
      locality: string;
      address_line1: string;
    };

export type FlipkartSubmitUpiBody = {
  session_id: string;
  upi_id: string;
};
