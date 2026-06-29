import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { EligibilityRule, EligibilityResult, Profile } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'No deadline'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(dateStr)
}

export function profileCompletionPercent(profile: Partial<Profile>): number {
  const requiredFields: (keyof Profile)[] = [
    'name', 'age', 'gender', 'village', 'district',
    'occupation', 'annual_income', 'community', 'education', 'marital_status',
  ]
  const filled = requiredFields.filter((f) => profile[f] !== undefined && profile[f] !== null && profile[f] !== '').length
  return Math.round((filled / requiredFields.length) * 100)
}

/**
 * Check eligibility for a scheme given the resident's profile and rule set.
 */
export function checkEligibility(
  profile: Partial<Profile>,
  rules: EligibilityRule[],
  logic: 'AND' | 'OR' = 'AND'
): EligibilityResult {
  if (!rules || rules.length === 0) {
    return {
      eligible: true,
      results: [],
      summary: 'No specific eligibility criteria — open to all.',
    }
  }

  const results = rules.map((rule) => {
    const profileValue = (profile as Record<string, unknown>)[rule.field]
    let passed = false
    let explanation = ''

    switch (rule.operator) {
      case '>=':
        passed = Number(profileValue) >= Number(rule.value)
        explanation = passed
          ? `Your ${rule.field} (${profileValue}) meets the requirement (${rule.operator} ${rule.value})`
          : `Your ${rule.field} (${profileValue ?? 'not provided'}) does not meet the requirement (${rule.operator} ${rule.value})`
        break
      case '<=':
        passed = Number(profileValue) <= Number(rule.value)
        explanation = passed
          ? `Your ${rule.field} (${profileValue}) is within the allowed limit (${rule.operator} ${rule.value})`
          : `Your ${rule.field} (${profileValue ?? 'not provided'}) exceeds the limit (${rule.operator} ${rule.value})`
        break
      case '>':
        passed = Number(profileValue) > Number(rule.value)
        explanation = passed ? `Condition met` : `Condition not met`
        break
      case '<':
        passed = Number(profileValue) < Number(rule.value)
        explanation = passed ? `Condition met` : `Condition not met`
        break
      case '=':
        passed = String(profileValue).toLowerCase() === String(rule.value).toLowerCase() ||
          profileValue === rule.value
        explanation = passed
          ? `Your ${rule.field} matches the requirement (${rule.value})`
          : `Your ${rule.field} (${profileValue ?? 'not provided'}) does not match required value (${rule.value})`
        break
      case '!=':
        passed = profileValue !== rule.value
        explanation = passed ? `Condition met` : `Condition not met`
        break
      case 'in':
        if (Array.isArray(rule.value)) {
          passed = rule.value.map((v) => String(v).toLowerCase()).includes(String(profileValue).toLowerCase())
          explanation = passed
            ? `Your ${rule.field} (${profileValue}) is in the eligible group`
            : `Your ${rule.field} (${profileValue ?? 'not provided'}) is not in the eligible group (${(rule.value as string[]).join(', ')})`
        }
        break
      case 'not_in':
        if (Array.isArray(rule.value)) {
          passed = !rule.value.map((v) => String(v).toLowerCase()).includes(String(profileValue).toLowerCase())
          explanation = passed ? `Condition met` : `Condition not met`
        }
        break
    }

    return { rule, passed, explanation }
  })

  const eligible =
    logic === 'AND'
      ? results.every((r) => r.passed)
      : results.some((r) => r.passed)

  const passedCount = results.filter((r) => r.passed).length
  const summary = eligible
    ? `You meet all ${logic === 'AND' ? 'required' : 'necessary'} eligibility criteria (${passedCount}/${results.length} conditions passed).`
    : `You do not meet ${logic === 'AND' ? 'all required' : 'any'} eligibility criteria (${passedCount}/${results.length} conditions passed).`

  return { eligible, results, summary }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Agriculture: 'bg-green-500/20 text-green-400 border-green-500/30',
    Education: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Health: 'bg-red-500/20 text-red-400 border-red-500/30',
    Housing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Employment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Women: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Senior Citizen': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Disability: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Business: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    Student: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    Other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }
  return colors[category] ?? colors.Other
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }
  return colors[status] ?? colors.draft
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 3) + '...' : str
}

export function isDeadlinePassed(deadline?: string): boolean {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

export function daysUntilDeadline(deadline?: string): number | null {
  if (!deadline) return null
  const diff = new Date(deadline).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
