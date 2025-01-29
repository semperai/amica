export function TokenData() {
  const data = [
    { label: "Market Cap", value: "$1.2B" },
    { label: "24h Change", value: "+5.67%" },
    { label: "TVL", value: "$500M" },
    { label: "Holders", value: "10,000" },
    { label: "24h Volume", value: "$50M" },
  ]

  return (
    <div className="flex justify-between bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {data.map((item) => (
        <div key={item.label} className="text-center">
          <p className="text-sm font-roboto-mono text-gray-500 mb-1">{item.label}</p>
          <p className="text-lg font-orbitron text-gray-800">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

