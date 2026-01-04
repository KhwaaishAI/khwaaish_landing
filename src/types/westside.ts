export type Role = "user" | "system";

export type Message = {
  id: string;
  role: Role;
  content: string;
};

export type WestsideProduct = {
  product_name: string;
  product_url: string;
  image_url: string;
  price: string;
};

export type WestsideViewResponse = {
  product_name: string;
  price: string;
  sizes: string[];
};

export type WestsideCartResponse = {
  session_id: string;
  total_items: string;
  total_mrp: string;
  discount_mrp: string;
  total_amount: string;
};

export type WestsideAccountCheckResponse = {
  session_id: string;
  has_saved_account: boolean;
  status: string;
  message: string;
};

export type WestsideBuyWithAddressBody = {
  session_id: string;
  upi_id: string;
  address_id?: string;
  first_name: string;
  last_name: string;
  address1: string;
  address2: string;
  city: string;
  state_code: string;
  pincode: string;
  phone: string;
};

export type WestsideAddress = Omit<
  WestsideBuyWithAddressBody,
  "session_id" | "upi_id"
>;

export type ProductListMessage = {
  type: "productlist";
  products: WestsideProduct[];
};
