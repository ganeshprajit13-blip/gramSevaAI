import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyIdToken } from '@/lib/firebase/admin'
import { checkEligibility } from '@/utils'
import type { ApiResponse, EligibilityResult, Profile } from '@/types'

type Params = { params: Promise<{ schemeId: string }> }

export async function POST(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<EligibilityResult>>> {
  try {
    const { schemeId } = await params

    // Optional: verify resident token
    const authHeader = request.headers.get('authorization')
    let profileFromToken: Partial<Profile> | null = null

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = await verifyIdToken(authHeader.slice(7))
        const supabase = createServiceClient()
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('firebase_uid', decoded.uid)
          .single()
        profileFromToken = data
      } catch {
        // continue without profile
      }
    }

    // Body can override/supplement profile
    const body = await request.json().catch(() => ({}))
    const profile: Partial<Profile> = { ...profileFromToken, ...body }

    // Fetch eligibility rules for this scheme
    const supabase = createServiceClient()
    const { data: ruleSet, error } = await supabase
      .from('scheme_eligibility_rules')
      .select('*')
      .eq('scheme_id', schemeId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rules = ruleSet?.rules ?? []
    const logic = ruleSet?.logic ?? 'AND'

    const result = checkEligibility(profile, rules, logic)
    return NextResponse.json({ data: result })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
