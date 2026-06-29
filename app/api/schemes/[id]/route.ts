import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/admin'
import { isMockMode, mockDb } from '@/lib/mock-db'
import type { ApiResponse, Scheme } from '@/types'

type Params = { params: Promise<{ id: string }> }

export async function GET(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<Scheme>>> {
  try {
    const { id } = await params

    // ── MOCK MODE ────────────────────────────────────────────────────────────
    if (isMockMode()) {
      const scheme = mockDb.schemes.get(id)
      if (!scheme) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 })
      return NextResponse.json({ data: scheme as unknown as Scheme })
    }

    // ── SUPABASE MODE ────────────────────────────────────────────────────────
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('schemes')
      .select('*, eligibility_rules:scheme_eligibility_rules(*)')
      .eq('id', id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<Scheme>>> {
  try {
    const { id } = await params
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

    const body = await request.json()
    const { eligibility_rules, eligibility_logic, ...schemeData } = body

    // ── MOCK MODE ────────────────────────────────────────────────────────────
    if (isMockMode()) {
      const prev = mockDb.schemes.get(id)
      const updated = mockDb.schemes.update(id, {
        ...schemeData,
        eligibility_rules: eligibility_rules
          ? [{ rules: eligibility_rules, logic: eligibility_logic ?? 'AND' }]
          : prev?.eligibility_rules,
      })
      if (!updated) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 })

      // Create notification when publishing
      if (schemeData.status === 'published' && prev?.status !== 'published') {
        mockDb.notifications.create({
          scheme_id: id,
          title: `New Scheme: ${updated.name}`,
          message: `"${updated.name}" has been published. Check if you're eligible!`,
          type: 'scheme_published',
        })
      }
      return NextResponse.json({ data: updated as unknown as Scheme, message: 'Scheme updated' })
    }

    // ── SUPABASE MODE ────────────────────────────────────────────────────────
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    const { data: prev } = await supabase.from('schemes').select('status').eq('id', id).single()

    const { data, error } = await supabase
      .from('schemes')
      .update({ ...schemeData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (eligibility_rules) {
      await supabase.from('scheme_eligibility_rules').upsert(
        { scheme_id: id, rules: eligibility_rules, logic: eligibility_logic ?? 'AND' },
        { onConflict: 'scheme_id' }
      )
    }

    if (schemeData.status === 'published' && prev?.status !== 'published') {
      await supabase.from('notifications').insert({
        scheme_id: id,
        title: `New Scheme: ${data.name}`,
        message: `"${data.name}" has been published. Check if you're eligible!`,
        type: 'scheme_published',
      })
    }

    return NextResponse.json({ data, message: 'Scheme updated' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await params
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

    // ── MOCK MODE ────────────────────────────────────────────────────────────
    if (isMockMode()) {
      const ok = mockDb.schemes.delete(id)
      if (!ok) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 })
      return NextResponse.json({ message: 'Scheme deleted' })
    }

    // ── SUPABASE MODE ────────────────────────────────────────────────────────
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()
    const { error } = await supabase.from('schemes').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: 'Scheme deleted' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
