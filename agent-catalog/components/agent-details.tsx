"use client"

import type { Agent } from "@/types/agent"
import VRMDemo from "./vrm-demo"
import { PriceChart } from "./price-chart"
import { TokenData } from "./token-data"
import { AgentDescription } from "./agent-description"
import { SocialMediaButtons } from "./social-media-buttons"
import { AgentTags } from "./agent-tags"
import { AgentTiers } from "./agent-tiers"
import { Button } from "./ui/button"
import { MessageSquare, ArrowRightLeft } from "lucide-react"
import { Integrations } from "./integrations"
import { useEffect, useState } from "react"
import { useTokens } from "@/hooks/use-token"

interface AgentDetailsProps {
  agent: Agent
}

const AMICA_URL = process.env.NEXT_PUBLIC_AMICA_UR as string;

export function AgentDetails({ agent }: AgentDetailsProps) {
  const [vrmLoaded, setVrmLoaded] = useState(false);
  const { stats, priceHistory, tokenAddress, loading, error } = useTokens(Number(agent.id));

  console.log("tokenAddress", tokenAddress);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-orbitron font-bold text-gray-900 mb-2 text-center">{agent.name}</h1>
        <p className="text-center text-gray-500 mb-2 font-roboto-mono">
          {agent.token} | {agent.tier.name} (Level {agent.tier.level})
        </p>
        <TokenData stats={stats}/>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          <div className="space-y-12">
              <VRMDemo
                vrmUrl={agent.vrmUrl}
                bgUrl={agent.bgUrl}
                onLoaded={() => setVrmLoaded(true)}
              />
            <PriceChart priceHistory={priceHistory} />
          </div>
          <div className="space-y-8">
            <div className="flex justify-center space-x-4 mb-8">
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white font-roboto-mono"
                onClick={() => window.open(`${AMICA_URL}/agent/${agent.id}`, "_blank", "noopener,noreferrer")}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Chat
              </Button>
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white font-roboto-mono"
                onClick={() => window.open(`https://app.uniswap.org/#/swap?inputCurrency=${tokenAddress}`, "_blank", "noopener,noreferrer")}
              >
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Buy/Sell on Uniswap
              </Button>
            </div>
            <AgentDescription description={agent.description} />
            <SocialMediaButtons />
            <AgentTags tags={agent.tags} />
            <AgentTiers currentTier={agent.tier} />
            <Integrations />
          </div>
        </div>
      </div>
    </div>
  )
}

