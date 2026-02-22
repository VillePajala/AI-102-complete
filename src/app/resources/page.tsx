"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import {
  BookOpen,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Link2,
  Target,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

const quickLinks = [
  {
    title: "AI-102 Certification Page",
    description: "Official certification overview, requirements, and scheduling",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/",
    icon: GraduationCap,
  },
  {
    title: "Official Study Guide",
    description: "Skills measured, exam objectives, and preparation resources",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-102",
    icon: BookOpen,
  },
  {
    title: "Practice Assessment",
    description: "Free practice questions in the same format as the real exam",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/practice/assessment?assessment-type=practice&assessmentId=61",
    icon: Target,
  },
  {
    title: "Exam Readiness Videos",
    description: "Video walkthroughs covering each exam domain in detail",
    url: "https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-ai-102/",
    icon: Link2,
  },
]

const domains = [
  {
    id: 1,
    title: "Plan and Manage an Azure AI Solution",
    weight: "20-25%",
    links: [
      { title: "Azure AI Services Documentation", url: "https://learn.microsoft.com/en-us/azure/ai-services/" },
      { title: "Responsible AI Overview", url: "https://learn.microsoft.com/en-us/azure/ai-services/responsible-use-of-ai-overview" },
      { title: "Azure AI Content Safety", url: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/" },
    ],
  },
  {
    id: 2,
    title: "Implement Generative AI Solutions",
    weight: "15-20%",
    links: [
      { title: "Azure AI Foundry Documentation", url: "https://learn.microsoft.com/en-us/azure/ai-studio/" },
      { title: "Azure OpenAI Service", url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/" },
      { title: "Prompt Engineering Techniques", url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering" },
    ],
  },
  {
    id: 3,
    title: "Implement Agentic AI Solutions",
    weight: "5-10%",
    links: [
      { title: "Azure AI Agent Service", url: "https://learn.microsoft.com/en-us/azure/ai-services/agents/" },
    ],
  },
  {
    id: 4,
    title: "Implement Computer Vision Solutions",
    weight: "10-15%",
    links: [
      { title: "Azure AI Vision", url: "https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/" },
      { title: "Azure Video Indexer", url: "https://learn.microsoft.com/en-us/azure/azure-video-indexer/" },
    ],
  },
  {
    id: 5,
    title: "Implement NLP Solutions",
    weight: "15-20%",
    links: [
      { title: "Azure AI Language", url: "https://learn.microsoft.com/en-us/azure/ai-services/language-service/" },
      { title: "Azure AI Speech", url: "https://learn.microsoft.com/en-us/azure/ai-services/speech-service/" },
      { title: "Azure AI Translator", url: "https://learn.microsoft.com/en-us/azure/ai-services/translator/" },
    ],
  },
  {
    id: 6,
    title: "Implement Knowledge Mining and Document Intelligence",
    weight: "15-20%",
    links: [
      { title: "Azure AI Search", url: "https://learn.microsoft.com/en-us/azure/search/" },
      { title: "Document Intelligence", url: "https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/" },
    ],
  },
]

const examTips = [
  "Passing score: 700 out of 1000",
  "Duration: 100 minutes",
  "The exam tests 3 layers: Azure Portal, Foundry Portal, and Code/SDK",
  "Temperature controls randomness (0\u20132), top_p is nucleus sampling \u2014 change one, not both",
  "BM25 is the default search ranking algorithm",
  "The Read API for OCR is asynchronous (submit \u2192 poll \u2192 get results)",
  "4 Content Safety categories: Hate, SelfHarm, Sexual, Violence (severity 0\u20136)",
  "Translator REST API requires Ocp-Apim-Subscription-Region header with multi-service keys",
  "SearchIndexClient = admin ops, SearchClient = data ops",
]

export default function ResourcesPage() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  function toggleDomain(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Study Resources"
        description="Curated links, exam tips, and study materials for the AI-102 certification"
      />

      {/* Quick Links */}
      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Link2 className="size-4 text-primary" />
          Quick Links
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full transition-colors hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className="size-5 text-primary" />
                      <ExternalLink className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <CardTitle className="text-sm">{link.title}</CardTitle>
                    <CardDescription className="text-xs">{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </a>
            )
          })}
        </div>
      </section>

      {/* Domain Resources */}
      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookOpen className="size-4 text-primary" />
          Resources by Domain
        </h2>
        <div className="flex flex-col gap-2">
          {domains.map((domain) => {
            const isExpanded = expanded.has(domain.id)
            return (
              <Card key={domain.id}>
                <button
                  onClick={() => toggleDomain(domain.id)}
                  className="flex w-full items-center gap-3 px-6 py-4 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="flex-1 text-sm font-semibold text-foreground">
                    Domain {domain.id}: {domain.title}
                  </span>
                  <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground">
                    {domain.weight}
                  </Badge>
                </button>
                {isExpanded && (
                  <CardContent className="flex flex-col gap-2 pt-0">
                    {domain.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/50"
                      >
                        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                        <span>{link.title}</span>
                      </a>
                    ))}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-xs text-muted-foreground"
          onClick={() => {
            if (expanded.size === domains.length) {
              setExpanded(new Set())
            } else {
              setExpanded(new Set(domains.map((d) => d.id)))
            }
          }}
        >
          {expanded.size === domains.length ? "Collapse All" : "Expand All"}
        </Button>
      </section>

      {/* Exam Tips */}
      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Lightbulb className="size-4 text-primary" />
          Exam Tips
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Key Facts to Remember</CardTitle>
            <CardDescription className="text-xs">
              High-yield exam details and gotchas that frequently appear in questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2.5">
              {examTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
