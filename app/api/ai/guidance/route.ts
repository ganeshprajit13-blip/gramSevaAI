import { NextRequest, NextResponse } from 'next/server'
import { createGroqChatStream, SYSTEM_PROMPTS } from '@/lib/groq/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, language = 'en' } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      language?: 'en' | 'ta'
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    const systemPrompt = language === 'ta'
      ? `${SYSTEM_PROMPTS.citizenGuidance}\n\nIMPORTANT LANGUAGE INSTRUCTION:\nThe citizen is using the GramSeva portal in Tamil (தமிழ்). You MUST answer their questions completely in fluent, natural, and respectful Tamil (தமிழ்). Use appropriate official Tamil terminology for schemes, certificates, offices, and documents.`
      : SYSTEM_PROMPTS.citizenGuidance

    const stream = await createGroqChatStream({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 750,
      temperature: 0.5,
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
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI service error' },
      { status: 500 }
    )
  }
}
