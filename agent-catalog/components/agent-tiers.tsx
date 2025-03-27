import { Progress } from "./ui/progress"

const tiers = [
  { name: "Newborn", requiredAIUS: 100 },
  { name: "Baby", requiredAIUS: 500 },
  { name: "Child", requiredAIUS: 1000 },
  { name: "Teen", requiredAIUS: 5000 },
  { name: "Adult", requiredAIUS: 10000 },
]

interface AgentTiersProps {
  currentTier: {
    name: "Newborn" | "Baby" | "Child" | "Teen" | "Adult"
    level: number
    stakedAIUS: number
  }
}

export function AgentTiers({ currentTier }: AgentTiersProps) {
  const currentTierIndex = tiers.findIndex((tier) => tier.name === currentTier.name)
  const nextTier = tiers[currentTierIndex + 1]
  const progress = nextTier
    ? ((currentTier.stakedAIUS - tiers[currentTierIndex].requiredAIUS) /
        (nextTier.requiredAIUS - tiers[currentTierIndex].requiredAIUS)) *
      100
    : 100

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-orbitron mb-6 text-gray-800">Agent Level</h2>
      <div className="space-y-6">
        <div className="flex items-center">
          <TierIcon name={currentTier.name} className="w-12 h-12 mr-4" />
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="font-roboto-mono text-gray-600 text-sm">{currentTier.name}</span>
              <span className="font-roboto-mono text-gray-500 text-sm">Level {currentTier.level}</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200 bg-blue-500" />
            <div className="flex justify-between mt-1">
              <span className="font-roboto-mono text-gray-500 text-xs">{currentTier.stakedAIUS} AIUS</span>
              {nextTier && <span className="font-roboto-mono text-gray-500 text-xs">{nextTier.requiredAIUS} AIUS</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TierIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "Newborn":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#4F46E5" strokeWidth="2" />
          <circle cx="12" cy="12" r="5" fill="#4F46E5" />
        </svg>
      )
    case "Baby":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#4F46E5" strokeWidth="2" />
          <path
            d="M8 14C9.10457 15.5 10.5 16 12 16C13.5 16 14.8954 15.5 16 14"
            stroke="#4F46E5"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
    case "Child":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#4F46E5" strokeWidth="2" />
          <circle cx="9" cy="10" r="1" fill="#4F46E5" />
          <circle cx="15" cy="10" r="1" fill="#4F46E5" />
          <path
            d="M8 14C9.10457 15.5 10.5 16 12 16C13.5 16 14.8954 15.5 16 14"
            stroke="#4F46E5"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
    case "Teen":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#4F46E5" strokeWidth="2" />
          <circle cx="9" cy="10" r="1" fill="#4F46E5" />
          <circle cx="15" cy="10" r="1" fill="#4F46E5" />
          <path
            d="M8 14C9.10457 15.5 10.5 16 12 16C13.5 16 14.8954 15.5 16 14"
            stroke="#4F46E5"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M12 7V9" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case "Adult":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#4F46E5" strokeWidth="2" />
          <circle cx="9" cy="10" r="1" fill="#4F46E5" />
          <circle cx="15" cy="10" r="1" fill="#4F46E5" />
          <path
            d="M8 14C9.10457 15.5 10.5 16 12 16C13.5 16 14.8954 15.5 16 14"
            stroke="#4F46E5"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M12 7V9" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 12L9 12" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 12L17 12" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

