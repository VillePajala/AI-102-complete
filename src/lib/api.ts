const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const DEFAULT_TIMEOUT = 30_000 // 30 seconds

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

async function request<T>(
  endpoint: string,
  options?: RequestInit & { timeout?: number }
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error")
      throw new ApiError(text, res.status)
    }

    return res.json()
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out. Check that the backend is running.", 0)
    }
    throw new ApiError(
      err instanceof Error ? err.message : "Network error. Check that the backend is running at " + API_BASE,
      0
    )
  } finally {
    clearTimeout(timeoutId)
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  postForm: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const url = `${API_BASE}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120_000) // 2 min for uploads

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => "Unknown error")
        throw new ApiError(text, res.status)
      }
      return res.json()
    } catch (err) {
      if (err instanceof ApiError) throw err
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ApiError("Upload timed out.", 0)
      }
      throw new ApiError(
        err instanceof Error ? err.message : "Network error",
        0
      )
    } finally {
      clearTimeout(timeoutId)
    }
  },

  health: async (): Promise<boolean> => {
    try {
      await request<unknown>("/health", { timeout: 5000 })
      return true
    } catch {
      return false
    }
  },
}
