export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

export type Currency = "eur" | "usd";

const BASE_URL = "https://api.coingecko.com/api/v3/coins/markets";

export async function fetchTopCoins(currency: Currency): Promise<Coin[]> {
  const url =
    `${BASE_URL}?vs_currency=${currency}` +
    "&order=market_cap_desc&per_page=50&page=1&sparkline=false";

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch data from CoinGecko");
  }

  return res.json();
}
