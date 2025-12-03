import type { Coin, Currency } from "../services/coinGeckoApi";

export type SortKey =
  | "name"
  | "current_price"
  | "market_cap"
  | "price_change_percentage_24h";

interface Props {
  coins: Coin[];
  currency: Currency;
  sortKey: SortKey;
  sortDirection: "asc" | "desc";
  onSortChange: (key: SortKey) => void;
}

export default function CryptoTable({
  coins,
  currency,
  sortKey,
  sortDirection,
  onSortChange,
}: Props) {
  const currencySymbol = currency === "eur" ? "€" : "$";
  const locale = currency === "eur" ? "fi-FI" : "en-US";

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <span className="ml-1 text-slate-300">↕</span>;
    }
    return (
      <span className="ml-1 text-slate-500">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const headerButtonClass =
    "inline-flex items-center text-xs font-semibold tracking-wide uppercase text-slate-500";

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[650px] divide-y divide-slate-200 text-left">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3">
              <button
                type="button"
                onClick={() => onSortChange("name")}
                className={headerButtonClass}
              >
                Asset
                {renderSortIcon("name")}
              </button>
            </th>
            <th className="px-4 py-3">
              <button
                type="button"
                onClick={() => onSortChange("current_price")}
                className={headerButtonClass}
              >
                Price
                {renderSortIcon("current_price")}
              </button>
            </th>
            <th className="px-4 py-3">
              <button
                type="button"
                onClick={() => onSortChange("market_cap")}
                className={headerButtonClass}
              >
                Market cap
                {renderSortIcon("market_cap")}
              </button>
            </th>
            <th className="px-4 py-3">
              <button
                type="button"
                onClick={() =>
                  onSortChange("price_change_percentage_24h")
                }
                className={headerButtonClass}
              >
                24h %
                {renderSortIcon("price_change_percentage_24h")}
              </button>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {coins.map((coin) => (
            <tr
              key={coin.id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3 flex items-center gap-2">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">
                    {coin.name}
                  </span>
                  <span className="text-xs uppercase text-slate-500">
                    {coin.symbol}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3 text-sm text-slate-900">
                {currencySymbol}{" "}
                {coin.current_price.toLocaleString(locale, {
                  maximumFractionDigits: 2,
                })}
              </td>

              <td className="px-4 py-3 text-sm text-slate-900">
                {currencySymbol}{" "}
                {coin.market_cap.toLocaleString(locale, {
                  maximumFractionDigits: 0,
                })}
              </td>

              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    coin.price_change_percentage_24h > 0
                      ? "text-emerald-700 bg-emerald-100"
                      : coin.price_change_percentage_24h < 0
                      ? "text-rose-700 bg-rose-100"
                      : "text-orange-700 bg-orange-100"
                  }`}
                >
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
