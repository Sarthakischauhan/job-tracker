import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { JobStatus } from "@/types/jobTypes"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function getSkillColor(skill: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500", 
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-orange-500",
  ]
  
  const hash = skill.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  return colors[Math.abs(hash) % colors.length]
}

// Map emojis to job statuses
const statusEmojiMap: Record<JobStatus, string> = {
  "applied": "🙏🏻",
  "interview": "🚀", 
  "oa": "🥸",
  "rejected": "😭"
}

export function getStatusEmoji(status: JobStatus): string {
  return statusEmojiMap[status]
}