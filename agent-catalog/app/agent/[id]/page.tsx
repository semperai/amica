"use client";

import { useAgents } from "@/hooks/use-agents"; 
import { AgentDetails } from "@/components/agent-details";

export default function AgentPageContent({ params }: { params: { id: string } }) {
  const { agents, loading, error } = useAgents();

  if (error) return <p>Error loading agents.</p>;

  const agent = agents.find((agent) => agent.id === params.id);

  if (!agent) return <p>Agent not found</p>;

  return <AgentDetails agent={agent} />;
}
