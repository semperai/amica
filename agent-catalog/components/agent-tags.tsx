import { Badge } from "./ui/badge"

interface AgentTagsProps {
  tags: string[]
}

export function AgentTags({ tags }: AgentTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="bg-gray-200 text-gray-800 font-roboto-mono px-3 py-1 text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  )
}

