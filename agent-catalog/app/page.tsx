"use client"

import { AgentGrid } from "@/components/agent-grid"
import { Header } from "@/components/header"
import { mockAgents } from "@/lib/mock-agents"
import { motion, useScroll, useTransform } from "framer-motion"

export default function Home() {
  const { scrollY } = useScroll()
  const backgroundColor = useTransform(scrollY, [0, 300], ["rgb(26, 26, 46)", "rgb(255, 255, 255)"])

  return (
    <motion.main className="min-h-screen" style={{ backgroundColor }}>
      <Header />
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b">
        <AgentGrid agents={mockAgents} />
      </div>
    </motion.main>
  )
}

