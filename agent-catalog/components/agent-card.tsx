"use client"

import type { Agent } from "@/types/agent"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Info } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

interface AgentCardProps {
  agent: Agent
  index: number
}

export function AgentCard({ agent, index }: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const [needsExpand, setNeedsExpand] = useState(false)

  useEffect(() => {
    if (descriptionRef.current) {
      const isOverflowing = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight
      setNeedsExpand(isOverflowing)
    }
  }, [descriptionRef])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="overflow-hidden group bg-scifi-dark border-neon-blue/20 hover:border-neon-blue/40 transition-colors h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="relative h-[320px] w-full overflow-hidden">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} className="h-full w-full">
              <Image
                src={agent.avatar || "/placeholder.svg"}
                alt={agent.name}
                className="object-cover object-center"
                fill
                priority
              />
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-orbitron font-semibold text-lg text-white">{agent.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neon-pink font-orbitron">{agent.price} AIUS</span>
                <Badge
                  variant="secondary"
                  className="bg-neon-blue border-0 text-white font-roboto-mono hover:bg-neon-blue"
                >
                  {agent.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-blue-100/70 font-roboto-mono">Token: {agent.token}</p>
              <p className="text-sm text-blue-100/70 font-roboto-mono">
                Tier: {agent.tier.name} (Level {agent.tier.level})
              </p>
            </div>
            <div className="relative">
              <p
                ref={descriptionRef}
                className={`text-sm text-blue-100/70 font-roboto-mono ${!isExpanded ? "line-clamp-3" : ""}`}
              >
                {agent.description}
              </p>
              {needsExpand && !isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="absolute bottom-0 right-0 text-xs text-neon-blue hover:text-neon-pink transition-colors bg-scifi-dark pl-2"
                >
                  Read more
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full font-roboto-mono border-neon-blue/50 text-neon-blue hover:bg-neon-blue/20 hover:text-white transition-colors"
              onClick={() => window.open(`http://localhost:3000/agent/${agent.id}`, "_blank", "noopener,noreferrer")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Link href={`/agent/${agent.id}`} passHref className="w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full font-roboto-mono border-neon-pink/50 text-neon-pink hover:bg-neon-pink/20 hover:text-white transition-colors"
              >
                <Info className="h-4 w-4 mr-2" />
                Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

