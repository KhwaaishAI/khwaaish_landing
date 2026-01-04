import type {
  TataCliqAddToCartResponse,
  TataCliqSearchResponse,
  TataCliqViewResponse,
} from "../../types/tatacliq";

const normalizeBaseURL = (BaseURL: string) => BaseURL.replace(/\/+$/, "");

export async function tatacliqSearch(
  BaseURL: string,
  query: string,
  max_items = 30
) {
  const body = { query, max_items };
  const base = normalizeBaseURL(BaseURL);

  console.log("TATACLIQ API -> POST /api/tatacliq/search body:", body);

  const res = await fetch(`${base}/api/tatacliq/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as TataCliqSearchResponse;
  console.log("TATACLIQ API <- /api/tatacliq/search response:", data);

  return { res, data, body };
}

export async function tatacliqView(BaseURL: string, product_url: string) {
  const body = { product_url };
  const base = normalizeBaseURL(BaseURL);

  console.log("TATACLIQ API -> POST /api/tatacliq/view body:", body);

  const res = await fetch(`${base}/api/tatacliq/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as TataCliqViewResponse;
  console.log("TATACLIQ API <- /api/tatacliq/view response:", data);

  return { res, data, body };
}

export async function tatacliqAddToCart(
  BaseURL: string,
  product_url: string,
  size: string,
  phone: string
) {
  const body = { product_url, size, phone };
  const base = normalizeBaseURL(BaseURL);

  console.log("TATACLIQ API -> POST /api/tatacliq/add-to-cart body:", body);

  const res = await fetch(`${base}/api/tatacliq/add-to-cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as TataCliqAddToCartResponse;
  console.log("TATACLIQ API <- /api/tatacliq/add-to-cart response:", data);

  return { res, data, body };
}
