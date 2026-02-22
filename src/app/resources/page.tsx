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
    url: "https://learn.microsoft.com/en-us/shows/exam-readiness-zone/?terms=ai-102",
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
      { title: "Available Azure AI Services", url: "https://learn.microsoft.com/en-us/azure/ai-services/what-are-ai-services#available-azure-ai-services" },
      { title: "Create a Multi-Service Resource", url: "https://learn.microsoft.com/en-us/azure/ai-services/multi-service-resource?pivots=azportal" },
      { title: "Secure Azure AI Services (Tutorial)", url: "https://learn.microsoft.com/en-us/training/modules/secure-ai-services/" },
      { title: "Monitor Azure AI Services (Tutorial)", url: "https://learn.microsoft.com/en-us/training/modules/monitor-ai-services/" },
      { title: "Responsible AI Overview", url: "https://learn.microsoft.com/en-us/azure/ai-services/responsible-use-of-ai-overview" },
      { title: "Azure AI Content Safety", url: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/" },
      { title: "Container Deployment for AI Services", url: "https://learn.microsoft.com/en-us/azure/ai-services/cognitive-services-container-support" },
      { title: "Limited Access Features", url: "https://learn.microsoft.com/en-us/azure/ai-services/cognitive-services-limited-access" },
      { title: "OWASP Top 10 for LLM Applications 2025", url: "https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/" },
      { title: "MITRE ATLAS — AI Threat Matrix", url: "https://atlas.mitre.org/matrices/ATLAS" },
    ],
  },
  {
    id: 2,
    title: "Implement Generative AI Solutions",
    weight: "15-20%",
    links: [
      { title: "Azure AI Foundry Documentation", url: "https://learn.microsoft.com/en-us/azure/ai-studio/" },
      { title: "Azure OpenAI Service", url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/" },
      { title: "Available Models in Foundry", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/models-sold-directly-by-azure?view=foundry-classic" },
      { title: "Prompt Engineering Techniques", url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering" },
      { title: "Build GenAI Apps in Azure (Learning Path)", url: "https://learn.microsoft.com/en-gb/training/paths/create-custom-copilots-ai-studio/" },
      { title: "ChatGPT Python Quickstart", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/chatgpt?view=foundry-classic&tabs=python-secure" },
      { title: "Generate Images with DALL-E (Tutorial)", url: "https://learn.microsoft.com/en-us/training/modules/generate-images-azure-openai/" },
      { title: "Fine-Tuning Azure OpenAI Models", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/openai/tutorials/fine-tune?view=foundry-classic&tabs=command-line" },
    ],
  },
  {
    id: 3,
    title: "Implement Agentic AI Solutions",
    weight: "5-10%",
    links: [
      { title: "Azure Foundry Agent Service Overview", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/agents/overview?view=foundry-classic" },
      { title: "Agent Threads, Runs & Messages", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/agents/concepts/threads-runs-messages?view=foundry-classic" },
      { title: "Agent Tools Overview", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/agents/how-to/tools-classic/overview?view=foundry-classic" },
      { title: "Function Calling with Agents", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/agents/how-to/tools/function-calling?pivots=python" },
      { title: "MCP Integration with Agents", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/agents/how-to/tools-classic/model-context-protocol?view=foundry-classic" },
      { title: "Multi-Agent Connected Agents", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/agents/how-to/connected-agents?view=foundry-classic&pivots=python" },
      { title: "Microsoft Agent Framework Overview", url: "https://learn.microsoft.com/en-us/agent-framework/overview/agent-framework-overview" },
      { title: "Agent Types in Agent Framework", url: "https://learn.microsoft.com/en-us/agent-framework/user-guide/agents/agent-types/?pivots=programming-language-python" },
      { title: "Workflow Orchestration Patterns", url: "https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/orchestrations/overview" },
      { title: "Baseline Agentic AI Architecture", url: "https://techcommunity.microsoft.com/blog/machinelearningblog/baseline-agentic-ai-systems-architecture/4207137" },
      { title: "Agent SDK Python Quickstart", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/agents/quickstart?view=foundry-classic&pivots=programming-language-python-azure" },
    ],
  },
  {
    id: 4,
    title: "Implement Computer Vision Solutions",
    weight: "10-15%",
    links: [
      { title: "Azure AI Vision Overview", url: "https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/" },
      { title: "Image Analysis Overview", url: "https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/overview-image-analysis?tabs=4-0" },
      { title: "Image Analysis Python SDK Quickstart", url: "https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/how-to/call-analyze-image-40?pivots=programming-language-python" },
      { title: "OCR / Read API Overview", url: "https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/overview-ocr" },
      { title: "OCR Python SDK Quickstart", url: "https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/quickstarts-sdk/client-library?tabs=windows%2Cvisual-studio&pivots=programming-language-python" },
      { title: "Face Service Overview", url: "https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/overview-identity" },
      { title: "Face Detection Python SDK", url: "https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/quickstarts-sdk/identity-client-library?tabs=windows%2Cvisual-studio&pivots=programming-language-python" },
      { title: "Custom Vision — Image Classification (Tutorial)", url: "https://learn.microsoft.com/en-us/training/modules/classify-images/" },
      { title: "Custom Vision — Object Detection (Tutorial)", url: "https://learn.microsoft.com/en-us/training/modules/detect-objects-images/" },
      { title: "Azure Video Indexer", url: "https://learn.microsoft.com/en-us/azure/azure-video-indexer/" },
      { title: "Analyze Video (Tutorial)", url: "https://learn.microsoft.com/en-us/training/modules/analyze-video/" },
    ],
  },
  {
    id: 5,
    title: "Implement NLP Solutions",
    weight: "15-20%",
    links: [
      { title: "Azure AI Language Overview", url: "https://learn.microsoft.com/en-us/azure/ai-services/language-service/" },
      { title: "Language Features Reference", url: "https://learn.microsoft.com/en-us/azure/ai-services/language-service/overview#available-features" },
      { title: "Analyze Text with AI Language (Tutorial)", url: "https://learn.microsoft.com/en-us/training/modules/analyze-text-ai-language/" },
      { title: "Text Analytics Python SDK", url: "https://learn.microsoft.com/en-us/python/api/overview/azure/ai-textanalytics-readme?view=azure-python" },
      { title: "Custom Text Classification Overview", url: "https://learn.microsoft.com/en-us/azure/ai-services/language-service/custom-text-classification/overview" },
      { title: "Conversational Language Understanding", url: "https://learn.microsoft.com/en-us/azure/ai-services/language-service/conversational-language-understanding/overview" },
      { title: "Build a Language Understanding Model (Tutorial)", url: "https://learn.microsoft.com/en-us/training/modules/build-language-understanding-model/" },
      { title: "Azure AI Speech Service", url: "https://learn.microsoft.com/en-us/azure/ai-services/speech-service/" },
      { title: "Speech-to-Text Python Quickstart", url: "https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-speech-to-text?tabs=windows%2Cterminal&pivots=programming-language-python" },
      { title: "Text-to-Speech Python Quickstart", url: "https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-text-to-speech?tabs=windows%2Cterminal&pivots=programming-language-python" },
      { title: "Speech Translation Python Quickstart", url: "https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-speech-translation?tabs=windows%2Cterminal&pivots=programming-language-python" },
      { title: "Azure AI Translator Overview", url: "https://learn.microsoft.com/en-us/azure/ai-services/translator/" },
      { title: "Text Translation Python SDK Quickstart", url: "https://learn.microsoft.com/en-us/azure/ai-services/translator/quickstart-text-sdk?pivots=programming-language-python" },
    ],
  },
  {
    id: 6,
    title: "Implement Knowledge Mining and Document Intelligence",
    weight: "15-20%",
    links: [
      { title: "Azure AI Search Documentation", url: "https://learn.microsoft.com/en-us/azure/search/" },
      { title: "Search Index Schema", url: "https://learn.microsoft.com/en-us/azure/search/search-what-is-an-index" },
      { title: "Skillsets & Cognitive Enrichment", url: "https://learn.microsoft.com/en-us/azure/search/cognitive-search-working-with-skillsets" },
      { title: "Indexer Overview", url: "https://learn.microsoft.com/en-us/azure/search/search-indexer-overview" },
      { title: "Vector Search Overview", url: "https://learn.microsoft.com/en-us/azure/search/vector-search-overview" },
      { title: "Hybrid Search Overview", url: "https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview" },
      { title: "Semantic Ranking", url: "https://learn.microsoft.com/en-us/azure/search/semantic-search-overview" },
      { title: "Scoring Profiles", url: "https://learn.microsoft.com/en-us/azure/search/index-add-scoring-profiles" },
      { title: "RAG with Azure AI Search", url: "https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview" },
      { title: "RAG Solution Design Guide", url: "https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide" },
      { title: "Knowledge Mining (Tutorial)", url: "https://learn.microsoft.com/en-us/training/modules/ai-knowldge-mining/" },
      { title: "Capacity Planning (Replicas & Partitions)", url: "https://learn.microsoft.com/en-us/azure/search/search-capacity-planning" },
      { title: "Document Intelligence Overview", url: "https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/" },
      { title: "Prebuilt Models Reference", url: "https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/concept/model-overview?view=doc-intel-4.0.0" },
      { title: "Custom Document Models", url: "https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/train/custom-model?view=doc-intel-4.0.0" },
      { title: "Python SDK Samples (GitHub)", url: "https://github.com/Azure-Samples/document-intelligence-code-samples/tree/main/Python(v4.0)" },
      { title: "Basic RAG Chat Architecture", url: "https://learn.microsoft.com/en-us/azure/architecture/ai-ml/architecture/basic-microsoft-foundry-chat" },
      { title: "Enterprise RAG Chat Architecture", url: "https://learn.microsoft.com/en-us/azure/architecture/ai-ml/architecture/baseline-microsoft-foundry-chat" },
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
  "Single-service vs multi-service resource: multi-service = one key for multiple AI services, simpler billing",
  "Face service features require Limited Access approval \u2014 facial recognition is restricted by AI principles",
  "Custom Vision has two modes: Image Classification (categorize) and Object Detection (locate with bounding boxes)",
  "Azure AI Search: replicas improve query throughput, partitions improve index capacity",
  "Document Intelligence: Read model = text only, Layout model = text + tables + structure",
  "Foundry Agent Service components: Agent, Thread, Message, Run, Tool \u2014 know the hierarchy",
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
