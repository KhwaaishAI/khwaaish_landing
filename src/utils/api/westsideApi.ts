import type { WestsideBuyWithAddressBody } from "../../types/westside";

const normalizeBaseURL = (BaseURL: string) =>
  (BaseURL || "").replace(/\/+$/, "");

export async function westsideSearch(BaseURL: string, query: string) {
  const body = { query, max_items: 5 };
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/westside/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(data);
  return { res, data, body };
}

export async function westsideView(BaseURL: string, product_url: string) {
  const body = { product_url };
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/westside/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { res, data, body };
}

export async function westsideAddToCart(
  BaseURL: string,
  product_url: string,
  size: string
) {
  const body = { product_url, size };
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/westside/add-to-cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(data);
  return { res, data, body };
}

export async function westsideAccountCheck(
  BaseURL: string,
  session_id: string
) {
  const body = { session_id };
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/westside/account-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { res, data, body };
}

export async function westsideLogin(
  BaseURL: string,
  session_id: string,
  mobile: string
) {
  const body = { session_id, mobile };
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/westside/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  console.log("WESTSIDE LOGIN about to call /login", {
    body,
    mobileLen: mobile.replace(/\D/g, "").length,
  });

  return { res, data, body };
}

export async function westsideVerifyOtp(
  BaseURL: string,
  session_id: string,
  otp: string
) {
  const body = { session_id, otp };
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/westside/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { res, data, body };
}

export async function westsideBuyWithAddress(
  BaseURL: string,
  payload: WestsideBuyWithAddressBody
) {
  BaseURL = normalizeBaseURL(BaseURL);
  const res = await fetch(`${BaseURL}/api/westside/buy-with-address`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { res, data, body: payload };
}
