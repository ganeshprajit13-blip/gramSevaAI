import { NextRequest, NextResponse } from 'next/server'
import { getGroqClient, GROQ_MODEL, SYSTEM_PROMPTS } from '@/lib/groq/client'
import { verifyIdToken } from '@/lib/firebase/admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyIdToken(authHeader.slice(7))
    const supabase = createServiceClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('firebase_uid', decoded.uid)
      .single()

    // Fetch published schemes
    const { data: schemes } = await supabase
      .from('schemes')
      .select('id, name, description, category, department, eligibility_summary, benefits')
      .eq('status', 'published')
      .limit(30)

    const profileSummary = profile
      ? `
Resident Profile:
- Name: ${profile.name}
- Age: ${profile.age} years
- Gender: ${profile.gender}
- Community: ${profile.community}
- Occupation: ${profile.occupation}
- Annual Income: ₹${profile.annual_income?.toLocaleString('en-IN') ?? 'Unknown'}
- Education: ${profile.education}
- Farmer: ${profile.farmer_status ? 'Yes' : 'No'}
- Land Owner: ${profile.land_ownership ? 'Yes' : 'No'}
- Has Disability: ${profile.disability ? 'Yes' : 'No'}
- Marital Status: ${profile.marital_status}
- District: ${profile.district}, ${profile.village}
      `.trim()
      : 'Profile not available'

    const schemesList = schemes
      ?.map((s: any) => `- ${s.name} (${s.category}): ${s.eligibility_summary ?? s.description ?? ''}`)
      .join('\n') ?? 'No schemes available'

    const userMessage = `
${profileSummary}

Available Government Schemes:
${schemesList}

Please analyze this resident's profile and recommend the most suitable schemes. 
Be specific about why each scheme fits their profile.
`

    const groq = getGroqClient()
    const stream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.schemeRecommendation },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
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
