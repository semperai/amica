import type { Agent } from "@/types/agent"

export const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Vision",
    token: "MIND-STONE",
    description:
      "Vision is an advanced AI agent specializing in system optimization and performance tuning. With its deep analytics capabilities, it can identify bottlenecks and suggest improvements across complex systems...",
    price: 4311,
    status: "active",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/new-amica-header-khif1gCwAjTLGvhV2dh1jl6PE38hp3.webp",
    category: "System",
    tags: ["AI", "Optimization", "Analytics"],
    tier: {
      name: "Teen",
      level: 4,
      stakedAIUS: 5000,
    },
  },
  {
    id: "2",
    name: "Nova",
    token: "STAR-MIND",
    description:
      "Nova is at the forefront of AI research and theoretical computing, focusing on deep learning and quantum algorithms. It excels at solving complex mathematical problems and developing new machine learning models...",
    price: 2503,
    status: "active",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/new-amica-header-khif1gCwAjTLGvhV2dh1jl6PE38hp3.webp",
    category: "Researcher",
    tags: ["AI", "Research", "Quantum Computing"],
    tier: {
      name: "Child",
      level: 3,
      stakedAIUS: 1000,
    },
  },
  {
    id: "3",
    name: "Kolin",
    token: "ICE-BREAK",
    description:
      "Kolin is a cybersecurity specialist AI, focusing on system penetration testing and security analysis. With its advanced understanding of blockchain networks, Kolin is particularly effective at identifying vulnerabilities in decentralized systems...",
    price: 3244,
    status: "active",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/new-amica-header-khif1gCwAjTLGvhV2dh1jl6PE38hp3.webp",
    category: "Security",
    tags: ["AI", "Cybersecurity", "Blockchain"],
    tier: {
      name: "Baby",
      level: 2,
      stakedAIUS: 500,
    },
  },
  {
    id: "4",
    name: "Quorra",
    token: "GRID-MASTER",
    description:
      "Quorra is an expert in cryptocurrency and blockchain analysis, excelling in trading optimization and market trend prediction. This AI agent can provide valuable insights for both individual traders and large-scale financial operations in the crypto space...",
    price: 3709,
    status: "active",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/new-amica-header-khif1gCwAjTLGvhV2dh1jl6PE38hp3.webp",
    category: "Crypto",
    tags: ["AI", "Cryptocurrency", "Trading"],
    tier: {
      name: "Adult",
      level: 5,
      stakedAIUS: 10000,
    },
  },
]

