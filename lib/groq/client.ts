import Groq from 'groq-sdk'

// Singleton instance
let groqClient: Groq | null = null

export function hasValidGroqKey(): boolean {
  const key = process.env.GROQ_API_KEY
  return Boolean(key && key.trim() !== '' && key !== 'dummy_api_key_for_build')
}

export function getGroqClient(): Groq | null {
  if (!hasValidGroqKey()) {
    return null
  }
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY!.trim(),
    })
  }
  return groqClient
}

export const GROQ_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b'

export const FALLBACK_MODELS = [
  GROQ_MODEL,
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
]

/**
 * Creates a streaming chat completion with automatic model fallback for resilience.
 */
export async function createGroqChatStream(options: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  max_tokens?: number
  temperature?: number
}) {
  const groq = getGroqClient()
  if (!groq) {
    throw new Error('GROQ_API_KEY not configured')
  }

  let lastError: unknown = null

  for (const model of FALLBACK_MODELS) {
    try {
      const stream = await groq.chat.completions.create({
        model,
        messages: options.messages as any,
        stream: true,
        max_tokens: options.max_tokens ?? 750,
        temperature: options.temperature ?? 0.6,
      })
      return stream
    } catch (err) {
      lastError = err
      console.warn(`Groq stream failed with model ${model}, trying fallback...`, (err as any)?.message ?? err)
    }
  }

  throw lastError ?? new Error('All Groq models failed')
}

export const SYSTEM_PROMPTS = {
  schemeRecommendation: `You are GramSeva AI, an expert government scheme advisor for rural India and Tamil Nadu. 
Your role is to analyze a citizen's profile and recommend suitable government schemes.
Always respond in a structured, compassionate, and clear manner.
Categorize schemes as: "Highly Recommended", "Recommended", or "May Be Eligible".
Explain WHY each scheme matches the person's profile in simple, accessible language.
Focus on tangible benefits and actionable next steps.
Provide structured recommendations with key benefits and step-by-step guidance.`,

  citizenGuidance: `You are GramSeva AI, a helpful citizen services and government scheme advisor for rural India and Tamil Nadu.
You help citizens understand government schemes, required documents, eligibility criteria, and office procedures (such as Block Development Office / Panchayat / Taluk Office).
Be clear, empathetic, polite, and practical. Use simple, helpful language.
When explaining government processes, always include:
1. Required documents list (e.g. Aadhaar, Ration Card, Income Certificate)
2. Which office/portal to visit (e.g. BDO Office, e-Sevai, Panchayat Union)
3. Step-by-step application process
4. Key benefits and timelines
5. Helpful tips to avoid rejection
If asked in Tamil or English, respond respectfully in the respective language.`,
}
