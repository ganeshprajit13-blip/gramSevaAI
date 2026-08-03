import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/admin'
import { paginationSchema } from '@/lib/validations'
import { isMockMode, mockDb } from '@/lib/mock-db'
import type { ApiResponse, PaginatedResponse, Scheme } from '@/types'

export async function GET(request: NextRequest): Promise<NextResponse<PaginatedResponse<Scheme> | ApiResponse<null>>> {
  try {
    const { searchParams } = new URL(request.url)
    const params = paginationSchema.safeParse(Object.fromEntries(searchParams))

    const page = params.success ? params.data.page : 1
    const limit = params.success ? params.data.limit : 12
    const search = params.success ? params.data.search : undefined
    const category = params.success ? params.data.category : undefined
    const status = params.success ? params.data.status : undefined

    // Check admin status for mock and real modes
    const authHeader = request.headers.get('authorization')
    let isAdmin = false
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = await verifyIdToken(authHeader.slice(7))
        const { isAdminEmail } = await import('@/lib/firebase/admin')
        isAdmin = isAdminEmail(decoded.email ?? '')
      } catch {
        // not authenticated as admin
      }
    }

    // ── MOCK MODE ────────────────────────────────────────────────────────────
    if (isMockMode()) {
      const resolvedStatus = isAdmin ? status : 'published'
      const { data, count } = mockDb.schemes.list({ page, limit, search, category, status: resolvedStatus })
      return NextResponse.json({
        data: data as unknown as Scheme[],
        count,
        page,
        limit,
        total_pages: Math.ceil(count / limit),
      })
    }

    // ── SUPABASE MODE ────────────────────────────────────────────────────────
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()
    let query = supabase
      .from('schemes')
      .select('*, eligibility_rules:scheme_eligibility_rules(*)', { count: 'exact' })

    if (!isAdmin) {
      query = query.eq('status', 'published')
    } else if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,eligibility_summary.ilike.%${search}%`)
    }
    if (category) query = query.eq('category', category)

    query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      data: data ?? [],
      count: count ?? 0,
      page,
      limit,
      total_pages: Math.ceil((count ?? 0) / limit),
    })
  } catch (err: unknown) {
    console.error('[GET /api/schemes]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Scheme>>> {
  try {
    const body = await request.json()

    // In mock mode, bypass strict token verification if auth header is missing or in dev
    if (isMockMode()) {
      const title = body.title || body.name || 'New Scheme'
      const newScheme = mockDb.schemes.create({
        ...body,
        name: title,
        title,
        status: body.status || 'published'
      })
      return NextResponse.json({ data: newScheme as unknown as Scheme, message: 'Scheme created successfully' }, { status: 201 })
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decoded: { email?: string }
    try {
      decoded = await verifyIdToken(authHeader.slice(7))
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const { isAdminEmail } = await import('@/lib/firebase/admin')
    if (!isAdminEmail(decoded.email ?? '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { schemeSchema } = await import('@/lib/validations')
    const validated = schemeSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues.map(i => i.message).join(', ') }, { status: 400 })
    }

    const { eligibility_rules, eligibility_logic, ...schemeData } = validated.data

    // ── SUPABASE MODE ────────────────────────────────────────────────────────
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    const { data: scheme, error } = await supabase
      .from('schemes')
      .insert(schemeData)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (eligibility_rules?.length) {
      await supabase.from('scheme_eligibility_rules').insert({
        scheme_id: scheme.id,
        rules: eligibility_rules,
        logic: eligibility_logic ?? 'AND',
      })
    }

    return NextResponse.json({ data: scheme, message: 'Scheme created successfully' }, { status: 201 })
  } catch (err: unknown) {
    console.error('[POST /api/schemes]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
