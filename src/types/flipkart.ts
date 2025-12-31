
export interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

export interface Product {
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
  image?: string; // used in UI rendering
}

export interface Address {
  name: string;
  phone: string;
  pincode: string;
  locality: string;
  address_line1: string;
}

export interface AddressFromAPI {
  address_id: string;
  name: string;
  phone: string;
  address: string;
  is_default: boolean;
}
