# AI-102: Designing and Implementing a Microsoft Azure AI Solution

**Last exam update:** December 23, 2025
**Passing score:** 700/1000
**Duration:** 100 minutes
**Official study guide:** <https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-102>

---

## Platform Naming Transition Reference

The Microsoft AI platform has undergone several rebranding stages. Exam materials, MS Learn documentation, SDKs, and portal URLs may still use older names during the transition. The table below clarifies the naming evolution.

| Era | Platform Brand | Portal Brand | Example Individual Service Name |
|-----|---------------|-------------|-------------------------------|
| Legacy | Azure Cognitive Services | (various per-service portals) | Azure Computer Vision, Azure Text Analytics |
| Generation 2 | Azure AI Services | Azure OpenAI Studio | Azure AI Vision, Azure AI Language |
| Generation 3 | Azure AI Foundry | Azure AI Foundry portal | Azure Vision in Foundry Tools, Azure Speech in Foundry Tools |
| Current (2025+) | Microsoft Foundry | Microsoft Foundry portal | Azure Vision in Foundry Tools, Azure Speech in Foundry Tools |

**Key points for the exam:**

- "Azure Cognitive Services" and "Azure AI Services" still appear in older MS Learn modules and in some SDK namespaces (e.g., `azure.cognitiveservices.*`).
- The portal at `ai.azure.com` was originally called Azure AI Studio, then Azure AI Foundry portal, and is now Microsoft Foundry portal.
- Individual services are referenced as "[Service] in Foundry Tools" in current documentation (e.g., "Document Intelligence in Foundry Tools", "Azure Translator in Foundry Tools").
- When an exam question references any generation of these names, treat them as equivalent unless the question specifically tests naming knowledge.

---

## Three Layers Tested

The AI-102 exam tests knowledge across three distinct operational layers. Questions may target any layer or require understanding of how they interact.

| Layer | What Is Tested | Examples |
|-------|---------------|---------|
| **Azure Portal** | Resource provisioning, networking (VNet, private endpoints), RBAC and managed identity, key management, monitoring (Azure Monitor, Log Analytics), cost management | Creating a multi-service AI resource, configuring diagnostic settings, restricting network access |
| **Foundry Portal** | Model deployment and configuration, prompt flow authoring, agent building, playground experimentation, evaluation runs | Deploying a GPT model, building a RAG flow, testing an agent in the playground |
| **Code / SDK** | Python SDK (`azure-ai-*` packages), REST API calls, CI/CD pipelines, container deployment (Docker, ACI, AKS) | Calling the Vision API from Python, deploying a custom model container, automating deployment with GitHub Actions |

---

## Domain 1: Plan and Manage an Azure AI Solution (20-25%)

### 1.1 Select the Appropriate Microsoft Foundry Service

- Identify when to use **generative AI** (text generation, code generation, image generation, chat completion)
- Identify when to use **computer vision** (image analysis, object detection, OCR, spatial analysis, Video Indexer)
- Identify when to use **natural language processing** (language understanding, sentiment analysis, key phrase extraction, entity recognition, PII detection, question answering)
- Identify when to use **speech** (speech-to-text, text-to-speech, speech translation, speaker recognition)
- Identify when to use **information extraction** (Document Intelligence, Content Understanding)
- Identify when to use **knowledge mining** (Azure AI Search, skillsets, indexers, Knowledge Store)

### 1.2 Plan, Create, and Deploy an Azure AI Solution

- Apply **Responsible AI principles** when planning an AI solution (fairness, reliability and safety, privacy and security, inclusiveness, transparency, accountability)
- Create an **Azure AI resource** (single-service vs. multi-service, region selection, pricing tier)
- Choose appropriate **AI models** for a given scenario
- Understand **deployment options** (cloud endpoints, edge containers, embedded models)
- Select appropriate **SDKs and APIs** for a solution
- Configure **default endpoints** for AI services
- Implement **CI/CD pipelines** for AI solutions
- Plan and implement **container deployment** for AI models

### 1.3 Manage, Monitor, and Secure Azure AI Resources

- **Monitor** Azure AI resources using Azure Monitor, diagnostic logging, and Log Analytics
- **Manage costs** using pricing calculators, budgets, alerts, and cost analysis
- **Protect keys** using Azure Key Vault, key rotation policies
- **Manage authentication** using managed identities, service principals, role-based access control (RBAC), and token-based authentication

### 1.4 Implement AI Responsibly

- Implement **content moderation** to detect and filter harmful content
- Configure **Azure AI Content Safety** for text and image content
- Create and manage **content filters and blocklists** for Azure OpenAI deployments
- Implement **prompt shields** to detect and block jailbreak and indirect prompt injection attacks
- Configure **harm detection** categories and severity thresholds
- Apply a **governance framework** for responsible AI deployment (documentation, human oversight, feedback loops)

---

## Domain 2: Implement Generative AI Solutions (15-20%)

### 2.1 Build a Solution with Microsoft Foundry

- **Plan and prepare** a generative AI solution (identify use cases, select models, define evaluation criteria)
- **Deploy hub, project, and resources** in the Foundry portal
- **Deploy models** from the model catalog (managed compute, serverless API, provisioned throughput)
- Build and orchestrate with **prompt flow** (standard flows, chat flows, evaluation flows, flow deployment)
- Implement **RAG pattern and grounding** (connect data sources, chunking strategies, embedding models, vector search integration)
- **Evaluate models** using built-in and custom metrics (groundedness, relevance, coherence, fluency, similarity)
- Integrate solutions using the **Foundry SDK** (`azure-ai-projects`, `azure-ai-inference`)
- Use **prompt templates** for consistent and reusable prompt structures

### 2.2 Use Azure OpenAI in Foundry Models

- **Provision** Azure OpenAI resources (standard vs. provisioned throughput, quota management)
- **Select and deploy** a model (GPT-4o, GPT-4, GPT-3.5-turbo, embedding models; deployment types)
- Design **prompts for code generation and natural language** tasks (system messages, few-shot examples, chain-of-thought)
- Generate images with **DALL-E** (prompt design, image size, quality settings)
- **Integrate** Azure OpenAI into an application (Chat Completions API, Completions API, Embeddings API)
- Work with **multimodal models** (vision inputs, audio inputs, structured outputs)

### 2.3 Optimize and Operationalize Generative AI

- Tune **parameters** (temperature, top_p, max_tokens, frequency_penalty, presence_penalty, stop sequences)
- Set up **monitoring and diagnostics** for deployed models (token usage, latency, error rates)
- Manage **resources and scaling** (TPM quotas, rate limiting, load balancing across deployments)
- Implement **tracing and feedback** collection for production workloads
- Use **model reflection** to improve output quality
- Deploy models in **containers** for edge or air-gapped scenarios
- **Orchestrate multiple models** in a single solution (routing, fallback, ensemble patterns)
- Apply **prompt engineering** techniques (system prompts, few-shot, chain-of-thought, ReAct, structured output)
- **Fine-tune** models with custom training data (data preparation, training, evaluation, deployment)

---

## Domain 3: Implement an Agentic Solution (5-10%)

### 3.1 Understand Agents

- Define the **role and use cases** of AI agents (task automation, multi-step reasoning, tool use, autonomous decision-making)
- Understand the difference between agents and standard chat completions

### 3.2 Configure and Create Agents

- **Configure resources** for agents (compute, storage, connected services, tool definitions)
- **Create an agent** with Foundry Agent Service (system instructions, tool configuration, knowledge sources)
- **Implement** agents with the Microsoft Agent Framework (SDK-based agent creation, tool binding, memory management)

### 3.3 Advanced Agent Patterns

- Design **complex workflows** including multi-agent orchestration (supervisor patterns, handoff protocols)
- Handle **multiple users** (session management, user context isolation)
- Implement **autonomous capabilities** with appropriate guardrails (human-in-the-loop, action confirmation, scope boundaries)

### 3.4 Test, Optimize, and Deploy Agents

- **Test** agent behavior and tool use (unit testing, integration testing, scenario testing)
- **Optimize** agent performance (latency, cost, accuracy, tool selection)
- **Deploy** agents to production (API endpoints, scaling, monitoring)

---

## Domain 4: Implement Computer Vision Solutions (10-15%)

### 4.1 Analyze Images

- Extract **visual features** from images (captions, dense captions, tags, objects, people)
- Perform **object detection** (bounding boxes, confidence scores)
- Generate and interpret **image tags** for categorization
- Use **image analysis features** in Azure Vision in Foundry Tools (smart cropping, background removal, multimodal embeddings)
- Interpret API **responses** (JSON structure, confidence thresholds, filtering results)
- Perform **OCR** with Azure Vision in Foundry Tools (Read API, printed and handwritten text)
- Implement **handwriting conversion** (ink recognition, handwriting-to-text pipelines)

### 4.2 Implement Custom Vision Models

- Distinguish between **classification** (single-label, multi-label) and **object detection** projects
- **Label** training images (tagging, bounding boxes, data quality requirements)
- **Train** custom models (iteration management, training options, domain selection)
- **Evaluate** model performance using metrics (precision, recall, mAP, AP)
- **Publish and consume** a trained model (prediction endpoint, prediction key)
- Implement a **code-first approach** using the Custom Vision SDK and REST API

### 4.3 Analyze Videos

- Extract insights with **Video Indexer** (face detection, OCR, transcript, keywords, topics, brands, sentiment, scenes, keyframes)
- Implement **Spatial Analysis** for detecting presence and movement (people counting, social distancing, zone dwell time, entry/exit tracking)

---

## Domain 5: Implement Natural Language Processing Solutions (15-20%)

### 5.1 Analyze and Translate Text

- Extract **key phrases** from text
- Identify **entities** (named entity recognition, entity linking, PII entity recognition)
- Analyze **sentiment** (document-level, sentence-level, opinion mining, aspect-based)
- Detect **language** of input text
- Detect and redact **PII** (personally identifiable information) with category filtering
- **Translate text** with Azure Translator in Foundry Tools (language auto-detection, custom dictionaries, transliteration, document translation)

### 5.2 Process and Translate Speech

- Implement **generative AI speaking** capabilities
- Perform **speech-to-text (STT)** and **text-to-speech (TTS)** with Azure Speech in Foundry Tools (real-time, batch, pronunciation assessment)
- Customize speech output with **SSML** (Speech Synthesis Markup Language: voice selection, prosody, breaks, emphasis)
- Build **custom speech** models (custom acoustic models, custom language models, custom neural voice)
- Implement **intent recognition** and **keyword recognition** from speech
- Perform **speech translation** (real-time, multi-language, partial results)

### 5.3 Build Custom Language Models

- Define **intents, entities, and utterances** for language understanding
- **Train, evaluate, deploy, and test** Conversational Language Understanding (CLU) models
- **Optimize** CLU model performance (data balancing, entity resolution, active learning)
- **Backup and recover** CLU projects (export/import, versioning)
- **Consume** CLU models from a client application (SDK, REST API, response parsing)
- Create a **custom question answering** project
- Define **QA pairs and sources** (URLs, files, editorial pairs, metadata)
- **Train, test, and publish** a knowledge base
- Implement **multi-turn conversations** (follow-up prompts, context management)
- Add **alternate phrasing** and **chit-chat** to improve response quality
- **Export** a knowledge base for backup or migration
- Implement **multi-language** question answering
- Build **custom translation** models (custom translator, training with parallel documents, BLEU score evaluation)

---

## Domain 6: Knowledge Mining and Information Extraction (15-20%)

### 6.1 Implement Azure AI Search

- **Provision** an Azure AI Search resource (tier selection, replicas, partitions, scaling)
- **Create an index** (field definitions, attributes: searchable, filterable, sortable, facetable, retrievable)
- Create a **skillset** (built-in skills: OCR, key phrase extraction, entity recognition, sentiment, image analysis, text merge, text split)
- Configure **data sources and indexers** (Azure Blob Storage, Azure SQL, Cosmos DB, Azure Table Storage; scheduling, change detection, deletion detection)
- Implement **custom skills** (Web API skill, Azure Function integration, custom skill interface)
- **Query an index** (simple query syntax, full Lucene syntax, sorting, filtering, wildcards, fuzzy search, faceted navigation, `$select`, `$top`, `$skip`, `$count`)
- Configure **Knowledge Store projections** (table projections, object projections, file projections, shaper skill)
- Implement **semantic search** solutions (semantic configuration, semantic ranking, captions, answers)
- Implement **vector search** solutions (vector fields, embedding generation, hybrid search, vector profiles)

### 6.2 Implement Document Intelligence in Foundry Tools

- **Provision** a Document Intelligence resource
- Use **prebuilt models** (invoice, receipt, ID document, business card, health insurance card, W-2, tax forms)
- Build **custom models** (custom template models, custom neural models, training data requirements, labeling)
- **Train, test, and publish** custom models
- Create **composed models** (combining multiple custom models, model routing)

### 6.3 Implement Content Understanding in Foundry Tools

- Build an **OCR pipeline** for document processing
- **Summarize, classify, and detect attributes** from documents
- **Extract entities, tables, and images** from structured and unstructured content
- **Process and ingest** documents, images, videos, and audio into downstream systems

---

## Module Mapping

This table maps each project module in the AI-102-complete repository to the exam domain it covers.

| Module | Exam Domain | Weight |
|--------|-------------|--------|
| Foundry Hub | Domain 1: Plan and Manage an Azure AI Solution | 20-25% |
| GenAI Lab | Domain 2: Implement Generative AI Solutions | 15-20% |
| RAG Engine | Domain 2 + Domain 6: Generative AI + Knowledge Mining | 15-20% |
| Agent Workshop | Domain 3: Implement an Agentic Solution | 5-10% |
| Vision Lab | Domain 4: Implement Computer Vision Solutions | 10-15% |
| Language & Speech | Domain 5: Implement NLP Solutions | 15-20% |
| Knowledge Mining | Domain 6: Knowledge Mining and Information Extraction | 15-20% |
| Responsible AI | Domain 1: Plan and Manage (cross-cutting across all domains) | cross-cutting |

---

## Practical Exam Tips from Labs

These tips come from hands-on lab exercises. Each maps to a specific exam topic and represents the kind of practical detail the AI-102 exam tests.

### Generative AI (Lab 01 + Lab 06)

- **Temperature** controls randomness (0 = deterministic, 2 = max creative). **top_p** (nucleus sampling) is an alternative — Microsoft recommends changing one or the other, not both.
- **max_tokens** limits the response length, not the prompt length. If the response is cut off mid-sentence, increase max_tokens.
- **frequency_penalty** reduces repetition of tokens already used (proportional to count). **presence_penalty** reduces repetition of any token that has appeared at all (binary). Know the difference.
- **DALL-E 3 supported sizes:** 1024x1024, 1024x1792, 1792x1024 only. Any other size fails.
- **System messages** shape model behavior. Agents need: system instructions, tools, grounding data. The system role cannot be overridden by user messages (though prompt injection tries).
- **AzureOpenAI client** (from the `openai` package) is the SDK for Azure OpenAI. It takes `azure_endpoint`, `api_key`, and `api_version`.

### RAG and Search (Lab 02 + Lab 03)

- **BM25 is the default ranking algorithm** for full-text search. It considers term frequency, inverse document frequency, and field length.
- **upload_documents** creates or fully replaces. **merge_documents** updates only specified fields (fails if document doesn't exist). **merge_or_upload_documents** creates if new, merges if existing. The exam tests this distinction.
- **Batch upload limit:** 1000 documents or 16 MB per batch.
- **Key field must be `Edm.String`** and there is exactly one per index.
- **SearchIndexClient** is for admin operations (create/delete indexes). **SearchClient** is for data operations (upload/search documents). Know which to use.
- **Indexer = data source + index + optional skillset.** Know this formula.
- **Built-in cognitive skills:** OCR, key phrase extraction, entity recognition, language detection, sentiment, image analysis, text split, text merge. Custom skills use the Web API skill interface.
- **Knowledge Store projections:** table (for Power BI), object (for blob JSON), file (for blob images).
- **Lucene query syntax:** `fieldName:value`, `AND`/`OR`/`NOT`, wildcards `*`/`?`, fuzzy `~`, proximity `"term1 term2"~N`.
- **Vector search dimensions must match** between the embedding model output and the index field configuration. 1536 for `text-embedding-ada-002`, 3072 for `text-embedding-3-large`.
- **Reciprocal Rank Fusion (RRF)** is how Azure AI Search merges keyword and vector results in hybrid mode.
- **Semantic ranking requires Standard tier** (not Free). It is a re-ranker, not a search mode.
- **RAG reduces hallucination** by grounding responses in retrieved documents. **Grounding** (RAG) is for dynamic data; **fine-tuning** is for teaching style/domain.
- **Chunking:** overlap prevents information loss at boundaries. Azure AI Search has a built-in "split skill" for automatic chunking.

### Computer Vision (Lab 04)

- **VisualFeatureTypes:** `description` (captions), `tags` (content labels), `categories`, `objects` (with bounding boxes), `faces`, `brands`. Know which to use for each scenario.
- **`analyze_image_in_stream()`** = binary data. **`analyze_image()`** = URL. The exam asks which method to use.
- **Object detection returns pixel coordinates**, not percentages. Objects can be nested (e.g., "wheel" inside "car" via `.parent`).
- **The Read API is asynchronous** — submit, get operation ID, poll until complete. You must pass `raw=True` to get response headers.
- **Read API supports images (JPEG, PNG, BMP, TIFF) and multi-page PDFs** (up to 2000 pages).

### Language and Speech (Lab 05)

- **Sentiment labels:** `positive`, `neutral`, `negative`, `mixed`. Mixed appears when a document has both positive and negative sentences. Confidence scores always sum to 1.0.
- **Opinion mining** (`show_opinion_mining=True`) returns aspect-level sentiment (e.g., "food was great but service was slow").
- **Named entity recognition** (general: Person, Location, Organization) vs **PII entity recognition** (sensitive: SSN, email, credit card) are separate API calls. PII also returns `redacted_text`.
- **Translator REST API requires `Ocp-Apim-Subscription-Region` header** when using a multi-service key. Omitting it causes 401. This is a frequent exam question.
- **Multiple target languages** in one request: repeat the `to` parameter (`to=es&to=fr`).
- **SSML structure:** `<speak>` root (with version and xmlns), `<voice>` (with name attribute), text content. Know `<prosody>` (speed/pitch), `<break>` (pauses), `<phoneme>` (pronunciation).
- **`X-Microsoft-OutputFormat` header** controls TTS audio quality. Know common formats like `audio-16khz-128kbitrate-mono-mp3`.

### Responsible AI (Lab 07)

- **Four content safety categories:** Hate, SelfHarm, Sexual, Violence. Memorize these.
- **Severity scale is 0-6**, not 0-10 or 0-100. 0 = safe, 1-2 = low, 3-4 = medium, 5-6 = high.
- **Azure Content Safety** (standalone service, you call explicitly) vs **Azure OpenAI content filters** (built into Azure OpenAI, runs automatically on model I/O). Know when to use each.
- **ContentSafetyClient** analyzes content. **BlocklistClient** manages custom blocklists (specific words/phrases to always flag).
- **Prompt Shields** is a dedicated Content Safety feature that detects jailbreak and indirect prompt injection, separate from the four content categories.

---

## Key MS Learn Links

### General Certification Resources

- **Main certification page:** <https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/>
- **Official study guide:** <https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-102>
- **Practice assessment:** <https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/practice/assessment?assessment-type=practice&assessmentId=61>
- **MS Learn training paths for AI-102:** <https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/?tab=tab-learning-paths>
- **Exam readiness zone videos:** <https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-ai-102/>

### By Domain

**Domain 1 - Plan and Manage:**
- Azure AI Services documentation: <https://learn.microsoft.com/en-us/azure/ai-services/>
- Responsible AI overview: <https://learn.microsoft.com/en-us/azure/ai-services/responsible-use-of-ai-overview>
- Azure AI Content Safety: <https://learn.microsoft.com/en-us/azure/ai-services/content-safety/>

**Domain 2 - Generative AI:**
- Azure AI Foundry documentation: <https://learn.microsoft.com/en-us/azure/ai-studio/>
- Azure OpenAI Service documentation: <https://learn.microsoft.com/en-us/azure/ai-services/openai/>
- Prompt engineering techniques: <https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering>

**Domain 3 - Agentic Solutions:**
- Azure AI Agent Service: <https://learn.microsoft.com/en-us/azure/ai-services/agents/>

**Domain 4 - Computer Vision:**
- Azure AI Vision documentation: <https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/>
- Azure Video Indexer: <https://learn.microsoft.com/en-us/azure/azure-video-indexer/>

**Domain 5 - NLP:**
- Azure AI Language documentation: <https://learn.microsoft.com/en-us/azure/ai-services/language-service/>
- Azure AI Speech documentation: <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/>
- Azure AI Translator documentation: <https://learn.microsoft.com/en-us/azure/ai-services/translator/>

**Domain 6 - Knowledge Mining:**
- Azure AI Search documentation: <https://learn.microsoft.com/en-us/azure/search/>
- Azure AI Document Intelligence: <https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/>
