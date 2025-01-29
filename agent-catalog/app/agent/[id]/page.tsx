import { AgentDetails } from "@/components/agent-details"
import { mockAgents } from "@/lib/mock-agents"

export default function AgentPage({ params }: { params: { id: string } }) {
  const agent = mockAgents.find((a) => a.id === params.id) || mockAgents[0]
  return (
    <div className="min-h-screen bg-white">
      <AgentDetails agent={agent} />
    </div>
  )
}

