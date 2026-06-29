'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { verifyIdToken, isAdminEmail } from '@/lib/firebase/admin'
import { schemeSchema } from '@/lib/validations'
import type { Scheme, SchemeFormData } from '@/types'

function requireAdminToken(email: string) {
  if (!isAdminEmail(email)) {
    throw new Error('Unauthorized: Admin access required')
  }
}

export async function createScheme(
  idToken: string,
  formData: unknown
): Promise<{ scheme: Scheme | null; error: string | null }> {
  try {
    const decoded = await verifyIdToken(idToken)
    requireAdminToken(decoded.email ?? '')

    const validated = schemeSchema.safeParse(formData)
    if (!validated.success) {
      return { scheme: null, error: validated.error.issues.map((e) => e.message).join(', ') }
    }

    const supabase = createServiceClient()

    // Get admin profile id
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('firebase_uid', decoded.uid)
      .single()

    const { eligibility_rules, eligibility_logic, ...schemeData } = validated.data

    const { data: scheme, error: schemeError } = await supabase
      .from('schemes')
      .insert({ ...schemeData, created_by: adminProfile?.id })
      .select()
      .single()

    if (schemeError) return { scheme: null, error: schemeError.message }

    // Insert eligibility rules if provided
    if (eligibility_rules && eligibility_rules.length > 0) {
      await supabase.from('scheme_eligibility_rules').insert({
        scheme_id: scheme.id,
        rules: eligibility_rules,
        logic: eligibility_logic ?? 'AND',
      })
    }

    // If publishing, create a notification for all residents
    if (scheme.status === 'published') {
      await supabase.from('notifications').insert({
        scheme_id: scheme.id,
        title: `New Scheme: ${scheme.name}`,
        message: `A new government scheme "${scheme.name}" has been published. Check if you're eligible!`,
        type: 'scheme_published',
      })
    }

    return { scheme, error: null }
  } catch (err: unknown) {
    return { scheme: null, error: err instanceof Error ? err.message : 'Failed to create scheme' }
  }
}

export async function updateScheme(
  idToken: string,
  schemeId: string,
  formData: unknown
): Promise<{ success: boolean; error: string | null }> {
  try {
    const decoded = await verifyIdToken(idToken)
    requireAdminToken(decoded.email ?? '')

    const validated = schemeSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues.map((e) => e.message).join(', ') }
    }

    const supabase = createServiceClient()
    const { eligibility_rules, eligibility_logic, ...schemeData } = validated.data

    const { data: prevScheme } = await supabase
      .from('schemes')
      .select('status')
      .eq('id', schemeId)
      .single()

    const { error } = await supabase
      .from('schemes')
      .update({ ...schemeData, updated_at: new Date().toISOString() })
      .eq('id', schemeId)

    if (error) return { success: false, error: error.message }

    // Upsert eligibility rules
    if (eligibility_rules) {
      await supabase.from('scheme_eligibility_rules').upsert(
        { scheme_id: schemeId, rules: eligibility_rules, logic: eligibility_logic ?? 'AND' },
        { onConflict: 'scheme_id' }
      )
    }

    // Create notification when newly publishing
    if (schemeData.status === 'published' && prevScheme?.status !== 'published') {
      await supabase.from('notifications').insert({
        scheme_id: schemeId,
        title: `New Scheme: ${schemeData.name}`,
        message: `A new government scheme "${schemeData.name}" has been published. Check if you're eligible!`,
        type: 'scheme_published',
      })
    }

    return { success: true, error: null }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' }
  }
}

export async function deleteScheme(
  idToken: string,
  schemeId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const decoded = await verifyIdToken(idToken)
    requireAdminToken(decoded.email ?? '')

    const supabase = createServiceClient()
    const { error } = await supabase.from('schemes').delete().eq('id', schemeId)

    if (error) return { success: false, error: error.message }
    return { success: true, error: null }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' }
  }
}
