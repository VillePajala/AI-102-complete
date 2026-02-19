const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

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
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    ...options,
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
    const res = await fetch(url, { method: "POST", body: formData })
    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error")
      throw new ApiError(text, res.status)
    }
    return res.json()
  },

  health: async (): Promise<boolean> => {
    try {
      await request<unknown>("/health")
      return true
    } catch {
      return false
    }
  },
}
