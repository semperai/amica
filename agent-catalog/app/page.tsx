"use client"

import { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import { AgentGrid } from "@/components/agent-grid";
import { Header } from "@/components/header";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Agent } from "@/types/agent";

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { useAccount, useConfig, WagmiProvider } from 'wagmi';
import { mainnet, arbitrum, sepolia } from 'wagmi/chains';
import { getPublicClient } from 'wagmi/actions';

import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'arbius.heyamica.com',
  projectId: "3cecb561af7700e7ff5184b55b39e05a",
  chains: [arbitrum],
  ssr: true,
});

const queryClient = new QueryClient();

// Contract address and ABI for fetching metadata
const CONTRACT_ADDRESS = "0xb11C162D5Ea52c899076B537d0Da9cFCe1489026";
const CONTRACT_ABI = [
  "function getTokenIdCounter() external view returns (uint256)",
  "function getMetadata(uint256 tokenId, string[] memory keys) external view returns (string[] memory)"
];

// Infura RPC endpoint
const INFURA_RPC = "https://arbitrum-mainnet.infura.io/v3/7514aa130b2d4452b1a35b5db6342036";

export default function Home() {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(scrollY, [0, 300], ["rgb(26, 26, 46)", "rgb(255, 255, 255)"]);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <HomeContent backgroundColor={backgroundColor} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function HomeContent({ backgroundColor }: { backgroundColor: any }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { isConnected } = useAccount();
  const wagmiConfig = useConfig();

  useEffect(() => {
    async function fetchData() {
      try {
        // Get the public client from wagmi config
        const publicClient = getPublicClient(wagmiConfig);
        
        if (!publicClient) {
          console.error("No public client available");
          return;
        }

        // Create ethers provider with public client
        // const provider = new ethers.BrowserProvider(publicClient);
        const provider = new ethers.JsonRpcProvider(INFURA_RPC);

        
        // Create contract instance for read-only operations
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        // Get actual token count from contract
        const totalNFTs = await contract.getTokenIdCounter();
        const fetchedAgents: Agent[] = [];

        // Start from token ID 0 or your preferred starting point
        for (let tokenId = 0; tokenId < totalNFTs; tokenId++) {
          try {
            const metadataKeys = ["name", "description", "image"];
            const metadata = await contract.getMetadata(tokenId, metadataKeys);

            if (!metadata || metadata.length === 0 || metadata[0] === '0x') {
              console.error(`No tokenURI found for token ${tokenId}`);
              continue; // Skip this token if no metadata found
            }

            fetchedAgents.push({
              id: `${tokenId}`,
              name: metadata[0] || "Unknown",
              token: "N/A",
              description: metadata[1] || "No description available",
              price: 0,
              status: "active" as "active" | "inactive",
              avatar: metadata[2] || "/default-avatar.png",
              category: "System",
              tags: ["AI", "Optimization", "Analytics"],
              tier: {
                name: "Teen",
                level: 4,
                stakedAIUS: 5000,
              },
            });

            // console.log(`Fetched token ${tokenId}:`, fetchedAgents[fetchedAgents.length - 1]);
          } catch (error) {
            console.error(`Error fetching metadata for token ${tokenId}:`, error);
          }
        }

        setAgents(fetchedAgents);
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    }

    fetchData();

  }, []);

  return (
    <motion.main className="min-h-screen" style={{ backgroundColor }}>
      <Header />
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b">
        <AgentGrid agents={agents} />
      </div>
    </motion.main>
  );
}