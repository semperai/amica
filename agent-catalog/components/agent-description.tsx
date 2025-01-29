interface AgentDescriptionProps {
  description: string
}

export function AgentDescription({ description }: AgentDescriptionProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-orbitron mb-4 text-gray-800">About</h2>
      <p className="font-roboto-mono text-gray-600 leading-relaxed text-sm">{description}</p>
    </div>
  )
}

