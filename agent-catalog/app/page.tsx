"use client"

import { AgentGrid } from "@/components/agent-grid";
import { Header } from "@/components/header";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Agent } from "@/types/agent";

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia, arbitrumSepolia } from 'wagmi/chains';
import { useAgents } from "@/hooks/use-agents"; 
import { queryClient } from "@/lib/query-client";

import {
  QueryClientProvider,
} from "@tanstack/react-query";
import VRMDemo from "@/components/vrm-demo";

const config = getDefaultConfig({
  appName: 'arbius.heyamica.com',
  projectId: "3cecb561af7700e7ff5184b55b39e05a",
  chains: [arbitrumSepolia],
  ssr: true,
});

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
  const { agents, loading, error } = useAgents();

  if (error) return <p>Error loading agents.</p>;

  return (
    <motion.main className="min-h-screen" style={{ backgroundColor }}>
      <Header />
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b">
        <AgentGrid agents={agents} />
      </div>
    </motion.main>
  );
}