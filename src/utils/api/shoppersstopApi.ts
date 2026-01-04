import type {
  ShoppersStopAddAddressBody,
  ShoppersStopPaymentBody,
  ShoppersStopSignupBody,
} from "../../types/shoppersstop";

const normalizeBaseURL = (BaseURL: string) =>
  (BaseURL || "").replace(/\/+$/, "");

export async function shoppersstopSearch(BaseURL: string, query: string) {
  BaseURL = normalizeBaseURL(BaseURL);
  const body = { query, max_items: 30 };
  const res = await fetch(`${BaseURL}/api/shoppersstop/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { res, data, body };
}

export async function shoppersstopView(BaseURL: string, product_url: string) {
  const body = { product_url };
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/shoppersstop/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { res, data, body };
}

export async function shoppersstopAddToCart(
  BaseURL: string,
  product_url: string,
  size: string,
  phone: string
) {
  const body = { product_url, size, phone };
  BaseURL = normalizeBaseURL(BaseURL);

  // FIX: shoppersstop add-to-cart should be under /api/shoppersstop
  const res = await fetch(`${BaseURL}/api/shoppersstop/add-to-cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return { res, data, body };
}

export async function shoppersstopVerifyOtp(
  BaseURL: string,
  session_id: string,
  otp: string
) {
  const body = { session_id, otp };
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/shoppersstop/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { res, data, body };
}

export async function shoppersstopSignup(
  BaseURL: string,
  payload: ShoppersStopSignupBody
) {
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/shoppersstop/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { res, data, body: payload };
}

export async function shoppersstopSaveAddress(
  BaseURL: string,
  session_id: string
) {
  const body = { session_id };
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/shoppersstop/save-address`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { res, data, body };
}

export async function shoppersstopAddAddress(
  BaseURL: string,
  payload: ShoppersStopAddAddressBody
) {
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/shoppersstop/add-address`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { res, data, body: payload };
}

export async function shoppersstopPayment(
  BaseURL: string,
  payload: ShoppersStopPaymentBody
) {
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/shoppersstop/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { res, data, body: payload };
}
