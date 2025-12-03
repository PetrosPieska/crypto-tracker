import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchTopCoins } from "./services/coinGeckoApi";
import type { Coin, Currency } from "./services/coinGeckoApi";
import CryptoTable, {
  type SortKey,
} from "./components/CryptoTable";

export default function App() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState<Currency>("eur");
  const [sortKey, setSortKey] =
    useState<SortKey>("market_cap");
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc"
  >("desc");
  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCoins = useCallback(
    async (selectedCurrency: Currency) => {
      try {
        if (!isRefreshing) {
          setLoading(true);
        }
        const data = await fetchTopCoins(selectedCurrency);
        setCoins(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching coins:", err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [isRefreshing]
  );

  useEffect(() => {
    void loadCoins(currency);
  }, [currency, loadCoins]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void loadCoins(currency);
  };

  const filteredCoins = useMemo(
    () =>
      coins.filter((coin) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          coin.name.toLowerCase().includes(q) ||
          coin.symbol.toLowerCase().includes(q)
        );
      }),
    [coins, search]
  );

  const sortedCoins = useMemo(() => {
    const dir = sortDirection === "asc" ? 1 : -1;
    const copy = [...filteredCoins];

    copy.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return (
            a.name.localeCompare(b.name) * dir
          );
        case "current_price":
          return (
            (a.current_price - b.current_price) * dir
          );
        case "market_cap":
          return (a.market_cap - b.market_cap) * dir;
        case "price_change_percentage_24h":
          return (
            (a.price_change_percentage_24h -
              b.price_change_percentage_24h) *
            dir
          );
        default:
          return 0;
      }
    });

    return copy;
  }, [filteredCoins, sortKey, sortDirection]);

  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortKey(key);
      setSortDirection(
        key === "name" ? "asc" : "desc"
      );
    }
  };

  const topGainer = useMemo(() => {
    if (!coins.length) return null;
    return [...coins].sort(
      (a, b) =>
        b.price_change_percentage_24h -
        a.price_change_percentage_24h
    )[0];
  }, [coins]);

  const topLoser = useMemo(() => {
    if (!coins.length) return null;
    return [...coins].sort(
      (a, b) =>
        a.price_change_percentage_24h -
        b.price_change_percentage_24h
    )[0];
  }, [coins]);

  const currencyLabel =
    currency === "eur" ? "EUR" : "USD";

  return (
    <div className="page-shell">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="page-max-width flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-semibold">
              CT
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Crypto Price Tracker
              </h1>
              <p className="page-subtle-text">
                Live market data for top cryptocurrencies in{" "}
                {currencyLabel}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCurrency("eur")}
                className={`px-2.5 py-1 rounded-full ${
                  currency === "eur"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                EUR
              </button>
              <button
                type="button"
                onClick={() => setCurrency("usd")}
                className={`px-2.5 py-1 rounded-full ${
                  currency === "usd"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                USD
              </button>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
            >
              <span className="text-sm">⟳</span>
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="page-max-width py-8 space-y-6">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Market overview
          </h2>
          <p className="page-subtle-text">
            Top 50 coins by market cap. Search, sort and
            switch between EUR and USD.
          </p>
        </section>

        {/* Top gainers / losers */}
        {!loading && topGainer && topLoser && (
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="page-card p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-600">
                  Top gainer (24h)
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {topGainer.name}{" "}
                  <span className="text-xs text-slate-500">
                    ({topGainer.symbol.toUpperCase()})
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {currencyLabel} price and change in the
                  last 24 hours.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {currency === "eur" ? "€" : "$"}{" "}
                  {topGainer.current_price.toLocaleString(
                    currency === "eur" ? "fi-FI" : "en-US",
                    { maximumFractionDigits: 2 }
                  )}
                </p>
                <p className="mt-1 inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                  +{topGainer.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="page-card p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-rose-600">
                  Top loser (24h)
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {topLoser.name}{" "}
                  <span className="text-xs text-slate-500">
                    ({topLoser.symbol.toUpperCase()})
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {currencyLabel} price and change in the
                  last 24 hours.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {currency === "eur" ? "€" : "$"}{" "}
                  {topLoser.current_price.toLocaleString(
                    currency === "eur" ? "fi-FI" : "en-US",
                    { maximumFractionDigits: 2 }
                  )}
                </p>
                <p className="mt-1 inline-flex items-center rounded-md bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">
                  {topLoser.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Table */}
        <section className="page-card">
          <div className="border-b border-slate-200 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">
                Live prices
              </span>
              {!loading && (
                <span className="page-subtle-text">
                  Showing {sortedCoins.length} of{" "}
                  {coins.length} assets
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {loading && (
                <span className="page-subtle-text">
                  Fetching data...
                </span>
              )}

              <input
                type="text"
                placeholder="Search by name or symbol…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="p-4">
            {loading && (
              <p className="page-subtle-text">
                Loading prices from CoinGecko…
              </p>
            )}

            {!loading && sortedCoins.length > 0 && (
              <CryptoTable
                coins={sortedCoins}
                currency={currency}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
              />
            )}

            {!loading && sortedCoins.length === 0 && (
              <p className="page-subtle-text">
                No assets match your search. Try a
                different query.
              </p>
            )}
          </div>

          {lastUpdated && (
            <div className="border-t border-slate-100 px-4 py-2">
              <p className="page-subtle-text text-xs">
                Last updated:{" "}
                {lastUpdated.toLocaleTimeString("fi-FI", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-8">
        <div className="page-max-width py-4 flex items-center justify-between">
          <p className="page-subtle-text">
            Built by Petros Pieskä – portfolio demo
            project.
          </p>
          <p className="page-subtle-text">
            Data source: CoinGecko ({currencyLabel})
          </p>
        </div>
      </footer>
    </div>
  );
}
