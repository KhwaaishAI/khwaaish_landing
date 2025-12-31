export interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

export interface Product {
  name?: string;
  title?: string;
  price?: string;
  product_url?: string;
  image_url?: string;
  rating?: string;
  reviews_count?: string;
}

export interface ProductDetails {
  title?: string;
  price?: string;
  available_sizes?: string[];
  color?: string;
  image_urls?: string[];
  about_item?: string[];
}

export interface Address {
  full_name: string;
  mobile_number: string;
  pincode: string;
  house_no: string;
  area: string;
  landmark: string;
}
