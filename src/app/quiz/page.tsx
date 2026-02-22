"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { quizQuestions, type QuizQuestion } from "@/lib/quiz-data"
import { RotateCcw, ChevronRight, CheckCircle2, XCircle } from "lucide-react"

const domainLabels: Record<number, string> = {
  1: "D1: Plan & Manage", 2: "D2: Generative AI", 3: "D3: Agentic Solutions",
  4: "D4: Computer Vision", 5: "D5: NLP", 6: "D6: Knowledge Mining",
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizPage() {
  const [domainFilter, setDomainFilter] = useState<number | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => shuffle(quizQuestions))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const filtered = useMemo(
    () => (domainFilter === null ? questions : questions.filter((q) => q.domain === domainFilter)),
    [questions, domainFilter]
  )
  const current = filtered[currentIndex] as QuizQuestion | undefined
  const finished = currentIndex >= filtered.length || !current

  const resetState = useCallback((d: number | null = domainFilter) => {
    setQuestions(shuffle(quizQuestions))
    setDomainFilter(d)
    setCurrentIndex(0)
    setSelectedOption(null)
    setRevealed(false)
    setScore({ correct: 0, total: 0 })
  }, [domainFilter])

  function checkAnswer() {
    if (selectedOption === null || !current) return
    setRevealed(true)
    setScore((s) => ({
      correct: s.correct + (selectedOption === current.correctIndex ? 1 : 0),
      total: s.total + 1,
    }))
  }

  function nextQuestion() {
    setSelectedOption(null)
    setRevealed(false)
    setCurrentIndex((i) => i + 1)
  }

  function optionStyle(i: number) {
    const base = "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm cursor-pointer transition-colors"
    if (!revealed) {
      return i === selectedOption
        ? `${base} border-primary bg-primary/5`
        : `${base} border-border hover:border-muted-foreground/30 hover:bg-accent/30`
    }
    if (i === current!.correctIndex) return `${base} border-emerald-500/50 bg-emerald-500/10`
    if (i === selectedOption) return `${base} border-red-500/50 bg-red-500/10`
    return `${base} border-border opacity-50`
  }

  function circleStyle(i: number) {
    const base = "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold"
    if (revealed && i === current!.correctIndex) return `${base} border-emerald-500 bg-emerald-500 text-white`
    if (revealed && i === selectedOption) return `${base} border-red-500 bg-red-500 text-white`
    if (i === selectedOption) return `${base} border-primary bg-primary text-primary-foreground`
    return `${base} border-muted-foreground/40 text-muted-foreground`
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      <PageHeader title="Exam Quiz" description="Practice with exam-style questions from all lab modules" />

      {/* Domain filters */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={domainFilter === null ? "default" : "outline"} onClick={() => resetState(null)}>
          All ({quizQuestions.length})
        </Button>
        {[1, 2, 3, 4, 5, 6].map((d) => {
          const count = quizQuestions.filter((q) => q.domain === d).length
          return count > 0 ? (
            <Button key={d} size="sm" variant={domainFilter === d ? "default" : "outline"} onClick={() => resetState(d)}>
              D{d} ({count})
            </Button>
          ) : null
        })}
      </div>

      {/* Score bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Score: <span className="font-semibold text-foreground">{score.correct}/{score.total}</span>
          {score.total > 0 && <> ({Math.round((score.correct / score.total) * 100)}%)</>}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">
            {Math.min(currentIndex + 1, filtered.length)} / {filtered.length}
          </span>
          <Button size="sm" variant="outline" onClick={() => resetState()}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Reset
          </Button>
        </div>
      </div>

      {/* Quiz content */}
      {finished ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold">Quiz Complete</h2>
            <p className="text-sm text-muted-foreground">
              You scored {score.correct} out of {score.total}
              {score.total > 0 && <> ({Math.round((score.correct / score.total) * 100)}%)</>}
            </p>
            <Button onClick={() => resetState()}><RotateCcw className="h-4 w-4 mr-2" />Try Again</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-primary/20 bg-primary/8 text-[11px] font-bold uppercase tracking-wider text-primary">
                {domainLabels[current.domain]}
              </Badge>
              <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground">{current.lab}</Badge>
            </div>
            <CardTitle className="text-sm font-semibold leading-relaxed">{current.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {current.options.map((opt, i) => (
                <button key={i} type="button" className={optionStyle(i)} onClick={() => !revealed && setSelectedOption(i)} disabled={revealed}>
                  <span className={circleStyle(i)}>
                    {revealed && i === current.correctIndex ? <CheckCircle2 className="h-3.5 w-3.5" />
                      : revealed && i === selectedOption ? <XCircle className="h-3.5 w-3.5" />
                      : String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt.slice(3)}</span>
                </button>
              ))}
            </div>
            {revealed && (
              <div className="rounded-lg border border-border bg-accent/20 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Explanation</p>
                <p className="text-sm leading-relaxed">{current.explanation}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              {!revealed ? (
                <Button onClick={checkAnswer} disabled={selectedOption === null}>Check Answer</Button>
              ) : (
                <Button onClick={nextQuestion}>
                  {currentIndex + 1 < filtered.length ? <>Next Question<ChevronRight className="h-4 w-4 ml-1" /></> : "See Results"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
