"use client"

import { useState, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { api, ApiError } from "@/lib/api"
import {
  MessageSquare,
  Globe,
  Mic,
  Volume2,
  Loader2,
  Hash,
  User,
  ShieldAlert,
  ArrowRightLeft,
  MicOff,
  Play,
} from "lucide-react"

interface TextAnalysis {
  sentiment?: { label: string; scores: { positive: number; neutral: number; negative: number } }
  keyPhrases?: string[]
  entities?: { text: string; category: string; confidence: number }[]
  piiEntities?: { text: string; category: string }[]
  language?: { name: string; iso: string; confidence: number }
}

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh-Hans", name: "Chinese (Simplified)" },
  { code: "ar", name: "Arabic" },
  { code: "fi", name: "Finnish" },
  { code: "sv", name: "Swedish" },
]

export default function LanguagePage() {
  const [activeTab, setActiveTab] = useState<"text" | "translate" | "speech">("text")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Language & Speech"
        description="Text analysis, translation, speech-to-text, and text-to-speech"
        domain="NLP Solutions"
        weight="15-20%"
      />

      <div className="flex items-center gap-2">
        {[
          { id: "text" as const, label: "Text Analysis", icon: MessageSquare },
          { id: "translate" as const, label: "Translation", icon: Globe },
          { id: "speech" as const, label: "Speech", icon: Mic },
        ].map((tab) => {
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

      {activeTab === "text" && <TextAnalysisTab />}
      {activeTab === "translate" && <TranslationTab />}
      {activeTab === "speech" && <SpeechTab />}
    </div>
  )
}

function TextAnalysisTab() {
  const [text, setText] = useState("")
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<string>("all")

  async function analyze() {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<TextAnalysis>("/api/language/analyze", {
        text: text.trim(),
        type: analysisType,
      })
      setAnalysis(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to analyze text")
    } finally {
      setLoading(false)
    }
  }

  const sentimentColor = analysis?.sentiment?.label === "positive"
    ? "text-chart-2"
    : analysis?.sentiment?.label === "negative"
      ? "text-destructive"
      : "text-muted-foreground"

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Input Text</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type text to analyze..."
            rows={10}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex flex-wrap gap-1.5">
            {["all", "sentiment", "keyPhrases", "entities", "pii", "language"].map((type) => (
              <Button
                key={type}
                variant={analysisType === type ? "default" : "outline"}
                size="xs"
                onClick={() => setAnalysisType(type)}
              >
                {type === "all" && "All"}
                {type === "sentiment" && "Sentiment"}
                {type === "keyPhrases" && "Key Phrases"}
                {type === "entities" && "Entities"}
                {type === "pii" && "PII Detection"}
                {type === "language" && "Language"}
              </Button>
            ))}
          </div>
          <Button onClick={analyze} disabled={!text.trim() || loading} className="self-start">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
            Analyze
          </Button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Results</CardTitle>
        </CardHeader>
        <CardContent>
          {!analysis ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Analyze text to see results
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {analysis.sentiment && (
                <div>
                  <h3 className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Hash className="size-3" /> Sentiment
                  </h3>
                  <p className={`text-lg font-semibold capitalize ${sentimentColor}`}>
                    {analysis.sentiment.label}
                  </p>
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <span>Pos: {(analysis.sentiment.scores.positive * 100).toFixed(0)}%</span>
                    <span>Neu: {(analysis.sentiment.scores.neutral * 100).toFixed(0)}%</span>
                    <span>Neg: {(analysis.sentiment.scores.negative * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
              {analysis.keyPhrases && analysis.keyPhrases.length > 0 && (
                <div>
                  <h3 className="mb-1 text-xs font-medium text-muted-foreground">Key Phrases</h3>
                  <div className="flex flex-wrap gap-1">
                    {analysis.keyPhrases.map((kp, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {kp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {analysis.entities && analysis.entities.length > 0 && (
                <div>
                  <h3 className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <User className="size-3" /> Entities
                  </h3>
                  <div className="flex flex-col gap-1">
                    {analysis.entities.map((e, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{e.text}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{e.category}</Badge>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {(e.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analysis.piiEntities && analysis.piiEntities.length > 0 && (
                <div>
                  <h3 className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <ShieldAlert className="size-3" /> PII Detected
                  </h3>
                  <div className="flex flex-col gap-1">
                    {analysis.piiEntities.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-destructive">{p.text}</span>
                        <Badge variant="destructive" className="text-[10px]">{p.category}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analysis.language && (
                <div>
                  <h3 className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Globe className="size-3" /> Detected Language
                  </h3>
                  <p className="text-sm text-foreground">
                    {analysis.language.name} ({analysis.language.iso}) &mdash;{" "}
                    {(analysis.language.confidence * 100).toFixed(0)}% confidence
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TranslationTab() {
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLang, setSourceLang] = useState("auto")
  const [targetLang, setTargetLang] = useState("es")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function translate() {
    if (!sourceText.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<{ translated: string }>("/api/language/translate", {
        text: sourceText.trim(),
        source: sourceLang,
        target: targetLang,
      })
      setTranslatedText(res.translated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to translate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
          >
            <option value="auto">Auto-detect</option>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
          <ArrowRightLeft className="size-4 text-muted-foreground shrink-0" />
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              rows={8}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-2">
            <textarea
              value={translatedText}
              readOnly
              placeholder="Translation will appear here..."
              rows={8}
              className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm text-secondary-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={translate} disabled={!sourceText.trim() || loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
            Translate
          </Button>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function SpeechTab() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [ttsText, setTtsText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        stream.getTracks().forEach((t) => t.stop())
        setLoading(true)
        try {
          const formData = new FormData()
          formData.append("file", blob, "recording.webm")
          const res = await api.postForm<{ text: string }>("/api/language/speech-to-text", formData)
          setTranscript(res.text)
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Failed to transcribe")
        } finally {
          setLoading(false)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      setError("Microphone access denied")
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  async function playTTS() {
    if (!ttsText.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<{ audio_url: string }>("/api/language/text-to-speech", {
        text: ttsText.trim(),
      })
      const audio = new Audio(res.audio_url)
      audio.play()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate speech")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Speech-to-Text</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
            >
              {isRecording ? (
                <>
                  <MicOff className="size-4" /> Stop
                </>
              ) : (
                <>
                  <Mic className="size-4" /> Record
                </>
              )}
            </Button>
            {isRecording && (
              <span className="flex items-center gap-1.5 text-xs text-destructive">
                <span className="size-2 animate-pulse rounded-full bg-destructive" />
                Recording...
              </span>
            )}
            {loading && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Transcribing...
              </span>
            )}
          </div>
          <div className="min-h-[120px] rounded-md border border-input bg-secondary p-3 text-sm text-secondary-foreground">
            {transcript || <span className="text-muted-foreground">Transcribed text will appear here...</span>}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Text-to-Speech</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={playTTS} disabled={!ttsText.trim() || loading} className="self-start">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            <Volume2 className="size-4" /> Play
          </Button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
