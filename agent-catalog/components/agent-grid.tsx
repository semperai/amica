"use client"

import type { Agent } from "@/types/agent"
import { AgentCard } from "./agent-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Code, Microscope, Users, Shield, TrendingUp, Bitcoin, Briefcase } from "lucide-react"
import { motion } from "framer-motion"

interface AgentGridProps {
  agents: Agent[]
}

const categories = [
  { name: "All Agents", icon: Brain },
  { name: "Programmer", icon: Code },
  { name: "Researcher", icon: Microscope },
  { name: "Friend", icon: Users },
  { name: "Security", icon: Shield },
  { name: "Degen Trader", icon: TrendingUp },
  { name: "Crypto", icon: Bitcoin },
  { name: "Personal Assistant", icon: Briefcase },
]

export function AgentGrid({ agents }: AgentGridProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 max-w-md">
            <Input placeholder="Search agents..." className="w-full border-2 focus:border-blue-500" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select defaultValue="market-cap">
              <SelectTrigger className="w-full sm:w-[180px] border-2 bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-200">
                <SelectItem value="market-cap">Sort by Market Cap</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px] border-2 bg-white">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-200">
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-1000">0 - 1,000 AIUS</SelectItem>
                <SelectItem value="1000-5000">1,000 - 5,000 AIUS</SelectItem>
                <SelectItem value="5000+">5,000+ AIUS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="h-auto py-4 w-full flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-500 transition-colors"
                >
                  <Icon className="h-6 w-6 text-blue-500" />
                  <span className="text-sm">{category.name}</span>
                </Button>
              </motion.div>
            )
          })}
        </div>

        {/* Featured Agents Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-blue-900">Featured Agents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

