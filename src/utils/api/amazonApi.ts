import type {
  AmazonSearchBody,
  AmazonSearchResponse,
  AmazonGetProductDetailsBody,
  AmazonGetProductDetailsResponse,
  AmazonAddToCartBody,
  AmazonAddToCartResponse,
  AmazonLoginBody,
  AmazonLoginResponse,
  AmazonSubmitOtpBody,
  AmazonSubmitOtpResponse,
  AmazonAddAddressBody,
  AmazonAddAddressResponse,
  AmazonPayWithUpiBody,
  AmazonPayWithUpiResponse,
} from "../../types/amazon";

const normalizeBaseURL = (BaseURL: string) => BaseURL.replace(/\/+$/, "");

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function amazonSearch(BaseURL: string, payload: AmazonSearchBody) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("AMAZON API POST /amazon/search-amazon body:", body);

  const res = await fetch(`${BaseURL}/amazon/search-amazon`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as AmazonSearchResponse | any;
  console.log("AMAZON API /amazon/search-amazon response:", data);
  return { res, data, body };
}

export async function amazonGetProductDetails(
  BaseURL: string,
  payload: AmazonGetProductDetailsBody
) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("AMAZON API POST /amazon/get-product-details body:", body);

  const res = await fetch(`${BaseURL}/amazon/get-product-details`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as AmazonGetProductDetailsResponse | any;
  console.log("AMAZON API /amazon/get-product-details response:", data);
  return { res, data, body };
}

export async function amazonAddToCart(
  BaseURL: string,
  payload: AmazonAddToCartBody
) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("AMAZON API POST /amazon/add-to-cart body:", body);

  const res = await fetch(`${BaseURL}/amazon/add-to-cart`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as AmazonAddToCartResponse | any;
  console.log("AMAZON API /amazon/add-to-cart response:", data);
  return { res, data, body };
}

export async function amazonLogin(BaseURL: string, payload: AmazonLoginBody) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("AMAZON API POST /amazon/login body:", body);

  const res = await fetch(`${BaseURL}/amazon/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as AmazonLoginResponse | any;
  console.log("AMAZON API /amazon/login response:", data);
  return { res, data, body };
}

export async function amazonSubmitOtp(
  BaseURL: string,
  payload: AmazonSubmitOtpBody
) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("AMAZON API POST /amazon/submit-otp body:", body);

  const res = await fetch(`${BaseURL}/amazon/submit-otp`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as AmazonSubmitOtpResponse | any;
  console.log("AMAZON API /amazon/submit-otp response:", data);
  return { res, data, body };
}

export async function amazonAddAddress(
  BaseURL: string,
  payload: AmazonAddAddressBody
) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("AMAZON API POST /amazon/add-address body:", body);

  const res = await fetch(`${BaseURL}/amazon/add-address`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as AmazonAddAddressResponse | any;
  console.log("AMAZON API /amazon/add-address response:", data);
  return { res, data, body };
}

export async function amazonPayWithUpi(
  BaseURL: string,
  payload: AmazonPayWithUpiBody
) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("AMAZON API POST /amazon/pay-with-upi body:", body);

  const res = await fetch(`${BaseURL}/amazon/pay-with-upi`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await safeJson(res)) as AmazonPayWithUpiResponse | any;
  console.log("AMAZON API /amazon/pay-with-upi response:", data);
  return { res, data, body };
}
