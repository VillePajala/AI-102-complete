"use client"

import { useState, useRef, useCallback } from "react"
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
import { LabChecklist } from "@/components/lab-checklist"
import { LabGuideDrawer } from "@/components/lab-guide-drawer"
import { api, ApiError } from "@/lib/api"
import {
  Eye,
  Upload,
  FileText,
  Tag,
  Scan,
  Loader2,
  Image as ImageIcon,
} from "lucide-react"

interface AnalysisResult {
  caption?: string
  tags?: string[]
  objects?: { name: string; confidence: number; boundingBox?: { x: number; y: number; w: number; h: number } }[]
  text?: string[]
  description?: string
}

export default function VisionPage() {
  const [activeTab, setActiveTab] = useState<"analyze" | "ocr" | "custom">("analyze")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const drawBoundingBoxes = useCallback(
    (objects: AnalysisResult["objects"]) => {
      if (!canvasRef.current || !imagePreview || !objects) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.onerror = () => console.warn("Failed to load image for bounding box overlay")
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        ctx.strokeStyle = "#60a5fa"
        ctx.lineWidth = 3
        ctx.font = "14px monospace"
        ctx.fillStyle = "#60a5fa"
        for (const obj of objects) {
          if (obj.boundingBox) {
            const { x, y, w, h } = obj.boundingBox
            ctx.strokeRect(x, y, w, h)
            ctx.fillRect(x, y - 20, ctx.measureText(obj.name).width + 8, 20)
            ctx.fillStyle = "#ffffff"
            ctx.fillText(obj.name, x + 4, y - 5)
            ctx.fillStyle = "#60a5fa"
          }
        }
      }
      img.src = imagePreview
    },
    [imagePreview]
  )

  async function analyzeImage() {
    if (!imageFile || loading) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", imageFile)
      const endpoint = activeTab === "ocr" ? "/api/vision/ocr" : "/api/vision/analyze"
      const res = await api.postForm<AnalysisResult>(endpoint, formData)
      setResult(res)
      if (res.objects && res.objects.length > 0) {
        drawBoundingBoxes(res.objects)
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to analyze image"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vision Lab"
        description="Analyze images, extract text with OCR, detect objects, and build custom classifiers"
        domain="Computer Vision"
        weight="10-15%"
      />

      <LabChecklist labId="vision" />

      <div className="flex items-center gap-2">
        {[
          { id: "analyze" as const, label: "Analysis", icon: Eye },
          { id: "ocr" as const, label: "OCR / Text", icon: FileText },
          { id: "custom" as const, label: "Custom Vision", icon: Scan },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                setActiveTab(tab.id)
                setResult(null)
              }}
            >
              <Icon className="size-3.5" /> {tab.label}
            </Button>
          )
        })}
        <div className="flex-1" />
        <LabGuideDrawer labId="vision" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Image upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Image Input</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!imagePreview ? (
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary/50 hover:bg-accent/30"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload image file"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
              >
                <Upload className="size-8 text-muted-foreground" />
                <p className="text-sm text-foreground font-medium">Upload Image</p>
                <p className="text-xs text-muted-foreground">JPG or PNG files</p>
              </div>
            ) : (
              <div className="relative">
                {result?.objects && result.objects.length > 0 ? (
                  <canvas ref={canvasRef} className="w-full rounded-lg border border-border" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Uploaded image" className="w-full rounded-lg border border-border" />
                )}
                <Button
                  variant="secondary"
                  size="xs"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview(null)
                    setImageFile(null)
                    setResult(null)
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                >
                  Change
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              onClick={analyzeImage}
              disabled={!imageFile || loading}
              className="self-start"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Eye className="size-4" />
              )}
              {activeTab === "ocr" ? "Extract Text" : "Analyze Image"}
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Analyzing...
                  </div>
                ) : (
                  "Upload and analyze an image to see results"
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {result.caption && (
                  <div>
                    <h3 className="mb-1 text-xs font-medium text-muted-foreground">Caption</h3>
                    <p className="text-sm text-foreground">{result.caption}</p>
                  </div>
                )}
                {result.description && (
                  <div>
                    <h3 className="mb-1 text-xs font-medium text-muted-foreground">Description</h3>
                    <p className="text-sm text-foreground">{result.description}</p>
                  </div>
                )}
                {result.tags && result.tags.length > 0 && (
                  <div>
                    <h3 className="mb-1 text-xs font-medium text-muted-foreground">
                      <Tag className="mr-1 inline size-3" /> Tags
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {result.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-[11px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {result.objects && result.objects.length > 0 && (
                  <div>
                    <h3 className="mb-1 text-xs font-medium text-muted-foreground">
                      <ImageIcon className="mr-1 inline size-3" /> Objects
                    </h3>
                    <div className="flex flex-col gap-1">
                      {result.objects.map((obj, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{obj.name}</span>
                          <Badge variant="outline" className="font-mono text-[11px]">
                            {(obj.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.text && result.text.length > 0 && (
                  <div>
                    <h3 className="mb-1 text-xs font-medium text-muted-foreground">
                      <FileText className="mr-1 inline size-3" /> Extracted Text
                    </h3>
                    <div className="rounded-md bg-secondary p-3 font-mono text-xs text-secondary-foreground">
                      {result.text.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Custom Vision section */}
      {activeTab === "custom" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Custom Vision</CardTitle>
            <CardDescription className="text-xs">
              Upload training images, assign labels, train a model, and test with new images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-dashed border-border p-6 text-center">
                <Upload className="mx-auto mb-2 size-6 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Upload Training Images</p>
                <p className="text-[11px] text-muted-foreground">Add labeled images for training</p>
              </div>
              <div className="rounded-md border border-dashed border-border p-6 text-center">
                <Tag className="mx-auto mb-2 size-6 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Assign Labels</p>
                <p className="text-[11px] text-muted-foreground">Tag images with classifications</p>
              </div>
              <div className="rounded-md border border-dashed border-border p-6 text-center">
                <Scan className="mx-auto mb-2 size-6 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Train & Test</p>
                <p className="text-[11px] text-muted-foreground">Train model and run predictions</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Connect the backend to enable custom vision training. This requires Azure Custom Vision
              resources to be provisioned.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
