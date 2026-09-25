import { NextRequest, NextResponse } from 'next/server'
import { createGroqChatStream, SYSTEM_PROMPTS } from '@/lib/groq/client'
import { generateSmartGuidance } from '@/lib/groq/knowledge'

function createFallbackStream(text: string): ReadableStream {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      try {
        const words = text.split(/(\s+)/)
        for (const word of words) {
          if (word) {
            controller.enqueue(encoder.encode(word))
            // Micro-delay for a natural streaming sensation
            await new Promise((resolve) => setTimeout(resolve, 12))
          }
        }
      } catch (e) {
        console.warn('Fallback stream error:', e)
      } finally {
        controller.close()
      }
    },
  })
}

export async function POST(request: NextRequest) {
  let language: 'en' | 'ta' = 'en'
  let latestUserMessage = 'hi'

  try {
    const body = await request.json()
    const { messages, language: reqLang = 'en' } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      language?: 'en' | 'ta'
    }

    language = reqLang

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    const lastMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (lastMsg?.content) {
      latestUserMessage = lastMsg.content
    }

    const systemPrompt = language === 'ta'
      ? `${SYSTEM_PROMPTS.citizenGuidance}\n\nIMPORTANT LANGUAGE INSTRUCTION:\nThe citizen is using the GramSeva portal in Tamil (தமிழ்). You MUST answer their questions completely in fluent, natural, and respectful Tamil (தமிழ்). Use appropriate official Tamil terminology for schemes, certificates, offices, and documents.`
      : SYSTEM_PROMPTS.citizenGuidance

    try {
      const stream = await createGroqChatStream({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 800,
        temperature: 0.6,
      })

      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content ?? ''
              if (text) controller.enqueue(encoder.encode(text))
            }
            controller.close()
          } catch (err) {
            console.warn('Error during active Groq stream:', err)
            controller.error(err)
          }
        },
      })

      return new NextResponse(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      })
    } catch (groqErr) {
      console.warn('Groq primary/fallback models failed. Activating GramSeva AI Knowledge Engine:', groqErr)
      const fallbackText = generateSmartGuidance(latestUserMessage, language)
      const readable = createFallbackStream(fallbackText)

      return new NextResponse(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      })
    }
  } catch (err: unknown) {
    console.error('Fatal route error in /api/ai/guidance:', err)
    const fallbackText = generateSmartGuidance(latestUserMessage, language)
    const readable = createFallbackStream(fallbackText)

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  }
}
