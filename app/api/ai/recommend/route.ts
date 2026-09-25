import { NextRequest, NextResponse } from 'next/server'
import { createGroqChatStream, SYSTEM_PROMPTS } from '@/lib/groq/client'
import { verifyIdToken } from '@/lib/firebase/admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let decoded: any = null
    if (authHeader?.startsWith('Bearer ')) {
      try {
        decoded = await verifyIdToken(authHeader.slice(7))
      } catch (e) {
        console.warn('Auth token verification skipped in fallback:', e)
      }
    }

    let profile: any = null
    let schemes: any[] = []

    if (decoded?.uid) {
      try {
        const supabase = createServiceClient()
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('firebase_uid', decoded.uid)
          .single()
        if (dbProfile) profile = dbProfile

        const { data: dbSchemes } = await supabase
          .from('schemes')
          .select('id, name, description, category, department, eligibility_summary, benefits')
          .eq('status', 'published')
          .limit(30)
        if (dbSchemes && dbSchemes.length > 0) schemes = dbSchemes
      } catch (e) {
        console.warn('Supabase service fallback:', e)
      }
    }

    if (!profile) {
      profile = {
        name: 'Sakthi Vadivel',
        age: 38,
        gender: 'Male',
        community: 'OBC',
        occupation: 'Farmer',
        annual_income: 180000,
        education: 'Higher Secondary',
        farmer_status: true,
        land_ownership: true,
        disability: false,
        marital_status: 'Married',
        district: 'Coimbatore',
        village: 'Kinathukadavu'
      }
    }

    if (!schemes || schemes.length === 0) {
      schemes = [
        {
          name: 'PM Kisan Samman Nidhi Scheme',
          category: 'Agriculture',
          department: 'Agriculture and Farmers Welfare',
          description: 'Direct income support of ₹6,000 per year in 3 installments for landholding farmer families.',
          eligibility_summary: 'Small and marginal farmers holding agricultural land.'
        },
        {
          name: 'Kalaignar Magalir Urimai Thittam',
          category: 'Women Empowerment',
          department: 'Social Welfare and Women Empowerment',
          description: 'Monthly ₹1,000 direct benefit transfer for eligible women family heads.',
          eligibility_summary: 'Women aged 21-65 with family income below ₹2.5L.'
        },
        {
          name: 'Moovalur Ramamirtham Ammaiyar Higher Education Scheme (Pudhumai Penn)',
          category: 'Student Scholarship',
          department: 'Higher Education',
          description: '₹1,000 monthly allowance for girl students who studied in government schools (Class 6-12) pursuing higher education.',
          eligibility_summary: 'Female students from government schools in college degree/diploma courses.'
        },
        {
          name: 'Pradhan Mantri Awas Yojana (Gramin)',
          category: 'Housing',
          department: 'Rural Development',
          description: 'Financial assistance for construction of pucca house with basic amenities for rural houseless families.',
          eligibility_summary: 'BPL / Low income rural households without permanent housing.'
        },
        {
          name: 'Chief Minister Comprehensive Health Insurance Scheme (CMCHIS)',
          category: 'Health',
          department: 'Health and Family Welfare',
          description: 'Cashless hospitalisation coverage up to ₹5,00,000 per family per year.',
          eligibility_summary: 'Resident families of Tamil Nadu with annual income below ₹1,20,000.'
        }
      ]
    }

    const profileSummary = `
Resident Profile:
- Name: ${profile.name}
- Age: ${profile.age} years
- Gender: ${profile.gender}
- Community: ${profile.community ?? 'General/OBC'}
- Occupation: ${profile.occupation}
- Annual Income: ₹${profile.annual_income?.toLocaleString('en-IN') ?? '1,80,000'}
- Education: ${profile.education ?? 'Secondary'}
- Farmer: ${profile.farmer_status ? 'Yes' : 'No'}
- Land Owner: ${profile.land_ownership ? 'Yes' : 'No'}
- Has Disability: ${profile.disability ? 'Yes' : 'No'}
- Marital Status: ${profile.marital_status ?? 'Married'}
- District: ${profile.district ?? 'Coimbatore'}, ${profile.village ?? 'Kinathukadavu'}
    `.trim()

    let language = 'en'
    try {
      const body = await request.json()
      if (body?.language) language = body.language
    } catch {
      // Body may be empty on simple POST
    }

    const schemesList = schemes
      .map((s: any) => `- ${s.name} (${s.category}): ${s.eligibility_summary ?? s.description ?? ''}`)
      .join('\n')

    const userMessage = language === 'ta'
      ? `
குடிமகன் சுயவிவரம் (Resident Profile):
${profileSummary}

கிடைக்கக்கூடிய அரசு நலத்திட்டங்கள் (Available Government Schemes):
${schemesList}

தயவுசெய்து இந்த குடிமகனின் சுயவிவரத்தை ஆய்வு செய்து, அவர்களுக்கு மிகவும் பொருத்தமான அரசு நலத்திட்டங்களைப் பரிந்துரைக்கவும்.
அனைத்து விளக்கங்களையும், தகுதி காரணங்களையும், பெறக்கூடிய நன்மைகளையும் தமிழில் (தமிழ்) விரிவாகவும் தெளிவாகவும் வழங்கவும்.
`
      : `
${profileSummary}

Available Government Schemes:
${schemesList}

Please analyze this resident's profile and recommend the most suitable schemes. 
Be specific about why each scheme fits their profile and what benefits they will receive.
`

    const systemPrompt = language === 'ta'
      ? `${SYSTEM_PROMPTS.schemeRecommendation}\n\nIMPORTANT LANGUAGE INSTRUCTION:\nThe citizen is using the portal in Tamil (தமிழ்). You MUST provide all evaluation, categorization ("முழுத் தகுதி", "பரிந்துரைக்கப்படுகிறது", "விண்ணப்பிக்கலாம்"), and step-by-step guidance in fluent and respectful Tamil (தமிழ்).`
      : SYSTEM_PROMPTS.schemeRecommendation

    const stream = await createGroqChatStream({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 750,
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
