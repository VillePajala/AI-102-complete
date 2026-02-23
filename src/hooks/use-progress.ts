"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  labDefinitions,
  getAllStepIds,
  getAllStepIdsForTier,
  getCompletedLayerCount,
  getCompletedLayerCountForTier,
  getLayersForTier,
  type LabTier,
} from "@/lib/lab-steps"

const STORAGE_KEY = "ai102-lab-progress"
const TIER_KEY = "ai102-lab-tiers"

interface LabProgressData {
  [labId: string]: string[] // completed step IDs
}

interface LabTierData {
  [labId: string]: LabTier
}

function loadProgress(): LabProgressData {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveProgress(data: LabProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }))
}

function loadTiers(): LabTierData {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(TIER_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveTiers(data: LabTierData) {
  localStorage.setItem(TIER_KEY, JSON.stringify(data))
  window.dispatchEvent(new StorageEvent("storage", { key: TIER_KEY }))
}

// Domain mapping for each lab module
const moduleDomains: Record<string, number> = {
  foundry: 1,
  generative: 2,
  rag: 2,
  agents: 3,
  vision: 4,
  language: 5,
  search: 6,
  "responsible-ai": 1,
}

// Build moduleFeatures from lab-steps for backwards compatibility with progress page
const moduleFeatures: Record<string, { domainNumber: number; features: string[] }> =
  Object.fromEntries(
    labDefinitions.map((lab) => [
      lab.labId,
      {
        domainNumber: moduleDomains[lab.labId] ?? 1,
        features: getAllStepIds(lab.labId),
      },
    ])
  )

// Add foundry module (has no lab definition, but appears in the dashboard)
if (!moduleFeatures.foundry) {
  moduleFeatures.foundry = {
    domainNumber: 1,
    features: [],
  }
}

export function useModuleProgress() {
  const [progress, setProgress] = useState<LabProgressData>({})
  const [tiers, setTiers] = useState<LabTierData>({})

  useEffect(() => {
    setProgress(loadProgress())
    setTiers(loadTiers())

    // Listen for storage changes from LabChecklist on the same page
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setProgress(loadProgress())
      }
      if (e.key === TIER_KEY) {
        setTiers(loadTiers())
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const toggleFeature = useCallback((moduleId: string, featureId: string) => {
    setProgress((prev) => {
      const moduleCompleted = prev[moduleId] || []
      const updated = moduleCompleted.includes(featureId)
        ? moduleCompleted.filter((f) => f !== featureId)
        : [...moduleCompleted, featureId]
      const next = { ...prev, [moduleId]: updated }
      saveProgress(next)
      return next
    })
  }, [])

  // --- Tier getters/setters ---

  const getLabTier = useCallback(
    (labId: string): LabTier => {
      return tiers[labId] || "core"
    },
    [tiers]
  )

  const setLabTier = useCallback(
    (labId: string, tier: LabTier) => {
      setTiers((prev) => {
        const next = { ...prev, [labId]: tier }
        saveTiers(next)
        return next
      })
    },
    []
  )

  // --- Original (all-steps) functions for backward compat ---

  const getModuleStatus = useCallback(
    (moduleId: string): "not-started" | "in-progress" | "completed" => {
      const completed = progress[moduleId] || []
      const allIds = getAllStepIds(moduleId)
      if (allIds.length === 0) return "not-started"
      const validCount = completed.filter((id) => allIds.includes(id)).length
      if (validCount === 0) return "not-started"
      if (validCount >= allIds.length) return "completed"
      return "in-progress"
    },
    [progress]
  )

  const getModuleProgress = useCallback(
    (moduleId: string): number => {
      const completed = progress[moduleId] || []
      const allIds = getAllStepIds(moduleId)
      if (allIds.length === 0) return 0
      const validCount = completed.filter((id) => allIds.includes(id)).length
      return Math.min(100, Math.round((validCount / allIds.length) * 100))
    },
    [progress]
  )

  // --- Tier-aware functions ---

  const getModuleProgressForTier = useCallback(
    (moduleId: string): number => {
      const tier = tiers[moduleId] || "core"
      const completed = progress[moduleId] || []
      const allIds = getAllStepIdsForTier(moduleId, tier)
      if (allIds.length === 0) return 0
      const validCount = completed.filter((id) => allIds.includes(id)).length
      return Math.min(100, Math.round((validCount / allIds.length) * 100))
    },
    [progress, tiers]
  )

  const getModuleStatusForTier = useCallback(
    (moduleId: string): "not-started" | "in-progress" | "completed" => {
      const tier = tiers[moduleId] || "core"
      const completed = progress[moduleId] || []
      const allIds = getAllStepIdsForTier(moduleId, tier)
      if (allIds.length === 0) return "not-started"
      const validCount = completed.filter((id) => allIds.includes(id)).length
      if (validCount === 0) return "not-started"
      if (validCount >= allIds.length) return "completed"
      return "in-progress"
    },
    [progress, tiers]
  )

  const getDomainProgress = useCallback(
    (domainNumber: number): number => {
      const domainModules = Object.entries(moduleDomains).filter(
        ([, d]) => d === domainNumber
      )
      if (domainModules.length === 0) return 0
      let totalSteps = 0
      let completedSteps = 0
      for (const [modId] of domainModules) {
        const tier = tiers[modId] || "core"
        const allIds = getAllStepIdsForTier(modId, tier)
        totalSteps += allIds.length
        const completed = progress[modId] || []
        completedSteps += completed.filter((id) => allIds.includes(id)).length
      }
      return totalSteps > 0 ? Math.min(100, Math.round((completedSteps / totalSteps) * 100)) : 0
    },
    [progress, tiers]
  )

  const overallReadiness = useMemo(() => {
    let total = 0
    let completed = 0
    for (const lab of labDefinitions) {
      const tier = tiers[lab.labId] || "core"
      const allIds = getAllStepIdsForTier(lab.labId, tier)
      total += allIds.length
      const labCompleted = progress[lab.labId] || []
      completed += labCompleted.filter((id) => allIds.includes(id)).length
    }
    return total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0
  }, [progress, tiers])

  // Provide completed layer count for a module (tier-aware)
  const getModuleLayerProgress = useCallback(
    (moduleId: string): { completed: number; total: number } => {
      const lab = labDefinitions.find((l) => l.labId === moduleId)
      if (!lab) return { completed: 0, total: 0 }
      const tier = tiers[moduleId] || "core"
      const completedSet = new Set(progress[moduleId] || [])
      const filteredLayers = getLayersForTier(moduleId, tier)
      return {
        completed: getCompletedLayerCountForTier(moduleId, tier, completedSet),
        total: filteredLayers.length,
      }
    },
    [progress, tiers]
  )

  return {
    progress: { modules: progress } as { modules: Record<string, string[]> },
    toggleFeature,
    getModuleStatus,
    getModuleProgress,
    getModuleProgressForTier,
    getModuleStatusForTier,
    getModuleLayerProgress,
    getDomainProgress,
    getLabTier,
    setLabTier,
    overallReadiness,
    moduleFeatures,
  }
}
