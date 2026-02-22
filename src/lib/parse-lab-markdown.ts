// Parses lab markdown files into typed sections using <!-- section:xxx --> markers

export type SectionType = "overview" | "prerequisites" | "setup" | "layer" | "exam-tips" | "summary"

export interface LabSection {
  type: SectionType
  layerNumber?: number // only for type === "layer"
  content: string      // raw markdown for this section
}

const SECTION_MARKER_RE = /<!--\s*section:([\w:-]+)\s*-->/
const VALID_SECTION_TYPES = new Set<SectionType>(["overview", "prerequisites", "setup", "layer", "exam-tips", "summary"])

export function parseLabMarkdown(raw: string): { header: string; sections: LabSection[] } {
  const lines = raw.split("\n")
  let headerLines: string[] = []
  const sections: LabSection[] = []

  let currentType: SectionType | null = null
  let currentLayerNumber: number | undefined
  let currentContent: string[] = []
  let foundFirstMarker = false

  for (const line of lines) {
    const match = line.match(SECTION_MARKER_RE)
    if (match) {
      // Flush previous section
      if (foundFirstMarker && currentType) {
        sections.push({
          type: currentType,
          layerNumber: currentLayerNumber,
          content: currentContent.join("\n").trim(),
        })
      } else if (!foundFirstMarker) {
        headerLines = [...currentContent]
      }

      foundFirstMarker = true
      currentContent = []

      // Parse the marker
      const marker = match[1]
      if (marker.startsWith("layer:")) {
        currentType = "layer"
        const parsed = parseInt(marker.split(":")[1], 10)
        currentLayerNumber = Number.isNaN(parsed) ? undefined : parsed
      } else if (VALID_SECTION_TYPES.has(marker as SectionType)) {
        currentType = marker as SectionType
        currentLayerNumber = undefined
      } else {
        // Unknown marker type — skip the line entirely
        continue
      }
    } else {
      currentContent.push(line)
    }
  }

  // Flush the last section
  if (foundFirstMarker && currentType) {
    sections.push({
      type: currentType,
      layerNumber: currentLayerNumber,
      content: currentContent.join("\n").trim(),
    })
  }

  // If no markers found at all, return everything as header
  if (!foundFirstMarker) {
    headerLines = currentContent
  }

  return {
    header: headerLines.join("\n").trim(),
    sections,
  }
}
