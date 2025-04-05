export function TokenData({ stats }: { stats: Record<string, any> | null }) {
  if (!stats) return <p>Loading...</p>;

  const data = [
    { label: "Market Cap", value: `${stats.marketCap.toFixed(2)} AIUS` },
    { label: "24h Change", value: `${stats.change24h >= 0 ? "+" : ""}${stats.change24h.toFixed(2)}%` },
    { label: "TVL", value: `${stats.tvl.toFixed(2)} AIUS` },
    { label: "Holders", value: stats.holders.toLocaleString() },
    { label: "24h Volume", value: `${stats.volume.toFixed(2)} AIUS` },
  ];

  return (
    <div className="flex justify-between bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {data.map((item) => (
        <div key={item.label} className="text-center">
          <p className="text-sm font-roboto-mono text-gray-500 mb-1">{item.label}</p>
          <p className={`text-lg font-orbitron ${item.label === "24h Change" && stats.change24h < 0 ? "text-red-500" : "text-gray-800"}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
