export type Role = "user" | "system";

export type Message = {
  id: string;
  role: Role;
  content: string;
};

export type NykaaProduct = {
  brand?: string;
  name: string;
  price?: string;
  originalprice?: string;
  discount?: string;
  rating?: string | number;
  imageurl?: string;
  availablesizes?: string[];
};

export type NykaaAddress = {
  pincode: string;
  house: string;
  area: string;
  name: string;
  phone: string;
  email: string;
};

export type PendingNykaaCart = {
  product_name: string;
  size: string;
};

export type ProductListMessage = {
  type: "productlist";
  products: NykaaProduct[];
};
