import {
  Server,
  Sparkles,
  FileSearch,
  Bot,
  Eye,
  Languages,
  Search,
  Shield,
  BookOpen,
  BarChart3,
} from "lucide-react"

export interface Module {
  id: string
  name: string
  description: string
  href: string
  icon: typeof Server
  domain: string
  domainNumber: number
  weight: string
  color: string
}

export const labModules: Module[] = [
  {
    id: "foundry",
    name: "Foundry Hub",
    description: "Azure resource management and planning",
    href: "/foundry",
    icon: Server,
    domain: "Plan & Manage",
    domainNumber: 1,
    weight: "20-25%",
    color: "text-chart-1",
  },
  {
    id: "generative",
    name: "GenAI Lab",
    description: "Chat with AI models, prompt engineering, image generation",
    href: "/generative",
    icon: Sparkles,
    domain: "Generative AI",
    domainNumber: 2,
    weight: "15-20%",
    color: "text-chart-2",
  },
  {
    id: "rag",
    name: "RAG Engine",
    description: "Upload documents, search, ask questions grounded in data",
    href: "/rag",
    icon: FileSearch,
    domain: "GenAI + Knowledge",
    domainNumber: 2,
    weight: "15-20%",
    color: "text-chart-3",
  },
  {
    id: "agents",
    name: "Agent Workshop",
    description: "Build and test AI agents",
    href: "/agents",
    icon: Bot,
    domain: "Agentic Solutions",
    domainNumber: 3,
    weight: "5-10%",
    color: "text-chart-4",
  },
  {
    id: "vision",
    name: "Vision Lab",
    description: "Analyze images, OCR, object detection, custom classifiers",
    href: "/vision",
    icon: Eye,
    domain: "Computer Vision",
    domainNumber: 4,
    weight: "10-15%",
    color: "text-chart-5",
  },
  {
    id: "language",
    name: "Language & Speech",
    description: "Text analysis, translation, speech-to-text, text-to-speech",
    href: "/language",
    icon: Languages,
    domain: "NLP Solutions",
    domainNumber: 5,
    weight: "15-20%",
    color: "text-chart-1",
  },
  {
    id: "search",
    name: "Knowledge Mining",
    description: "Search indexes, document extraction, skillsets",
    href: "/search",
    icon: Search,
    domain: "Knowledge Mining",
    domainNumber: 6,
    weight: "15-20%",
    color: "text-chart-2",
  },
  {
    id: "responsible-ai",
    name: "Responsible AI",
    description: "Content moderation, safety filters, prompt shields",
    href: "/responsible-ai",
    icon: Shield,
    domain: "Cross-cutting",
    domainNumber: 1,
    weight: "cross-cutting",
    color: "text-chart-3",
  },
]

export const studyPages = [
  {
    id: "resources",
    name: "Resources",
    description: "Curated study links and personal notes",
    href: "/resources",
    icon: BookOpen,
  },
  {
    id: "progress",
    name: "Progress",
    description: "Exam readiness tracker",
    href: "/progress",
    icon: BarChart3,
  },
]

export const examDomains = [
  { number: 1, name: "Plan and Manage an Azure AI Solution", weight: "20-25%", weightMid: 22.5 },
  { number: 2, name: "Implement Generative AI Solutions", weight: "15-20%", weightMid: 17.5 },
  { number: 3, name: "Implement an Agentic Solution", weight: "5-10%", weightMid: 7.5 },
  { number: 4, name: "Implement Computer Vision Solutions", weight: "10-15%", weightMid: 12.5 },
  { number: 5, name: "Implement NLP Solutions", weight: "15-20%", weightMid: 17.5 },
  { number: 6, name: "Knowledge Mining and Information Extraction", weight: "15-20%", weightMid: 17.5 },
]
