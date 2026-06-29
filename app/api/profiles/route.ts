import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyIdToken } from '@/lib/firebase/admin'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyIdToken(authHeader.slice(7))
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('firebase_uid', decoded.uid)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyIdToken(authHeader.slice(7))
    const body = await request.json()
    const supabase = createServiceClient()

    const { error } = await supabase
      .from('profiles')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('firebase_uid', decoded.uid)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: 'Profile updated' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
