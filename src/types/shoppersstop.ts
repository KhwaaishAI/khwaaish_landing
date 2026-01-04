export type Role = "user" | "system";

export type Message = {
  id: string;
  role: Role;
  content: string;
};

export type ShoppersStopProduct = {
  product_id: string;
  brand: string;
  title: string;
  price: string;
  mrp: string | null;
  discount: string | null;
  image_url: string;
  url: string;
};

export type ShoppersStopSearchResponse = {
  status: string;
  products: ShoppersStopProduct[];
  message?: string;
};

export type ShoppersStopSize = {
  sku: string;
  label: string;
};

export type ShoppersStopViewResponse = {
  status: string;
  sizes: ShoppersStopSize[];
  message?: string;
};

export type ShoppersStopAddToCartResponse = {
  status: string;
  message?: string;
  session_id?: string;
};

export type ShoppersStopBill = {
  total_mrp: string;
  offer_discount: string | null;
  savings: string | null;
  delivery_fee: string;
  total_payable: string;
};

export type ShoppersStopVerifyOtpResponse = {
  status: "success" | "signup_required" | string;
  message?: string;
  bill?: ShoppersStopBill;
  session_id?: string;
};

export type ShoppersStopSignupBody = {
  session_id: string;
  name: string;
  email: string;
  gender: "Male" | "Female" | "Other" | string;
};

export type ShoppersStopSignupResponse = {
  status: string;
  message?: string;
  bill?: ShoppersStopBill;
  session_id?: string;
};

export type ShoppersStopAddress = {
  address_id: string;
  label: string;
  name: string;
  address: string;
  phone: string;
  index: number;
};

export type ShoppersStopSaveAddressResponse = {
  status: string;
  message?: string;
  addresses: ShoppersStopAddress[];
  bill?: ShoppersStopBill;
  session_id?: string;
};

export type ShoppersStopAddAddressBody = {
  session_id: string;
  name: string;
  mobile: string;
  pincode: string;
  address: string;
  type: "Home" | "Work" | string;
};

export type ShoppersStopAddAddressResponse = {
  status: string;
  message?: string;
};

export type ShoppersStopPaymentBody = {
  session_id: string;
  address_id: string;
  upi_id: string;
};

export type ShoppersStopPaymentResponse = {
  status: string;
  message?: string;
};

export type ProductListMessageSS = {
  type: "productlist_shoppersstop";
  products: ShoppersStopProduct[];
};
