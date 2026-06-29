import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/admin'
import { isMockMode, mockDb } from '@/lib/mock-db'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await verifyIdToken(authHeader.slice(7))

    // ── MOCK MODE ────────────────────────────────────────────────────────────
    if (isMockMode()) {
      const notifications = mockDb.notifications.list()
      const enriched = notifications.map((n: Record<string, unknown>) => ({ ...n, is_read: false }))
      return NextResponse.json({ data: enriched, unread_count: enriched.length })
    }

    // ── SUPABASE MODE ────────────────────────────────────────────────────────
    const decoded = await verifyIdToken(authHeader.slice(7))
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('firebase_uid', decoded.uid)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`*, scheme:schemes(id, name, category)`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: reads } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('profile_id', profile.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const readIds = new Set(reads?.map((r: any) => r.notification_id) ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enriched = (notifications ?? []).map((n: any) => ({ ...n, is_read: readIds.has(n.id) }))
    const unreadCount = enriched.filter((n) => !n.is_read).length

    return NextResponse.json({ data: enriched, unread_count: unreadCount })
  } catch (err: unknown) {
    console.error('[GET /api/notifications]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await verifyIdToken(authHeader.slice(7))

    // ── MOCK MODE ── just return success, reads not tracked in mock
    if (isMockMode()) {
      return NextResponse.json({ message: 'Marked as read' })
    }

    // ── SUPABASE MODE ────────────────────────────────────────────────────────
    const decoded = await verifyIdToken(authHeader.slice(7))
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('firebase_uid', decoded.uid)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { notification_ids } = await request.json()
    if (!Array.isArray(notification_ids)) {
      return NextResponse.json({ error: 'notification_ids array required' }, { status: 400 })
    }

    const inserts = notification_ids.map((nid: string) => ({
      notification_id: nid,
      profile_id: profile.id,
    }))

    await supabase.from('notification_reads').upsert(inserts, { onConflict: 'notification_id,profile_id' })
    return NextResponse.json({ message: 'Marked as read' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
