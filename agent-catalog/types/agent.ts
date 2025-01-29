export interface Agent {
  id: string
  name: string
  token: string
  description: string
  price: number
  status: "active" | "inactive"
  avatar: string
  category: string
  tags: string[]
  tier: {
    name: "Newborn" | "Baby" | "Child" | "Teen" | "Adult"
    level: number
    stakedAIUS: number
  }
}

