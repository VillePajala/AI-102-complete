// Lab step definitions extracted from docs/labs/*.md
// Used by LabChecklist component and progress tracking

export type LabTier = "core" | "advanced" | "expert"

export interface LabStep {
  id: string
  label: string
}

export interface LabLayer {
  id: number
  title: string
  tier: LabTier
  steps: LabStep[]
}

export interface LabDefinition {
  labId: string
  labFile: string
  setup: LabStep[]
  layers: LabLayer[]
}

export const TIER_META: Record<LabTier, { label: string; order: number }> = {
  core:     { label: "Core",     order: 0 },
  advanced: { label: "Advanced", order: 1 },
  expert:   { label: "Expert",   order: 2 },
}

export const TIER_HIERARCHY: LabTier[] = ["core", "advanced", "expert"]

export const labDefinitions: LabDefinition[] = [
  // Lab 01: GenAI Lab
  {
    labId: "generative",
    labFile: "docs/labs/01-genai.md",
    setup: [
      { id: "setup-openai-resource", label: "Create Azure OpenAI resource" },
      { id: "setup-deploy-gpt", label: "Deploy gpt-4o-mini in Azure AI Foundry" },
      { id: "setup-deploy-dalle", label: "Deploy dall-e-3 in Azure AI Foundry" },
      { id: "setup-env-openai", label: "Configure backend/.env with keys and endpoints" },
      { id: "setup-restart-backend", label: "Restart backend server" },
    ],
    layers: [
      {
        id: 1,
        tier: "core",
        title: "Chat Completion",
        steps: [
          { id: "l1-get-client", label: "Implement _get_client() helper function" },
          { id: "l1-chat-completion", label: "Implement chat_completion() function" },
          { id: "l1-test", label: "Test via frontend or Swagger UI" },
        ],
      },
      {
        id: 2,
        tier: "core",
        title: "Parameter Tuning",
        steps: [
          { id: "l2-add-params", label: "Add all tuning parameters to chat_completion() API call" },
          { id: "l2-test", label: "Test with different temperature/max_tokens values" },
        ],
      },
      {
        id: 3,
        tier: "core",
        title: "DALL-E Image Generation",
        steps: [
          { id: "l3-generate-image", label: "Implement generate_image() function" },
          { id: "l3-test", label: "Test via frontend or Swagger UI" },
        ],
      },
      // --- Advanced ---
      {
        id: 4,
        tier: "advanced",
        title: "Streaming Responses",
        steps: [
          { id: "l4-stream-impl", label: "Implement streaming chat completion with stream=True" },
          { id: "l4-stream-sse", label: "Return Server-Sent Events (SSE) from the FastAPI endpoint" },
          { id: "l4-stream-test", label: "Test streaming output in the frontend" },
        ],
      },
      {
        id: 5,
        tier: "advanced",
        title: "Token Counting & Cost Estimation",
        steps: [
          { id: "l5-tiktoken", label: "Use tiktoken to count prompt/completion tokens" },
          { id: "l5-usage-response", label: "Return token usage and estimated cost in API response" },
          { id: "l5-test", label: "Verify token counts match Azure usage metadata" },
        ],
      },
      // --- Expert ---
      {
        id: 6,
        tier: "expert",
        title: "Entra ID Authentication & Governance",
        steps: [
          { id: "l6-entra-concept", label: "Review Entra ID (AAD) auth flow for Azure OpenAI" },
          { id: "l6-rbac-roles", label: "Understand RBAC roles: Cognitive Services User vs Contributor" },
          { id: "l6-managed-identity", label: "Review managed identity patterns for production deployments" },
          { id: "l6-questions", label: "Answer self-check questions on authentication" },
        ],
      },
    ],
  },

  // Lab 02: RAG Engine
  {
    labId: "rag",
    labFile: "docs/labs/02-rag.md",
    setup: [
      { id: "setup-search-resource", label: "Create Azure AI Search resource" },
      { id: "setup-search-index", label: "Create search index (ai102-index) in portal" },
      { id: "setup-env-search", label: "Configure backend/.env with search endpoint and key" },
      { id: "setup-restart-backend", label: "Restart backend server" },
    ],
    layers: [
      {
        id: 1,
        tier: "core",
        title: "Create Search Index",
        steps: [
          { id: "l1-create-index", label: "Create index with required fields in Azure Portal" },
          { id: "l1-verify-index", label: "Verify index exists with 0 documents" },
        ],
      },
      {
        id: 2,
        tier: "core",
        title: "Upload Documents",
        steps: [
          { id: "l2-imports", label: "Add SDK imports to search_service.py" },
          { id: "l2-get-client", label: "Implement _get_search_client() helper" },
          { id: "l2-upload", label: "Implement upload_document() function" },
          { id: "l2-test", label: "Test upload via frontend or Swagger UI" },
        ],
      },
      {
        id: 3,
        tier: "core",
        title: "Basic Search",
        steps: [
          { id: "l3-search", label: "Implement search_documents() function" },
          { id: "l3-test", label: "Test search via frontend or Swagger UI" },
        ],
      },
      {
        id: 4,
        tier: "core",
        title: "Chunking Strategy",
        steps: [
          { id: "l4-chunk-helper", label: "Add _chunk_text() helper function" },
          { id: "l4-chunking-logic", label: "Enhance upload_document() with chunking logic" },
          { id: "l4-test", label: "Test with a large document" },
        ],
      },
      {
        id: 5,
        tier: "core",
        title: "Vector Search (Conceptual)",
        steps: [
          { id: "l5-review", label: "Review vector search concepts" },
          { id: "l5-questions", label: "Answer self-check questions" },
        ],
      },
      {
        id: 6,
        tier: "core",
        title: "Grounded Chat (RAG)",
        steps: [
          { id: "l6-rag-toggle", label: "Verify RAG toggle works on /generative page" },
          { id: "l6-test-grounded", label: "Test grounded response with uploaded documents" },
          { id: "l6-test-unrelated", label: "Test unrelated question — model should say context is insufficient" },
        ],
      },
      // --- Advanced ---
      {
        id: 7,
        tier: "advanced",
        title: "Semantic Ranking",
        steps: [
          { id: "l7-semantic-config", label: "Configure semantic ranking on the search index" },
          { id: "l7-semantic-query", label: "Update search_documents() to use query_type='semantic'" },
          { id: "l7-compare", label: "Compare keyword vs semantic results for the same query" },
        ],
      },
      {
        id: 8,
        tier: "advanced",
        title: "Vector Search with Embeddings",
        steps: [
          { id: "l8-embed-func", label: "Implement get_embedding() using Azure OpenAI embeddings model" },
          { id: "l8-vector-field", label: "Add vector field to search index schema" },
          { id: "l8-vector-upload", label: "Generate and store embeddings during document upload" },
          { id: "l8-vector-query", label: "Implement vector search using VectorizedQuery" },
        ],
      },
      // --- Expert ---
      {
        id: 9,
        tier: "expert",
        title: "Hybrid Search & Reranking Strategies",
        steps: [
          { id: "l9-hybrid-concept", label: "Review hybrid search (keyword + vector + semantic) architecture" },
          { id: "l9-rrf", label: "Understand Reciprocal Rank Fusion (RRF) scoring" },
          { id: "l9-reranker", label: "Review cross-encoder reranking patterns for production RAG" },
          { id: "l9-questions", label: "Answer self-check questions on search strategies" },
        ],
      },
    ],
  },

  // Lab 03: Knowledge Mining
  {
    labId: "search",
    labFile: "docs/labs/03-knowledge-mining.md",
    setup: [],
    layers: [
      {
        id: 1,
        tier: "core",
        title: "Index Management",
        steps: [
          { id: "l1-review-clients", label: "Review SearchIndexClient vs SearchClient concepts" },
          { id: "l1-understand-fields", label: "Understand field types, analyzers, and scoring profiles" },
          { id: "l1-optional-index", label: "(Optional) Create a second index programmatically" },
        ],
      },
      {
        id: 2,
        tier: "core",
        title: "Data Sources and Indexers",
        steps: [
          { id: "l2-review-pipeline", label: "Review indexer pipeline concepts" },
          { id: "l2-change-detection", label: "Understand change detection policies" },
          { id: "l2-optional-wizard", label: "(Optional) Set up an indexer via Import data wizard" },
          { id: "l2-questions", label: "Answer self-check questions" },
        ],
      },
      {
        id: 3,
        tier: "core",
        title: "AI Enrichment with Skillsets",
        steps: [
          { id: "l3-review-skills", label: "Review built-in cognitive skills and their inputs/outputs" },
          { id: "l3-context-chaining", label: "Understand skillset context and chaining" },
          { id: "l3-custom-skills", label: "Review custom skills (WebApiSkill) schema" },
          { id: "l3-questions", label: "Answer self-check questions" },
        ],
      },
      {
        id: 4,
        tier: "core",
        title: "Advanced Query Syntax",
        steps: [
          { id: "l4-add-filter-facets", label: "Add filter_expr and facets parameters to search_documents()" },
          { id: "l4-lucene", label: "Review simple vs full Lucene query syntax" },
          { id: "l4-odata", label: "Review OData filter expressions" },
          { id: "l4-questions", label: "Answer self-check questions" },
        ],
      },
      // --- Advanced ---
      {
        id: 5,
        tier: "advanced",
        title: "Knowledge Store Projections",
        steps: [
          { id: "l5-projection-types", label: "Review table, object, and file projections" },
          { id: "l5-shaper-skill", label: "Understand Shaper skill for projection shaping" },
          { id: "l5-storage-output", label: "Review knowledge store output in Azure Storage" },
        ],
      },
      {
        id: 6,
        tier: "advanced",
        title: "Custom Skills & Azure Functions",
        steps: [
          { id: "l6-webapi-schema", label: "Review WebApiSkill request/response contract" },
          { id: "l6-function-impl", label: "Design a custom skill Azure Function (conceptual)" },
          { id: "l6-skill-integration", label: "Understand custom skill integration in a skillset pipeline" },
        ],
      },
      // --- Expert ---
      {
        id: 7,
        tier: "expert",
        title: "Incremental Enrichment & Debugging",
        steps: [
          { id: "l7-incremental", label: "Review incremental enrichment and caching strategies" },
          { id: "l7-debug-sessions", label: "Understand debug sessions for skillset troubleshooting" },
          { id: "l7-field-mappings", label: "Review output field mappings and common pitfalls" },
          { id: "l7-questions", label: "Answer self-check questions on indexer debugging" },
        ],
      },
    ],
  },

  // Lab 04: Vision Lab
  {
    labId: "vision",
    labFile: "docs/labs/04-vision.md",
    setup: [
      { id: "setup-ai-services", label: "Create Azure AI Services multi-service resource" },
      { id: "setup-env-vision", label: "Configure backend/.env with endpoint and key" },
      { id: "setup-restart-backend", label: "Restart backend server" },
    ],
    layers: [
      {
        id: 1,
        tier: "core",
        title: "Image Analysis",
        steps: [
          { id: "l1-imports", label: "Add SDK imports to vision_service.py" },
          { id: "l1-get-client", label: "Implement _get_client() helper" },
          { id: "l1-analyze", label: "Implement analyze_image() with description and tags" },
          { id: "l1-test", label: "Test via frontend or Swagger UI" },
        ],
      },
      {
        id: 2,
        tier: "core",
        title: "Object Detection",
        steps: [
          { id: "l2-add-objects", label: "Add VisualFeatureTypes.objects to analyze_image()" },
          { id: "l2-parse-bbox", label: "Parse bounding box data from response" },
          { id: "l2-test", label: "Test with image containing multiple objects" },
        ],
      },
      {
        id: 3,
        tier: "core",
        title: "OCR with the Read API",
        steps: [
          { id: "l3-ocr", label: "Implement ocr_image() with async Read API" },
          { id: "l3-polling", label: "Implement polling loop for operation completion" },
          { id: "l3-test", label: "Test with image containing text" },
        ],
      },
      // --- Advanced ---
      {
        id: 4,
        tier: "advanced",
        title: "Custom Vision Models",
        steps: [
          { id: "l4-project-types", label: "Review Custom Vision project types (classification vs detection)" },
          { id: "l4-training-workflow", label: "Understand training, iteration, and publishing workflow" },
          { id: "l4-prediction-api", label: "Review prediction endpoint SDK patterns" },
          { id: "l4-test", label: "Plan a Custom Vision project for a sample use case" },
        ],
      },
      {
        id: 5,
        tier: "advanced",
        title: "Image Analysis 4.0 Features",
        steps: [
          { id: "l5-dense-captions", label: "Review dense captions and smart cropping features" },
          { id: "l5-people-detection", label: "Understand people detection and background removal" },
          { id: "l5-custom-model", label: "Review custom model training with Florence foundation" },
        ],
      },
      // --- Expert ---
      {
        id: 6,
        tier: "expert",
        title: "Face API & Spatial Analysis",
        steps: [
          { id: "l6-face-detect", label: "Review Face API detection, verification, and identification" },
          { id: "l6-face-groups", label: "Understand PersonGroup and LargePersonGroup management" },
          { id: "l6-spatial", label: "Review spatial analysis patterns for video/camera scenarios" },
          { id: "l6-questions", label: "Answer self-check questions on vision architecture" },
        ],
      },
    ],
  },

  // Lab 05: Language & Speech
  {
    labId: "language",
    labFile: "docs/labs/05-language.md",
    setup: [
      { id: "setup-ai-services", label: "Set up Azure AI Services multi-service resource" },
      { id: "setup-translator", label: "Configure Translator key and region in backend/.env" },
      { id: "setup-speech", label: "Configure Speech key and region in backend/.env" },
      { id: "setup-restart-backend", label: "Restart backend server" },
    ],
    layers: [
      {
        id: 1,
        tier: "core",
        title: "Sentiment Analysis",
        steps: [
          { id: "l1-imports", label: "Add SDK imports to language_service.py" },
          { id: "l1-get-client", label: "Implement _get_text_client() helper" },
          { id: "l1-sentiment", label: "Implement analyze_text() with sentiment analysis" },
          { id: "l1-test", label: "Test via frontend or Swagger UI" },
        ],
      },
      {
        id: 2,
        tier: "core",
        title: "NLP Features",
        steps: [
          { id: "l2-keyphrases", label: "Add key phrase extraction to analyze_text()" },
          { id: "l2-entities", label: "Add entity recognition to analyze_text()" },
          { id: "l2-pii", label: "Add PII detection to analyze_text()" },
          { id: "l2-language", label: "Add language detection to analyze_text()" },
          { id: "l2-test", label: "Test each analysis type" },
        ],
      },
      {
        id: 3,
        tier: "core",
        title: "Translation",
        steps: [
          { id: "l3-translate", label: "Implement translate_text() with Translator REST API" },
          { id: "l3-test", label: "Test translation between multiple language pairs" },
        ],
      },
      {
        id: 4,
        tier: "core",
        title: "Speech Services",
        steps: [
          { id: "l4-stt", label: "Implement speech_to_text() with Speech REST API" },
          { id: "l4-tts", label: "Implement text_to_speech() with SSML" },
          { id: "l4-test-stt", label: "Test STT with a WAV audio file" },
          { id: "l4-test-tts", label: "Test TTS and verify audio playback" },
        ],
      },
      // --- Advanced ---
      {
        id: 5,
        tier: "advanced",
        title: "Custom NER & Conversational Language Understanding",
        steps: [
          { id: "l5-custom-ner", label: "Review custom NER project lifecycle (label, train, deploy)" },
          { id: "l5-clu-intents", label: "Understand CLU intents, entities, and utterances" },
          { id: "l5-clu-deploy", label: "Review CLU deployment slots and prediction API" },
        ],
      },
      {
        id: 6,
        tier: "advanced",
        title: "Custom Speech & Voice",
        steps: [
          { id: "l6-custom-stt", label: "Review custom speech model training and endpoints" },
          { id: "l6-pronunciation", label: "Understand pronunciation assessment API" },
          { id: "l6-custom-voice", label: "Review custom neural voice creation workflow" },
        ],
      },
      // --- Expert ---
      {
        id: 7,
        tier: "expert",
        title: "Document Translation & Orchestration Workflow",
        steps: [
          { id: "l7-doc-translate", label: "Review batch document translation with Azure Translator" },
          { id: "l7-orchestration", label: "Understand orchestration workflow for routing to CLU/QnA/LUIS" },
          { id: "l7-multi-region", label: "Review multi-region deployment patterns for language services" },
          { id: "l7-questions", label: "Answer self-check questions on language architecture" },
        ],
      },
    ],
  },

  // Lab 06: Agent Workshop
  {
    labId: "agents",
    labFile: "docs/labs/06-agents.md",
    setup: [
      { id: "setup-verify-openai", label: "Verify Lab 01 Azure OpenAI resource is working" },
    ],
    layers: [
      {
        id: 1,
        tier: "core",
        title: "System Instructions",
        steps: [
          { id: "l1-system-msg", label: "Build system message with instructions and tool list" },
          { id: "l1-api-call", label: "Call Chat Completions API with system message" },
          { id: "l1-return-dict", label: 'Return result as dict with "message" and "tool_calls" keys' },
          { id: "l1-test", label: "Test via frontend or Swagger UI" },
        ],
      },
      {
        id: 2,
        tier: "core",
        title: "Simulated Tool Calls",
        steps: [
          { id: "l2-regex", label: "Add regex parsing for [TOOL: ...] patterns" },
          { id: "l2-tool-list", label: "Build tool_calls list from parsed matches" },
          { id: "l2-clean", label: "Clean tool patterns from display content" },
          { id: "l2-test", label: "Test with prompts that trigger tool usage" },
        ],
      },
      {
        id: 3,
        tier: "core",
        title: "Grounding with Knowledge Sources",
        steps: [
          { id: "l3-review", label: "Review grounding concepts (RAG, code interpreter, function calling)" },
          { id: "l3-foundry", label: "Understand Foundry Agent Service capabilities" },
          { id: "l3-questions", label: "Answer self-check questions" },
        ],
      },
      // --- Advanced ---
      {
        id: 4,
        tier: "advanced",
        title: "Function Calling with Tool Definitions",
        steps: [
          { id: "l4-tool-schema", label: "Define tools array with JSON Schema function parameters" },
          { id: "l4-tool-choice", label: "Implement tool_choice options (auto, required, none)" },
          { id: "l4-tool-loop", label: "Build the tool-call-response loop pattern" },
        ],
      },
      {
        id: 5,
        tier: "advanced",
        title: "Multi-Agent Patterns",
        steps: [
          { id: "l5-routing", label: "Review routing agent pattern for task delegation" },
          { id: "l5-handoff", label: "Understand agent handoff and context passing" },
          { id: "l5-foundry-agents", label: "Review Foundry Agent Service multi-agent orchestration" },
        ],
      },
      // --- Expert ---
      {
        id: 6,
        tier: "expert",
        title: "Code Interpreter & File Search",
        steps: [
          { id: "l6-code-interpreter", label: "Review code interpreter tool capabilities and sandbox" },
          { id: "l6-file-search", label: "Understand file search tool with vector stores" },
          { id: "l6-assistants-api", label: "Review Assistants API thread and run lifecycle" },
          { id: "l6-questions", label: "Answer self-check questions on agent architecture" },
        ],
      },
    ],
  },

  // Lab 07: Responsible AI
  {
    labId: "responsible-ai",
    labFile: "docs/labs/07-responsible-ai.md",
    setup: [
      { id: "setup-content-safety", label: "Create Azure Content Safety resource" },
      { id: "setup-env-safety", label: "Configure backend/.env with Content Safety endpoint and key" },
      { id: "setup-restart-backend", label: "Restart backend server" },
    ],
    layers: [
      {
        id: 1,
        tier: "core",
        title: "Content Safety Analysis",
        steps: [
          { id: "l1-imports", label: "Add SDK imports to safety_service.py" },
          { id: "l1-get-client", label: "Implement _get_client() helper" },
          { id: "l1-analyze", label: "Implement analyze_text() with four safety categories" },
          { id: "l1-test", label: "Test via frontend or Swagger UI" },
        ],
      },
      {
        id: 2,
        tier: "core",
        title: "Severity Levels",
        steps: [
          { id: "l2-severity-label", label: "Implement _severity_label() helper function" },
          { id: "l2-update-analyze", label: "Update analyze_text() to use human-readable labels" },
          { id: "l2-test", label: 'Test — verify labels show "Safe" instead of "0"' },
        ],
      },
      {
        id: 3,
        tier: "core",
        title: "Prompt Shield",
        steps: [
          { id: "l3-check-prompt", label: "Implement check_prompt() with severity threshold logic" },
          { id: "l3-test-safe", label: "Test with safe prompts — should return flagged: false" },
          { id: "l3-test-harmful", label: "Test with harmful content — should return flagged: true" },
        ],
      },
      // --- Advanced ---
      {
        id: 4,
        tier: "advanced",
        title: "Custom Blocklists",
        steps: [
          { id: "l4-blocklist-create", label: "Review blocklist creation and item management API" },
          { id: "l4-blocklist-analyze", label: "Understand how to use blocklists in text analysis" },
          { id: "l4-blocklist-patterns", label: "Design blocklist strategy for a production scenario" },
        ],
      },
      {
        id: 5,
        tier: "advanced",
        title: "Groundedness Detection",
        steps: [
          { id: "l5-groundedness-api", label: "Review groundedness detection API and scoring" },
          { id: "l5-hallucination", label: "Understand hallucination detection in RAG pipelines" },
          { id: "l5-integration", label: "Design integration pattern for grounded response validation" },
        ],
      },
      // --- Expert ---
      {
        id: 6,
        tier: "expert",
        title: "RAI Governance & Compliance",
        steps: [
          { id: "l6-rai-principles", label: "Review Microsoft Responsible AI principles and practices" },
          { id: "l6-transparency-notes", label: "Understand transparency notes and impact assessments" },
          { id: "l6-content-filtering", label: "Review Azure OpenAI content filtering configuration" },
          { id: "l6-questions", label: "Answer self-check questions on RAI governance" },
        ],
      },
    ],
  },
]

// Lookup helpers

const labDefinitionsByLabId = new Map(
  labDefinitions.map((lab) => [lab.labId, lab])
)

export function getLabDefinition(labId: string): LabDefinition | undefined {
  return labDefinitionsByLabId.get(labId)
}

export function getTotalSteps(labId: string): number {
  const lab = getLabDefinition(labId)
  if (!lab) return 0
  const setupCount = lab.setup.length
  const layerCount = lab.layers.reduce((sum, layer) => sum + layer.steps.length, 0)
  return setupCount + layerCount
}

export function getAllStepIds(labId: string): string[] {
  const lab = getLabDefinition(labId)
  if (!lab) return []
  const setupIds = lab.setup.map((s) => s.id)
  const layerIds = lab.layers.flatMap((layer) => layer.steps.map((s) => s.id))
  return [...setupIds, ...layerIds]
}

export function getCompletedLayerCount(labId: string, completedStepIds: Set<string>): number {
  const lab = getLabDefinition(labId)
  if (!lab) return 0
  return lab.layers.filter((layer) =>
    layer.steps.every((step) => completedStepIds.has(step.id))
  ).length
}

// --- Tier-aware helpers ---

/** Get layers for a lab filtered to the selected tier and below */
export function getLayersForTier(labId: string, tier: LabTier): LabLayer[] {
  const lab = getLabDefinition(labId)
  if (!lab) return []
  const maxOrder = TIER_META[tier].order
  return lab.layers.filter((layer) => TIER_META[layer.tier].order <= maxOrder)
}

/** Get all step IDs (setup + layers) filtered to the selected tier and below */
export function getAllStepIdsForTier(labId: string, tier: LabTier): string[] {
  const lab = getLabDefinition(labId)
  if (!lab) return []
  const setupIds = lab.setup.map((s) => s.id)
  const layerIds = getLayersForTier(labId, tier).flatMap((layer) => layer.steps.map((s) => s.id))
  return [...setupIds, ...layerIds]
}

/** Get completed layer count filtered to the selected tier and below */
export function getCompletedLayerCountForTier(
  labId: string,
  tier: LabTier,
  completedStepIds: Set<string>
): number {
  const layers = getLayersForTier(labId, tier)
  return layers.filter((layer) =>
    layer.steps.every((step) => completedStepIds.has(step.id))
  ).length
}
