import type { PantaloonsAutomationRunBody } from "../../types/pantaloons";

const normalizeBaseURL = (BaseURL: string) =>
  (BaseURL || "").replace(/\/+$/, "");

export async function pantaloonsSearch(
  BaseURL: string,
  payload: { query: string; page: number; sort_by: string }
) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("PANTALOONS API POST /shoping/search body:", body);

  const res = await fetch(`${BaseURL}/shoping/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  console.log("PANTALOONS API /shoping/search response:", data);

  return { res, data, body };
}

export async function pantaloonsGetProductInfo(
  BaseURL: string,
  params: { product_url: string; pincode: string }
) {
  const qs = new URLSearchParams({
    product_url: params.product_url,
    pincode: params.pincode,
  }).toString();
  BaseURL = normalizeBaseURL(BaseURL);

  console.log(
    "PANTALOONS API GET /shoping/search/get_product_info params:",
    params
  );

  const res = await fetch(`${BaseURL}/shoping/search/get_product_info?${qs}`, {
    method: "GET",
  });

  const data = await res.json().catch(() => ({}));
  console.log(
    "PANTALOONS API /shoping/search/get_product_info response:",
    data
  );

  return { res, data, params };
}

export async function pantaloonsSessionCheck(BaseURL: string, phone: string) {
  const qs = new URLSearchParams({ phone }).toString();
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("PANTALOONS API GET /shoping/session/check phone:", phone);

  const res = await fetch(`${BaseURL}/shoping/session/check?${qs}`, {
    method: "GET",
  });

  const data = await res.json().catch(() => ({}));
  console.log("PANTALOONS API /shoping/session/check response:", data);

  return { res, data, phone };
}

export async function pantaloonsLogin(BaseURL: string, phone: string) {
  const body = { phone };
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("PANTALOONS API POST /shoping/login body:", body);

  const res = await fetch(`${BaseURL}/shoping/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  console.log("PANTALOONS API /shoping/login response:", data);

  return { res, data, body };
}

export async function pantaloonsVerifyOtp(
  BaseURL: string,
  phone: string,
  otp: string
) {
  const body = { phone, otp };
  BaseURL = normalizeBaseURL(BaseURL);
  console.log("PANTALOONS API POST /shoping/login/OTP_verify body:", body);

  const res = await fetch(`${BaseURL}/shoping/login/OTP_verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  console.log("PANTALOONS API /shoping/login/OTP_verify response:", data);

  return { res, data, body };
}

export async function pantaloonsAutomationRun(
  BaseURL: string,
  payload: PantaloonsAutomationRunBody
) {
  const body = payload;
  BaseURL = normalizeBaseURL(BaseURL);

  console.log("PANTALOONS API POST /shoping/automation/run body:", body);

  const res = await fetch(`${BaseURL}/shoping/automation/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  console.log("PANTALOONS API /shoping/automation/run response:", data);

  return { res, data, body };
}
