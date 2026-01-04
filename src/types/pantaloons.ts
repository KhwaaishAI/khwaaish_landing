export type Role = "user" | "system";

export type Message = {
  id: string;
  role: Role;
  content: string;
};

export type PantaloonsProduct = {
  productname: string;
  producturl: string;
  imageurl?: string;
  price?: string;
};

export type ProductListMessage = {
  type: "productlist";
  products: PantaloonsProduct[];
};

export type PantaloonsProductInfoResponse = {
  productname?: string;
  price?: string;
  sizes?: string[];
  // allow backend variations without breaking UI
  [k: string]: any;
};

export type PantaloonsSessionCheckResponse = {
  detail?: string;
  [k: string]: any;
};

export type PantaloonsLoginResponse = {
  detail?: string;
  status?: string;
  [k: string]: any;
};

export type PantaloonsVerifyOtpResponse = {
  detail?: string;
  status?: string;
  [k: string]: any;
};

export type PantaloonsAutomationRunBody = {
  phone: string;
  product: {
    product_url: string;
    size: string;
    quantity: number;
  };
  coupon?: {
    coupon_code?: string;
  };
  address: {
    old_user: boolean;
    change_address: boolean;
    new_user: boolean;
    fname: string;
    phone: string;
    pincode: string;
    building: string;
    street: string;
    area: string;
    landmark: string;
  };
  payment: {
    upi_id: string;
  };
};

export type PantaloonsAutomationRunResponse = {
  status?: string;
  detail?: string;
  [k: string]: any;
};
