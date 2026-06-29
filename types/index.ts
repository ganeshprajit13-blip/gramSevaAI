// =============================================================
// GramSeva AI – Centralized TypeScript Type Definitions
// =============================================================

export type UserRole = 'resident' | 'admin'

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say'
export type Community = 'General' | 'OBC' | 'SC' | 'ST' | 'Other'
export type EducationLevel =
  | 'No Formal Education'
  | 'Primary'
  | 'Secondary'
  | 'Higher Secondary'
  | 'Diploma'
  | 'Graduate'
  | 'Post Graduate'
  | 'Doctorate'
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed'
export type SchemeCategory =
  | 'Agriculture'
  | 'Education'
  | 'Health'
  | 'Housing'
  | 'Employment'
  | 'Women'
  | 'Senior Citizen'
  | 'Disability'
  | 'Business'
  | 'Student'
  | 'Other'
export type SchemeStatus = 'draft' | 'published' | 'archived'
export type ApplicationMode = 'Online' | 'Offline' | 'Both'
export type NotificationType = 'scheme_published' | 'announcement' | 'reminder'

// -------------------------------------------------------------
// Profile / User
// -------------------------------------------------------------
export interface Profile {
  id: string
  firebase_uid: string
  email: string
  name?: string
  age?: number
  gender?: Gender
  village?: string
  district?: string
  occupation?: string
  annual_income?: number
  community?: Community
  disability?: boolean
  farmer_status?: boolean
  land_ownership?: boolean
  education?: EducationLevel
  marital_status?: MaritalStatus
  role: UserRole
  profile_complete: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type ProfileFormData = Omit<Profile, 'id' | 'firebase_uid' | 'email' | 'role' | 'profile_complete' | 'avatar_url' | 'created_at' | 'updated_at'>

// -------------------------------------------------------------
// Eligibility Rules
// -------------------------------------------------------------
export type EligibilityOperator = '>=' | '<=' | '=' | '!=' | '>' | '<' | 'in' | 'not_in'

export interface EligibilityRule {
  field: keyof Profile | string
  operator: EligibilityOperator
  value: string | number | boolean | string[]
  label: string
}

export interface EligibilityRuleSet {
  id: string
  scheme_id: string
  rules: EligibilityRule[]
  logic: 'AND' | 'OR'
  created_at: string
  updated_at: string
}

export interface EligibilityResult {
  eligible: boolean
  results: {
    rule: EligibilityRule
    passed: boolean
    explanation: string
  }[]
  summary: string
}

// -------------------------------------------------------------
// Schemes
// -------------------------------------------------------------
export interface Scheme {
  id: string
  name: string
  description?: string
  benefits?: string[]
  department: string
  category: SchemeCategory
  image_url?: string
  application_deadline?: string
  required_documents?: string[]
  application_mode?: ApplicationMode
  official_url?: string
  office_name?: string
  office_address?: string
  office_phone?: string
  office_hours?: string
  eligibility_summary?: string
  status: SchemeStatus
  created_by?: string
  created_at: string
  updated_at: string
  eligibility_rules?: EligibilityRuleSet
}

export type SchemeFormData = Omit<Scheme, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'eligibility_rules'>

// -------------------------------------------------------------
// Notifications
// -------------------------------------------------------------
export interface Notification {
  id: string
  scheme_id?: string
  title: string
  message: string
  type: NotificationType
  created_at: string
  scheme?: Pick<Scheme, 'id' | 'name' | 'category'>
  is_read?: boolean
}

// -------------------------------------------------------------
// AI Module Types
// -------------------------------------------------------------
export type EligibilityCategory = 'Highly Recommended' | 'Recommended' | 'May Be Eligible' | 'Not Eligible'

export interface SchemeRecommendation {
  scheme: Scheme
  category: EligibilityCategory
  reason: string
  matchScore: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// -------------------------------------------------------------
// Google Maps / Nearby Offices
// -------------------------------------------------------------
export interface GovernmentOffice {
  id: string
  name: string
  type: 'Union Office' | 'VAO Office' | 'Taluk Office' | 'Collector Office' | 'E-Sevai Center' | 'CSC Center' | 'Government Hospital' | 'Police Station'
  address: string
  phone?: string
  working_hours?: string
  lat: number
  lng: number
  distance?: number
}

// -------------------------------------------------------------
// API Response Wrappers
// -------------------------------------------------------------
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// -------------------------------------------------------------
// Admin Dashboard Analytics
// -------------------------------------------------------------
export interface DashboardStats {
  total_schemes: number
  published_schemes: number
  draft_schemes: number
  total_residents: number
  total_notifications: number
  recent_schemes: Scheme[]
  schemes_by_category: { category: string; count: number }[]
}
