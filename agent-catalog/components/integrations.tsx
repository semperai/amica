import { Check, X } from "lucide-react"

const integrations = [
  { name: "Amica Brain", active: true },
  { name: "Virtuals", active: false },
  { name: "EACC Marketplace", active: true },
  { name: "UOS", active: false },
]

export function Integrations() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-orbitron mb-6 text-gray-800">Integrations</h2>
      <div className="grid grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className={`p-4 rounded-lg border ${
              integration.active ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-roboto-mono text-sm">{integration.name}</span>
              {integration.active ? (
                <Check className="text-green-500" size={20} />
              ) : (
                <X className="text-gray-400" size={20} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

