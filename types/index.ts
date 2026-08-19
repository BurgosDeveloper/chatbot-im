export interface Category {
  id: number;
  name: string;
  created_at: string;
  product_count?: number;
}

export type CurrencyCode = "USD" | "COP" | "VES";

export interface Product {
  id: number;
  name: string;
  image_url: string;
  image_public_id: string;
  category_id: number | null;
  category_name?: string;
  code: string;
  stock: number;
  price: number;
  currency: CurrencyCode;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AppSettings {
  whatsapp_number: string;
  rate_usd_cop: number;
  rate_usd_ves: number;
}

export interface ConvertedPrices {
  usd: number;
  cop: number;
  ves: number;
  usdFormatted: string;
  copFormatted: string;
  vesFormatted: string;
}

/**
 * Converts a product's price from its base currency to USD, COP, and VES
 */
export function calculatePrices(
  price: number,
  baseCurrency: CurrencyCode = "USD",
  rateUsdCop = 4000,
  rateUsdVes = 40
): ConvertedPrices {
  const safePrice = Number(price) || 0;
  const safeRateCop = Number(rateUsdCop) > 0 ? Number(rateUsdCop) : 4000;
  const safeRateVes = Number(rateUsdVes) > 0 ? Number(rateUsdVes) : 40;

  let usd = 0;
  let cop = 0;
  let ves = 0;

  if (baseCurrency === "USD") {
    usd = safePrice;
    cop = usd * safeRateCop;
    ves = usd * safeRateVes;
  } else if (baseCurrency === "COP") {
    cop = safePrice;
    usd = safeRateCop > 0 ? cop / safeRateCop : 0;
    ves = usd * safeRateVes;
  } else if (baseCurrency === "VES") {
    ves = safePrice;
    usd = safeRateVes > 0 ? ves / safeRateVes : 0;
    cop = usd * safeRateCop;
  }

  return {
    usd,
    cop,
    ves,
    usdFormatted: `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    copFormatted: `$${Math.round(cop).toLocaleString("es-CO")} COP`,
    vesFormatted: `Bs. ${ves.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  };
}
