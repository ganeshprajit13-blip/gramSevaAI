'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { verifyIdToken, isAdminEmail } from '@/lib/firebase/admin'
import { profileSchema } from '@/lib/validations'
import type { Profile, ProfileFormData } from '@/types'

/**
 * Upsert a user profile after Google sign-in.
 * Called from the client after Firebase auth succeeds.
 */
export async function upsertProfile(
  idToken: string,
  data: Partial<ProfileFormData>
): Promise<{ profile: Profile | null; error: string | null }> {
  try {
    const decoded = await verifyIdToken(idToken)

    // Bypass Supabase for mock tokens
    if (idToken.startsWith('mock-token-')) {
      const role = idToken.replace('mock-token-', '') as 'admin' | 'resident'
      const mockProfile: Profile = {
        id: `mock-${role}-id`,
        firebase_uid: decoded.uid,
        email: decoded.email ?? '',
        name: data.name ?? (role === 'admin' ? 'BDO Admin' : 'Demo Resident'),
        avatar_url: (data as any).avatar_url ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role,
        profile_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return { profile: mockProfile, error: null }
    }

    const supabase = createServiceClient()
    const role = isAdminEmail(decoded.email ?? '') ? 'admin' : 'resident'

    const profileData = {
      firebase_uid: decoded.uid,
      email: decoded.email ?? '',
      avatar_url: decoded.picture ?? null,
      role,
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'firebase_uid', ignoreDuplicates: false })
      .select()
      .single()

    if (error) return { profile: null, error: error.message }
    return { profile, error: null }
  } catch (err: unknown) {
    return { profile: null, error: err instanceof Error ? err.message : 'Authentication failed' }
  }
}

/**
 * Complete the resident profile (onboarding step).
 */
export async function completeProfile(
  idToken: string,
  formData: unknown
): Promise<{ success: boolean; error: string | null }> {
  try {
    const validated = profileSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues.map((e) => e.message).join(', ') }
    }

    const decoded = await verifyIdToken(idToken)

    if (idToken.startsWith('mock-token-')) {
      return { success: true, error: null }
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('profiles')
      .update({ ...validated.data, profile_complete: true, updated_at: new Date().toISOString() })
      .eq('firebase_uid', decoded.uid)

    if (error) return { success: false, error: error.message }
    return { success: true, error: null }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' }
  }
}

/**
 * Get profile by Firebase UID.
 */
export async function getProfileByUid(uid: string): Promise<Profile | null> {
  if (uid.startsWith('mock-')) {
    const role = uid.replace('mock-', '').replace('-uid', '') as 'admin' | 'resident'
    return {
      id: `mock-${role}-id`,
      firebase_uid: uid,
      email: role === 'admin' ? 'bdo-admin@gramseva.gov.in' : 'demo-resident@gmail.com',
      name: role === 'admin' ? 'BDO Admin' : 'Demo Resident',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role,
      profile_complete: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('firebase_uid', uid)
    .single()
  return data
}
