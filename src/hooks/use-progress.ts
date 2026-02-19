"use client"

import { useState, useEffect, useCallback } from "react"

interface ProgressData {
  modules: Record<string, string[]> // moduleId -> completed feature IDs
}

const STORAGE_KEY = "ai102-progress"

function loadProgress(): ProgressData {
  if (typeof window === "undefined") return { modules: {} }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { modules: {} }
  } catch {
    return { modules: {} }
  }
}

function saveProgress(data: ProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Module features mapped to exam domains
const moduleFeatures: Record<string, { domainNumber: number; features: string[] }> = {
  foundry: {
    domainNumber: 1,
    features: ["service-reference", "resource-checklist", "health-check", "notes"],
  },
  generative: {
    domainNumber: 2,
    features: ["chat", "parameters", "prompt-templates", "image-gen", "models"],
  },
  rag: {
    domainNumber: 2,
    features: ["doc-upload", "rag-chat", "search", "index-viewer"],
  },
  agents: {
    domainNumber: 3,
    features: ["agent-config", "agent-chat", "workflow-viz", "agent-list"],
  },
  vision: {
    domainNumber: 4,
    features: ["image-analysis", "ocr", "custom-vision"],
  },
  language: {
    domainNumber: 5,
    features: ["text-analysis", "translation", "speech-to-text", "text-to-speech"],
  },
  search: {
    domainNumber: 6,
    features: ["index-mgmt", "data-source", "skillset", "query-explorer", "doc-intelligence"],
  },
  "responsible-ai": {
    domainNumber: 1,
    features: ["content-safety", "image-safety", "prompt-shield", "blocklists", "governance"],
  },
}

export function useModuleProgress() {
  const [progress, setProgress] = useState<ProgressData>({ modules: {} })

  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  const toggleFeature = useCallback((moduleId: string, featureId: string) => {
    setProgress((prev) => {
      const moduleCompleted = prev.modules[moduleId] || []
      const updated = moduleCompleted.includes(featureId)
        ? moduleCompleted.filter((f) => f !== featureId)
        : [...moduleCompleted, featureId]
      const next = { ...prev, modules: { ...prev.modules, [moduleId]: updated } }
      saveProgress(next)
      return next
    })
  }, [])

  const getModuleStatus = useCallback(
    (moduleId: string): "not-started" | "in-progress" | "completed" => {
      const completed = progress.modules[moduleId] || []
      const total = moduleFeatures[moduleId]?.features.length || 1
      if (completed.length === 0) return "not-started"
      if (completed.length >= total) return "completed"
      return "in-progress"
    },
    [progress]
  )

  const getModuleProgress = useCallback(
    (moduleId: string): number => {
      const completed = progress.modules[moduleId] || []
      const total = moduleFeatures[moduleId]?.features.length || 1
      return Math.round((completed.length / total) * 100)
    },
    [progress]
  )

  const getDomainProgress = useCallback(
    (domainNumber: number): number => {
      const domainModules = Object.entries(moduleFeatures).filter(
        ([, v]) => v.domainNumber === domainNumber
      )
      if (domainModules.length === 0) return 0
      let totalFeatures = 0
      let completedFeatures = 0
      for (const [modId, config] of domainModules) {
        totalFeatures += config.features.length
        completedFeatures += (progress.modules[modId] || []).length
      }
      return totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0
    },
    [progress]
  )

  const overallReadiness = (() => {
    let total = 0
    let completed = 0
    for (const [modId, config] of Object.entries(moduleFeatures)) {
      total += config.features.length
      completed += (progress.modules[modId] || []).length
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0
  })()

  return {
    progress,
    toggleFeature,
    getModuleStatus,
    getModuleProgress,
    getDomainProgress,
    overallReadiness,
    moduleFeatures,
  }
}
