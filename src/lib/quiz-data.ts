export interface QuizQuestion {
  id: string
  domain: number
  lab: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const quizQuestions: QuizQuestion[] = [
  // ── Lab 01 - GenAI (Domain 2) ──────────────────────────────────────
  {
    id: "genai-1",
    domain: 2,
    lab: "GenAI Lab",
    question:
      "You are building an application that uses Azure OpenAI. You need the model to produce consistent, reproducible output for the same input. Which parameter should you set?",
    options: [
      "A. temperature=0",
      "B. top_p=0",
      "C. max_tokens=1",
      "D. presence_penalty=2",
    ],
    correctIndex: 0,
    explanation:
      "Setting temperature=0 makes the model deterministic. While top_p=0 might seem similar, Microsoft recommends adjusting temperature OR top_p, and temperature=0 is the standard approach for reproducible output.",
  },
  {
    id: "genai-2",
    domain: 2,
    lab: "GenAI Lab",
    question:
      "A developer creates an AzureOpenAI client but gets an authentication error. The code uses api_key and azure_endpoint correctly. What is the most likely missing parameter?",
    options: [
      "A. model",
      "B. api_version",
      "C. deployment_name",
      "D. organization",
    ],
    correctIndex: 1,
    explanation:
      "The AzureOpenAI client requires api_version to be specified. Unlike the standard OpenAI client, Azure OpenAI uses versioned APIs and will fail without this parameter.",
  },
  {
    id: "genai-3",
    domain: 2,
    lab: "GenAI Lab",
    question:
      "In Azure OpenAI, what does the 'model' parameter in client.chat.completions.create() refer to?",
    options: [
      "A. The base model name (e.g., gpt-4o)",
      "B. The deployment name you created in Azure",
      "C. The API version",
      "D. The Azure resource name",
    ],
    correctIndex: 1,
    explanation:
      "In Azure OpenAI, the 'model' parameter takes the deployment name, not the base model name. This is different from the standard OpenAI API.",
  },
  {
    id: "genai-4",
    domain: 2,
    lab: "GenAI Lab",
    question:
      "You need to generate images using DALL-E 3 in Azure OpenAI. Which image sizes are supported?",
    options: [
      "A. 256x256, 512x512, 1024x1024",
      "B. 1024x1024, 1024x1792, 1792x1024",
      "C. 512x512, 1024x1024, 2048x2048",
      "D. Any custom resolution up to 4096x4096",
    ],
    correctIndex: 1,
    explanation:
      "DALL-E 3 supports only three sizes: 1024x1024, 1024x1792, and 1792x1024. Any other size will cause an error.",
  },

  // ── Lab 02 - RAG (Domain 2 + 6) ────────────────────────────────────
  {
    id: "rag-1",
    domain: 6,
    lab: "RAG Engine",
    question:
      "You need to upload a batch of 500 documents to an Azure AI Search index. A document with ID 'doc-42' already exists and you want to update only its title field without affecting other fields. Which method should you use?",
    options: [
      "A. upload_documents",
      "B. merge_documents",
      "C. merge_or_upload_documents",
      "D. delete_documents then upload_documents",
    ],
    correctIndex: 1,
    explanation:
      "merge_documents updates only specified fields on existing documents. upload_documents would fully replace the document. merge_or_upload_documents would also work but merge_documents is the most precise choice since you know the document exists.",
  },
  {
    id: "rag-2",
    domain: 6,
    lab: "RAG Engine",
    question:
      "A user searches for 'car maintenance' but relevant documents use the word 'automobile' instead. Which search approach would find these documents?",
    options: [
      "A. Full-text search with Lucene syntax",
      "B. Exact match filtering",
      "C. Semantic search with semantic ranking",
      "D. Wildcard search with car*",
    ],
    correctIndex: 2,
    explanation:
      "Semantic search understands meaning, not just keywords. It would match 'car' with 'automobile' based on semantic similarity. Full-text search relies on keyword matching and wouldn't find 'automobile' from 'car'.",
  },
  {
    id: "rag-3",
    domain: 2,
    lab: "RAG Engine",
    question:
      "You are building a RAG pipeline. The model sometimes ignores the retrieved context and answers from its training data. What is the most effective solution?",
    options: [
      "A. Increase temperature to 2.0",
      "B. Fine-tune the model on your documents",
      "C. Strengthen the system message to prioritize context and say 'I don't know' if context is insufficient",
      "D. Increase max_tokens",
    ],
    correctIndex: 2,
    explanation:
      "The most effective and practical solution for RAG grounding is a strong system message that instructs the model to use only the provided context. Fine-tuning is for style/domain, not for grounding.",
  },
  {
    id: "rag-4",
    domain: 6,
    lab: "RAG Engine",
    question:
      "Your search index has a content field of type Edm.String with searchable=true. You want to also enable filtering by a category field. What attribute must the category field have?",
    options: [
      "A. searchable=true",
      "B. filterable=true",
      "C. retrievable=true",
      "D. sortable=true",
    ],
    correctIndex: 1,
    explanation:
      "To use a field in $filter expressions, it must have the filterable attribute set to true. Searchable is for full-text search, retrievable is for including in results, sortable is for $orderby.",
  },

  // ── Lab 03 - Knowledge Mining (Domain 6) ────────────────────────────
  {
    id: "km-1",
    domain: 6,
    lab: "Knowledge Mining",
    question:
      "You have scanned PDF invoices stored in Azure Blob Storage. You need to extract text from the images within these PDFs during indexing. Which combination of skillset skills should you use?",
    options: [
      "A. OCR skill only",
      "B. OCR skill + Text Merge skill",
      "C. Image Analysis skill + Key Phrase Extraction skill",
      "D. Text Split skill + OCR skill",
    ],
    correctIndex: 1,
    explanation:
      "OCR extracts text from images. Text Merge combines the OCR output back with the original text content. Without Text Merge, the extracted image text wouldn't be integrated into the searchable content.",
  },
  {
    id: "km-2",
    domain: 6,
    lab: "Knowledge Mining",
    question:
      "You need to call a custom machine learning model during the Azure AI Search indexer enrichment pipeline. Which skill type should you use?",
    options: [
      "A. Built-in cognitive skill",
      "B. Custom Entity Lookup skill",
      "C. Web API skill",
      "D. Shaper skill",
    ],
    correctIndex: 2,
    explanation:
      "The Web API skill lets you call any external HTTP endpoint (including custom ML models) during the enrichment pipeline. It's the standard way to integrate custom processing.",
  },
  {
    id: "km-3",
    domain: 6,
    lab: "Knowledge Mining",
    question:
      "A search query uses '\"machine learning\"~5' with query_type='full'. What does this query do?",
    options: [
      "A. Searches for exact phrase 'machine learning'",
      "B. Searches for 'machine' and 'learning' within 5 words of each other",
      "C. Searches for words starting with 'machine learning' with up to 5 character variations",
      "D. Returns the top 5 results for 'machine learning'",
    ],
    correctIndex: 1,
    explanation:
      "The ~N after a quoted phrase in Lucene full syntax is a proximity search. It finds documents where the terms appear within N words of each other, regardless of order.",
  },
  {
    id: "km-4",
    domain: 6,
    lab: "Knowledge Mining",
    question:
      "You want to display category counts alongside search results (e.g., 'Tutorial: 15, Reference: 8'). Which Azure AI Search feature should you use?",
    options: [
      "A. $select",
      "B. $orderby",
      "C. Facets",
      "D. Scoring profiles",
    ],
    correctIndex: 2,
    explanation:
      "Facets provide category counts for facetable fields. This is the standard way to implement faceted navigation (category filters with counts) in search UIs.",
  },
  {
    id: "km-5",
    domain: 6,
    lab: "Knowledge Mining",
    question:
      "You need to export entities extracted during AI enrichment to Power BI for analysis. What should you configure?",
    options: [
      "A. A custom skill that writes to Power BI",
      "B. Knowledge Store with table projections",
      "C. An indexer output field mapping to a SQL database",
      "D. A secondary index with entity fields",
    ],
    correctIndex: 1,
    explanation:
      "Knowledge Store table projections store enrichment data in Azure Table Storage, which Power BI can connect to directly. This is the intended export mechanism for AI enrichment data.",
  },

  // ── Lab 04 - Vision (Domain 4) ──────────────────────────────────────
  {
    id: "vision-1",
    domain: 4,
    lab: "Vision Lab",
    question:
      "You need to extract text from a scanned multi-page PDF using Azure Computer Vision. Which API should you use?",
    options: [
      "A. Analyze Image API with VisualFeatureTypes.description",
      "B. The Read API (client.read_in_stream)",
      "C. OCR API (client.recognize_printed_text)",
      "D. Describe Image API",
    ],
    correctIndex: 1,
    explanation:
      "The Read API supports multi-page PDFs (up to 2000 pages) and handles both printed and handwritten text. The legacy OCR API only works on single images.",
  },
  {
    id: "vision-2",
    domain: 4,
    lab: "Vision Lab",
    question:
      "When using the Read API, you call client.read_in_stream(stream, raw=True). Why is raw=True required?",
    options: [
      "A. It returns raw image bytes",
      "B. It enables GPU acceleration for faster processing",
      "C. It gives access to HTTP response headers which contain the operation-location URL for polling",
      "D. It bypasses image preprocessing",
    ],
    correctIndex: 2,
    explanation:
      "raw=True returns the raw HTTP response including headers. The operation-location header contains the URL needed to poll for results, since the Read API is asynchronous.",
  },
  {
    id: "vision-3",
    domain: 4,
    lab: "Vision Lab",
    question:
      "An image analysis response contains both tags and objects. What is the key difference between them?",
    options: [
      "A. Tags are more accurate than objects",
      "B. Objects include bounding box coordinates; tags do not",
      "C. Tags work only on faces; objects work on everything",
      "D. Objects require a paid tier; tags are free",
    ],
    correctIndex: 1,
    explanation:
      "Objects include pixel-coordinate bounding boxes (x, y, width, height) and can be nested (e.g., 'wheel' inside 'car'). Tags are content labels without location information.",
  },
  {
    id: "vision-4",
    domain: 4,
    lab: "Vision Lab",
    question:
      "You need to analyze an image that is hosted at a public URL. Which Computer Vision SDK method should you use?",
    options: [
      "A. analyze_image_in_stream()",
      "B. analyze_image()",
      "C. describe_image()",
      "D. tag_image()",
    ],
    correctIndex: 1,
    explanation:
      "analyze_image() accepts a URL. analyze_image_in_stream() accepts binary data. The exam frequently tests knowing which method to use based on the input type.",
  },

  // ── Lab 05 - Language (Domain 5) ────────────────────────────────────
  {
    id: "lang-1",
    domain: 5,
    lab: "Language & Speech",
    question:
      "You are calling the Azure Translator REST API using a multi-service Azure AI Services key. The request returns a 401 Unauthorized error. What is the most likely cause?",
    options: [
      "A. The API key is invalid",
      "B. The Ocp-Apim-Subscription-Region header is missing",
      "C. The target language is not supported",
      "D. The request body exceeds the character limit",
    ],
    correctIndex: 1,
    explanation:
      "When using a multi-service key (rather than a Translator-specific key), the Ocp-Apim-Subscription-Region header is required. Omitting it causes 401. This is a very common exam question.",
  },
  {
    id: "lang-2",
    domain: 5,
    lab: "Language & Speech",
    question:
      "A text analytics response for sentiment analysis returns the label 'mixed'. What does this mean?",
    options: [
      "A. The API couldn't determine the sentiment",
      "B. The document contains both positive and negative sentences",
      "C. The text is in multiple languages",
      "D. The confidence scores are below the threshold",
    ],
    correctIndex: 1,
    explanation:
      "The 'mixed' label appears when a document has both positive and negative sentences. Each sentence gets its own sentiment label, and 'mixed' is the document-level summary.",
  },
  {
    id: "lang-3",
    domain: 5,
    lab: "Language & Speech",
    question:
      "You need to detect and redact personally identifiable information (PII) from customer feedback text. Which Text Analytics method should you use?",
    options: [
      "A. recognize_entities()",
      "B. recognize_pii_entities()",
      "C. analyze_sentiment()",
      "D. extract_key_phrases()",
    ],
    correctIndex: 1,
    explanation:
      "recognize_pii_entities() specifically detects PII (SSN, email, credit card, etc.) and returns redacted_text with PII replaced. General recognize_entities() detects named entities but doesn't handle PII categories.",
  },
  {
    id: "lang-4",
    domain: 5,
    lab: "Language & Speech",
    question:
      "You need to convert text to speech using the Azure Speech REST API. The SSML you send specifies <voice name='en-US-JennyNeural'>. What does the X-Microsoft-OutputFormat header control?",
    options: [
      "A. The voice used for synthesis",
      "B. The language of the output",
      "C. The audio encoding format and quality",
      "D. The speaking speed",
    ],
    correctIndex: 2,
    explanation:
      "X-Microsoft-OutputFormat controls the audio codec and quality (e.g., audio-16khz-128kbitrate-mono-mp3). The voice is set in SSML, not in the header.",
  },
  {
    id: "lang-5",
    domain: 5,
    lab: "Language & Speech",
    question:
      "You want to translate a single text into both French and Spanish in a single API call. How do you configure the Translator request?",
    options: [
      "A. Send two separate requests",
      "B. Use the to parameter twice: to=fr&to=es",
      "C. Set target='fr,es' as a comma-separated string",
      "D. Include both languages in the request body",
    ],
    correctIndex: 1,
    explanation:
      "The Translator API supports multiple target languages in one request by repeating the 'to' query parameter (to=fr&to=es). This is more efficient than separate requests.",
  },

  // ── Lab 06 - Agents (Domain 3) ──────────────────────────────────────
  {
    id: "agents-1",
    domain: 3,
    lab: "Agent Workshop",
    question:
      "You are designing an AI agent that needs to answer questions about your company's internal documents. Which grounding method should you use?",
    options: [
      "A. Fine-tuning with document data",
      "B. RAG with Azure AI Search",
      "C. System prompt with all documents pasted in",
      "D. Custom training of a new model",
    ],
    correctIndex: 1,
    explanation:
      "RAG with Azure AI Search is the standard approach for grounding agents in enterprise documents. Fine-tuning teaches style, not facts. Pasting documents in the system prompt has token limits.",
  },
  {
    id: "agents-2",
    domain: 3,
    lab: "Agent Workshop",
    question:
      "What is the difference between the system and user roles in Azure OpenAI chat messages?",
    options: [
      "A. System messages are visible to end users; user messages are not",
      "B. System messages set behavior and constraints; user messages are the conversation input",
      "C. System messages are optional; user messages are required",
      "D. System messages are processed first; user messages are processed in parallel",
    ],
    correctIndex: 1,
    explanation:
      "System messages define how the model should behave (persona, rules, constraints). User messages are the actual conversation input. System cannot be overridden by user messages.",
  },
  {
    id: "agents-3",
    domain: 3,
    lab: "Agent Workshop",
    question:
      "In Azure AI Foundry Agent Service, which built-in tool would you use to let an agent run Python code to analyze uploaded data files?",
    options: [
      "A. Function calling",
      "B. Code Interpreter",
      "C. Bing Search",
      "D. Azure AI Search",
    ],
    correctIndex: 1,
    explanation:
      "Code Interpreter is a built-in tool that lets agents execute Python code in a sandboxed environment. It can process uploaded files, create visualizations, and perform data analysis.",
  },
  {
    id: "agents-4",
    domain: 3,
    lab: "Agent Workshop",
    question:
      "A developer is using Azure OpenAI native function calling. The API returns a response with tool_calls containing function.name and function.arguments. What should the developer do next?",
    options: [
      "A. Return the function result directly to the user",
      "B. Execute the function locally, then send a new request with the function result as a tool message",
      "C. Wait for the API to execute the function automatically",
      "D. Retry the request without the tool_calls parameter",
    ],
    correctIndex: 1,
    explanation:
      "When the API returns tool_calls, the developer must: 1) Execute the function locally, 2) Send a follow-up request with the function result in a 'tool' role message. The API doesn't execute functions — it only suggests which to call.",
  },

  // ── Lab 07 - Responsible AI (Domain 1) ──────────────────────────────
  {
    id: "rai-1",
    domain: 1,
    lab: "Responsible AI",
    question:
      "Azure Content Safety analyzes text across four categories. Which of the following is NOT one of the four categories?",
    options: [
      "A. Hate",
      "B. Violence",
      "C. Misinformation",
      "D. SelfHarm",
    ],
    correctIndex: 2,
    explanation:
      "The four categories are Hate, SelfHarm, Sexual, and Violence. Misinformation is not a category. Memorize these four.",
  },
  {
    id: "rai-2",
    domain: 1,
    lab: "Responsible AI",
    question:
      "A customer support chatbot needs to block clearly harmful content but allow mildly edgy humor. What severity threshold should you configure?",
    options: [
      "A. Block severity >= 0 (block everything)",
      "B. Block severity >= 2 (block low and above)",
      "C. Block severity >= 4 (block only medium-high and high)",
      "D. Block severity >= 6 (block only the most severe)",
    ],
    correctIndex: 2,
    explanation:
      "Severity 4+ represents medium-high to high severity content. This allows mildly edgy content (severity 1-3) through while blocking clearly harmful content. The scale is 0-6.",
  },
  {
    id: "rai-3",
    domain: 1,
    lab: "Responsible AI",
    question:
      "What is the difference between Azure OpenAI content filtering and Azure Content Safety service?",
    options: [
      "A. They are the same service",
      "B. Content filtering is built into Azure OpenAI and runs automatically; Content Safety is a standalone service you call explicitly",
      "C. Content Safety only works with images; content filtering works with text",
      "D. Content filtering is free; Content Safety requires a paid tier",
    ],
    correctIndex: 1,
    explanation:
      "Azure OpenAI content filtering runs automatically on all model I/O. Azure Content Safety is a separate service you call via API for custom moderation workflows.",
  },
  {
    id: "rai-4",
    domain: 1,
    lab: "Responsible AI",
    question:
      "You need to maintain a list of specific brand names that should always be flagged in user content, regardless of severity scores. Which Content Safety feature should you use?",
    options: [
      "A. Content Safety with custom severity thresholds",
      "B. Azure OpenAI system prompt instructions",
      "C. BlocklistClient with custom blocklists",
      "D. Prompt Shields",
    ],
    correctIndex: 2,
    explanation:
      "BlocklistClient manages custom blocklists — specific words or phrases that are always flagged regardless of severity scoring. This is separate from the four content categories.",
  },
]
