"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { api, ApiError } from "@/lib/api"
import {
  Database,
  Settings2,
  Layers,
  Search,
  FileText,
  Loader2,
  Plus,
  Upload,
} from "lucide-react"

interface SearchResult {
  content: string
  score: number
  highlights?: string[]
  metadata?: Record<string, string>
}

const builtInSkills = [
  { id: "ocr", name: "OCR", description: "Extract text from images" },
  { id: "entities", name: "Entity Recognition", description: "Detect named entities" },
  { id: "keyPhrases", name: "Key Phrase Extraction", description: "Extract key phrases" },
  { id: "sentiment", name: "Sentiment Analysis", description: "Analyze sentiment" },
  { id: "imageAnalysis", name: "Image Analysis", description: "Analyze image content" },
  { id: "textSplit", name: "Text Split", description: "Split large documents into chunks" },
  { id: "textMerge", name: "Text Merge", description: "Merge enriched content" },
  { id: "languageDetection", name: "Language Detection", description: "Detect text language" },
]

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<"indexes" | "datasource" | "skillset" | "query" | "docIntel">(
    "indexes"
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  async function runQuery() {
    if (!searchQuery.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<{ results: SearchResult[] }>("/api/search/query", {
        query: searchQuery.trim(),
      })
      setSearchResults(res.results || [])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to search")
    } finally {
      setLoading(false)
    }
  }

  function toggleSkill(id: string) {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const tabs = [
    { id: "indexes" as const, label: "Indexes", icon: Database },
    { id: "datasource" as const, label: "Data Source", icon: Settings2 },
    { id: "skillset" as const, label: "Skillset", icon: Layers },
    { id: "query" as const, label: "Query", icon: Search },
    { id: "docIntel" as const, label: "Doc Intelligence", icon: FileText },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Knowledge Mining"
        description="Search indexes, document extraction, skillsets, and query exploration"
        domain="Knowledge Mining"
        weight="15-20%"
      />

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="size-3.5" /> {tab.label}
            </Button>
          )
        })}
      </div>

      {/* Indexes */}
      {activeTab === "indexes" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Search Indexes</CardTitle>
              <Button variant="ghost" size="sm">
                <Plus className="size-3.5" /> Create Index
              </Button>
            </div>
            <CardDescription className="text-xs">
              Manage search indexes, view field definitions and document counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Index Name</th>
                    <th className="px-4 py-2 font-medium">Documents</th>
                    <th className="px-4 py-2 font-medium">Fields</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-muted-foreground">
                    <td colSpan={4} className="px-4 py-8 text-center">
                      Connect the backend to view search indexes. The index management panel shows
                      existing indexes with document counts, field definitions, and status.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Source */}
      {activeTab === "datasource" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Source Configuration</CardTitle>
            <CardDescription className="text-xs">
              Connect a data source and configure an indexer
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">Data Source Type</span>
              <select className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground">
                <option>Azure Blob Storage</option>
                <option>Azure SQL Database</option>
                <option>Cosmos DB</option>
                <option>Azure Table Storage</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">Connection String</span>
              <input
                type="text"
                placeholder="Enter connection string or storage URL..."
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">Container / Table Name</span>
              <input
                type="text"
                placeholder="documents"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <Button className="self-start">
              <Settings2 className="size-4" /> Configure Indexer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Skillset */}
      {activeTab === "skillset" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Skillset Builder</CardTitle>
            <CardDescription className="text-xs">
              Select AI skills to apply during document indexing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {builtInSkills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`flex flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors ${
                    selectedSkills.includes(skill.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-accent"
                  }`}
                >
                  <span className="text-xs font-medium">{skill.name}</span>
                  <span className="text-[10px] text-muted-foreground">{skill.description}</span>
                </button>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {selectedSkills.length} skills selected
                </span>
                <Button size="sm" className="ml-auto">
                  <Layers className="size-3.5" /> Create Skillset
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Query Explorer */}
      {activeTab === "query" && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runQuery()}
                  placeholder="Enter search query (supports Lucene syntax, filters, wildcards)..."
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={runQuery} disabled={loading || !searchQuery.trim()}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                  Search
                </Button>
              </div>
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            </CardContent>
          </Card>

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">{searchResults.length} results</p>
              {searchResults.map((result, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{result.content}</p>
                        {result.highlights && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {result.highlights.map((h, j) => (
                              <span key={j} className="rounded bg-primary/20 px-1 text-xs text-primary">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                        {result.score.toFixed(3)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Document Intelligence */}
      {activeTab === "docIntel" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Document Upload</CardTitle>
              <CardDescription className="text-xs">
                Upload invoices, receipts, or forms for structured data extraction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/30">
                <Upload className="size-8 text-muted-foreground" />
                <p className="text-sm text-foreground font-medium">Upload Document</p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG — invoices, receipts, IDs, forms
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["Invoice", "Receipt", "ID Document", "Business Card", "W-2", "Custom"].map((model) => (
                  <Badge key={model} variant="secondary" className="text-[10px] cursor-pointer hover:bg-accent">
                    {model}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Extracted Data</CardTitle>
              <CardDescription className="text-xs">
                Tables, key-value pairs, and fields from documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                Upload a document to see extracted structured data
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
