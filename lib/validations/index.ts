import { z } from 'zod'

// -------------------------------------------------------------
// Profile Schema
// -------------------------------------------------------------
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  age: z.coerce.number().min(0).max(120),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  village: z.string().min(1, 'Village is required').max(100),
  district: z.string().min(1, 'District is required').max(100),
  occupation: z.string().min(1, 'Occupation is required').max(100),
  annual_income: z.coerce.number().min(0, 'Income cannot be negative'),
  community: z.enum(['General', 'OBC', 'SC', 'ST', 'Other']),
  disability: z.boolean(),
  farmer_status: z.boolean(),
  land_ownership: z.boolean(),
  education: z.enum([
    'No Formal Education', 'Primary', 'Secondary', 'Higher Secondary',
    'Diploma', 'Graduate', 'Post Graduate', 'Doctorate',
  ]),
  marital_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

// -------------------------------------------------------------
// Scheme Schema (Admin)
// -------------------------------------------------------------
export const eligibilityRuleSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['>=', '<=', '=', '!=', '>', '<', 'in', 'not_in']),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  label: z.string().min(1),
})

export const schemeSchema = z.object({
  name: z.string().min(2, 'Name is required').max(200),
  description: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  department: z.string().min(1, 'Department is required'),
  category: z.enum([
    'Agriculture', 'Education', 'Health', 'Housing', 'Employment',
    'Women', 'Senior Citizen', 'Disability', 'Business', 'Student', 'Other',
  ]),
  image_url: z.string().url().optional().or(z.literal('')),
  application_deadline: z.string().optional(),
  required_documents: z.array(z.string()).optional(),
  application_mode: z.enum(['Online', 'Offline', 'Both']).optional(),
  official_url: z.string().url().optional().or(z.literal('')),
  office_name: z.string().optional(),
  office_address: z.string().optional(),
  office_phone: z.string().optional(),
  office_hours: z.string().optional(),
  eligibility_summary: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  eligibility_rules: z.array(eligibilityRuleSchema).optional(),
  eligibility_logic: z.enum(['AND', 'OR']).default('AND'),
})

export type SchemeFormValues = z.infer<typeof schemeSchema>

// -------------------------------------------------------------
// AI Chat Schema
// -------------------------------------------------------------
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
})

// -------------------------------------------------------------
// API Param Schemas
// -------------------------------------------------------------
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  department: z.string().optional(),
})
