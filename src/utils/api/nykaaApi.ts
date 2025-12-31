import type { NykaaAddress, PendingNykaaCart } from "../../types/nykaa";

export async function nykaaSearch(BaseURL: string, query: string) {
  const res = await fetch(`${BaseURL}/api/nykaa/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, maxitems: 5 }),
  });

  const data = await res.json();
  return { res, data };
}

export async function nykaaAddToCart(
  BaseURL: string,
  cart: PendingNykaaCart,
  address: NykaaAddress
) {
  const body = {
    product_name: cart.product_name,
    size: cart.size,
    pincode: address.pincode.replace(/\D/g, "").slice(0, 6),
    house: address.house,
    area: address.area,
    name: address.name,
    phone: address.phone.replace(/\D/g, "").slice(0, 10),
    email: address.email,
  };

  const res = await fetch(`${BaseURL}/api/nykaa/add-to-cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return { res, data, body };
}

export async function nykaaPayment(
  BaseURL: string,
  sessionId: string,
  upiId: string
) {
  const cleanedUpi = upiId.trim();

  const body = {
    session_id: sessionId,
    sessionid: sessionId, // keep both to be safe
    upi_id: cleanedUpi,
    upiid: cleanedUpi, // keep both to be safe
  };

  const res = await fetch(`${BaseURL}/api/nykaa/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return { res, data, body };
}
