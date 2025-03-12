"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function Header() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  const textY = useTransform(scrollY, [0, 300], [0, 100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.9])

  return (
    
    <div ref={ref} className="relative h-[40vh] flex items-center justify-center bg-scifi-dark overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-tech-pattern opacity-50" />
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/20 to-neon-blue/20 mix-blend-overlay" />
      {/* <ConnectButton /> */}

      </div>
      <motion.div className="relative z-10 text-center" style={{ y: textY, opacity, scale }}>
        <div className="relative">
          <motion.h1
            className="text-5xl md:text-7xl font-orbitron font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Amica Agent Catalog
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-neon-blue text-sm font-noto opacity-75">
              アミカエージェント
            </span>
          </motion.h1>
        </div>
        <motion.p
          className="text-xl text-blue-100 max-w-2xl mx-auto px-4 font-roboto-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Discover and deploy advanced AI agents for your specific needs
        </motion.p>
      </motion.div>
    </div>
  )
}

