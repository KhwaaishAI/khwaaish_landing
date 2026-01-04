import type {
  FlipkartSearchBody,
  FlipkartSearchResponse,
  FlipkartAddToCartBody,
  FlipkartAddToCartResponse,
  FlipkartVerifyOtpBody,
  FlipkartVerifyOtpResponse,
  FlipkartBuyBody,
  FlipkartBuyResponse,
  FlipkartSubmitUpiBody,
  FlipkartSubmitUpiResponse,
} from "../../types/flipkart";

const normalizeBaseURL = (BaseURL: string) =>
  (BaseURL || "").replace(/\/+$/, "");

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function flipkartSearch(
  BaseURL: string,
  payload: FlipkartSearchBody
) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("FLIPKART API POST /api/flipkart/search body:", body);

  const res = await fetch(`${BaseURL}/api/flipkart/search`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as FlipkartSearchResponse | null;
  console.log("FLIPKART API /api/flipkart/search response:", data);

  return { res, data, body };
}

export async function flipkartAddToCart(
  BaseURL: string,
  payload: FlipkartAddToCartBody
) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("FLIPKART API POST /api/flipkart/add-to-cart body:", body);

  const res = await fetch(`${BaseURL}/api/flipkart/add-to-cart`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as FlipkartAddToCartResponse | null;
  console.log("FLIPKART API /api/flipkart/add-to-cart response:", data);

  return { res, data, body };
}

export async function flipkartVerifyOtp(
  BaseURL: string,
  payload: FlipkartVerifyOtpBody
) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("FLIPKART API POST /api/flipkart/verify-otp body:", body);

  const res = await fetch(`${BaseURL}/api/flipkart/verify-otp`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as FlipkartVerifyOtpResponse | null;
  console.log("FLIPKART API /api/flipkart/verify-otp response:", data);

  return { res, data, body };
}

export async function flipkartBuy(BaseURL: string, payload: FlipkartBuyBody) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("FLIPKART API POST /api/flipkart/buy body:", body);

  const res = await fetch(`${BaseURL}/api/flipkart/buy`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as FlipkartBuyResponse | null;
  console.log("FLIPKART API /api/flipkart/buy response:", data);

  return { res, data, body };
}

export async function flipkartSubmitUpi(
  BaseURL: string,
  payload: FlipkartSubmitUpiBody
) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("FLIPKART API POST /api/flipkart/submit-upi body:", body);

  const res = await fetch(`${BaseURL}/api/flipkart/submit-upi`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as FlipkartSubmitUpiResponse | null;
  console.log("FLIPKART API /api/flipkart/submit-upi response:", data);

  return { res, data, body };
}
