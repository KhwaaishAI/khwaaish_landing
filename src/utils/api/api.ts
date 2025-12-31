// src/pages/Unified/api.ts

console.log("api hook called");
const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;

const buildApiUrl = (path: string) => {
  const base = (BaseURL || "").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export async function searchFlipkart(query: string) {
  const res = await fetch(buildApiUrl("/api/flipkart/search"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  const products = data.data?.products || data.products || data.results || [];
  console.log("data:", data);
  return { sessionId: data.session_id as string | undefined, products };
}

export async function searchAmazon(query: string) {
  const res = await fetch(buildApiUrl("/amazon/search-amazon"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Amazon search failed (${res.status}). ${text || ""}`.trim()
    );
  }

  const data = await res.json();
  const products =
    data?.results || data?.products || data?.data?.products || [];
  return { sessionId: data.session_id as string | undefined, products };
}
