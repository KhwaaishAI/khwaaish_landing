export type AmazonSearchBody = {
  query: string;
};

export type AmazonSearchResultItem = {
  name: string;
  price: string;
  product_url: string;
  image_url: string;
  rating?: string;
  reviews_count?: string;
};

export type AmazonSearchResponse = {
  session_id: string;
  query: string;
  results: AmazonSearchResultItem[];
};

export type AmazonGetProductDetailsBody = {
  session_id: string;
  product_url: string;
};

export type AmazonProductDetails = {
  title: string;
  price: string;
  available_sizes: string[];
  available_colors: string[];
  color?: string;
  image_urls: string[];
  about_item: string[];
};

export type AmazonGetProductDetailsResponse = {
  session_id: string;
  status: "success" | "error";
  details?: AmazonProductDetails;
  message?: string;
};

export type AmazonAddToCartBody = {
  session_id: string;
  size: string;
};

export type AmazonAddToCartResponse = {
  session_id: string;
  status: "success" | "error";
  message?: string;
  detail?: string;
};

export type AmazonLoginBody = {
  session_id: string;
  phone: string;
};

export type AmazonLoginResponse = {
  session_id: string;
  status: "success" | "error";
  message?: string;
  detail?: string;
};

export type AmazonSubmitOtpBody = {
  session_id: string;
  otp: string;
};

export type AmazonShippingAddress = {
  index: number;
  customer_name: string;
  address: string;
};

export type AmazonSubmitOtpResponse = {
  session_id: string;
  status: "success" | "error";
  message?: string;
  detail?: string;
  shipping_address?: AmazonShippingAddress[];
};

export type AmazonAddAddressBody = {
  session_id: string;
  full_name: string;
  mobile_number: string;
  pincode: string;
  house_no: string;
  area: string;
  landmark: string;
};

export type AmazonAddAddressResponse = {
  session_id: string;
  status: "success" | "error";
  message?: string;
  detail?: string;
  // If your backend returns something else, adjust here.
  address_index?: number;
};

export type AmazonPayWithUpiBody = {
  session_id: string;
  upi_id: string;
  address_index?: number; // optional per your rule
};

export type AmazonPayWithUpiResponse = {
  session_id: string;
  status: "success" | "error";
  message?: string;
  detail?: string;
};
