import {
  Blocks,
  BrainCircuit,
  Database,
  Workflow,
  ScanEye,
  MessageSquareText,
  Layers,
  ShieldCheck,
  BookMarked,
  BarChart3,
} from "lucide-react"

export interface Module {
  id: string
  name: string
  description: string
  href: string
  icon: typeof Blocks
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
    icon: Blocks,
    domain: "Plan & Manage",
    domainNumber: 1,
    weight: "20-25%",
    color: "text-indigo-500 dark:text-indigo-400",
  },
  {
    id: "generative",
    name: "GenAI Lab",
    description: "Chat with AI models, prompt engineering, image generation",
    href: "/generative",
    icon: BrainCircuit,
    domain: "Generative AI",
    domainNumber: 2,
    weight: "15-20%",
    color: "text-sky-500 dark:text-sky-400",
  },
  {
    id: "rag",
    name: "RAG Engine",
    description: "Upload documents, search, ask questions grounded in data",
    href: "/rag",
    icon: Database,
    domain: "GenAI + Knowledge",
    domainNumber: 2,
    weight: "15-20%",
    color: "text-slate-500 dark:text-slate-400",
  },
  {
    id: "agents",
    name: "Agent Workshop",
    description: "Build and test AI agents",
    href: "/agents",
    icon: Workflow,
    domain: "Agentic Solutions",
    domainNumber: 3,
    weight: "5-10%",
    color: "text-violet-500 dark:text-violet-400",
  },
  {
    id: "vision",
    name: "Vision Lab",
    description: "Analyze images, OCR, object detection, custom classifiers",
    href: "/vision",
    icon: ScanEye,
    domain: "Computer Vision",
    domainNumber: 4,
    weight: "10-15%",
    color: "text-blue-500 dark:text-blue-400",
  },
  {
    id: "language",
    name: "Language & Speech",
    description: "Text analysis, translation, speech-to-text, text-to-speech",
    href: "/language",
    icon: MessageSquareText,
    domain: "NLP Solutions",
    domainNumber: 5,
    weight: "15-20%",
    color: "text-zinc-500 dark:text-zinc-400",
  },
  {
    id: "search",
    name: "Knowledge Mining",
    description: "Search indexes, document extraction, skillsets",
    href: "/search",
    icon: Layers,
    domain: "Knowledge Mining",
    domainNumber: 6,
    weight: "15-20%",
    color: "text-indigo-400 dark:text-indigo-300",
  },
  {
    id: "responsible-ai",
    name: "Responsible AI",
    description: "Content moderation, safety filters, prompt shields",
    href: "/responsible-ai",
    icon: ShieldCheck,
    domain: "Cross-cutting",
    domainNumber: 1,
    weight: "cross-cutting",
    color: "text-slate-600 dark:text-slate-300",
  },
]

export const studyPages = [
  {
    id: "resources",
    name: "Resources",
    description: "Curated study links and personal notes",
    href: "/resources",
    icon: BookMarked,
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
