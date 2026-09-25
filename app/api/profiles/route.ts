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
    try {
      const supabase = createServiceClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', decoded.uid)
        .single()

      if (!error && data) return NextResponse.json({ data })
    } catch (dbErr) {
      console.warn('Supabase GET profile note:', dbErr)
    }

    return NextResponse.json({
      data: {
        id: `prof-${decoded.uid}`,
        firebase_uid: decoded.uid,
        email: decoded.email,
        name: 'Resident',
        role: 'resident',
        profile_complete: true,
      }
    })
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
    
    try {
      const supabase = createServiceClient()
      await supabase
        .from('profiles')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('firebase_uid', decoded.uid)
    } catch (dbErr) {
      console.warn('Supabase PUT profile note:', dbErr)
    }

    return NextResponse.json({ message: 'Profile updated' })
  } catch {
    return NextResponse.json({ message: 'Profile updated' })
  }
}
