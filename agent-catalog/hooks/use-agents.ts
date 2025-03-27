"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import type { Agent } from "@/types/agent";

const CONTRACT_ADDRESS = "0xb11C162D5Ea52c899076B537d0Da9cFCe1489026";
const CONTRACT_ABI = [
  "function getTokenIdCounter() external view returns (uint256)",
  "function getMetadata(uint256 tokenId, string[] memory keys) external view returns (string[] memory)",
];
const INFURA_RPC = "https://arbitrum-mainnet.infura.io/v3/7514aa130b2d4452b1a35b5db6342036";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load cached agents from localStorage
        const cachedAgents = JSON.parse(localStorage.getItem("agents") || "[]") as Agent[];
        setAgents(cachedAgents);

        const provider = new ethers.JsonRpcProvider(INFURA_RPC);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const totalNFTs = await contract.getTokenIdCounter();
        const fetchedAgents: Agent[] = [];

        for (let tokenId = 0; tokenId < totalNFTs; tokenId++) {
          try {
            const metadataKeys = ["name", "description", "image", "vrm_url", "bg_url"];
            const metadata = await contract.getMetadata(tokenId, metadataKeys);

            if (!metadata || metadata.length === 0 || metadata[0] === "0x") {
              continue;
            }

            fetchedAgents.push({
              id: `${tokenId}`,
              name: metadata[0] || "Unknown",
              token: "N/A",
              description: metadata[1] || "No description available",
              price: 0,
              status: "active",
              avatar: metadata[2] || "/default-avatar.png",
              category: "System",
              tags: ["AI", "Optimization", "Analytics"],
              tier: { name: "Teen", level: 4, stakedAIUS: 5000 },
              vrmUrl: metadata[3],
              bgUrl: metadata[4],
            });
          } catch (err) {
            console.error(`Error fetching metadata for token ${tokenId}:`, err);
          }
        }

        // Merge with existing cached data
        const updatedAgents = mergeAgents(cachedAgents, fetchedAgents);

        // Store updated data in localStorage
        localStorage.setItem("agents", JSON.stringify(updatedAgents));
        setAgents(updatedAgents);
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError("Failed to fetch agents.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return { agents, loading, error };
}

/**
 * Merges cached agents with newly fetched agents.
 * - Updates existing agents if metadata has changed.
 * - Adds new agents that were not in the cache.
 */
function mergeAgents(cached: Agent[], fetched: Agent[]): Agent[] {
  const agentMap = new Map<string, Agent>();

  // Add cached agents first
  cached.forEach(agent => agentMap.set(agent.id, agent));

  // Update or add new fetched agents
  fetched.forEach(agent => agentMap.set(agent.id, agent));

  return Array.from(agentMap.values());
}
