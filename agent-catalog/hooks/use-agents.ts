"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import type { Agent } from "@/types/agent";
import { ERC721_ABI } from "@/utils/abi/erc721";

// const CONTRACT_ADDRESS = "0x7e42c9d9946bA673415575C3a54dF5b37D68c925";
// const INFURA_RPC = "https://arbitrum-sepolia.infura.io/v3/2100216e5c5b451091e14246d10deaff";

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

        const INFURA_RPC = process.env.NEXT_PUBLIC_INFURA_RPC;
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        if (!CONTRACT_ADDRESS || !INFURA_RPC) {
          throw new Error("NEXT_PUBLIC is not defined");
        }

        const provider = new ethers.JsonRpcProvider(INFURA_RPC);

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC721_ABI, provider);

        const totalNFTs = await contract.getTokenIdCounter();
        const fetchedAgents: Agent[] = [];

        for (let tokenId = 0; tokenId < totalNFTs; tokenId++) {
          try {
            const metadataKeys = ["name" ,"description", "image", "vrm_url", "bg_url"];
            const metadata = await contract.getMetadata(tokenId, metadataKeys);

            if (!metadata || metadata.length === 0 || metadata[0] === "0x") {
              continue;
            }

            fetchedAgents.push({
              id: `${tokenId}`,
              name: metadata[0] || "Unknown",
              token: "AINFT",
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
