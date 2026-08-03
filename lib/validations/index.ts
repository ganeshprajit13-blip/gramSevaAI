import { z } from 'zod'

// -------------------------------------------------------------
// Centralized 7-Step Profile Validation Schema
// -------------------------------------------------------------
export const profileSchema = z.object({
  // Step 1: Personal Info
  name: z.string().min(2, 'Full Name must be at least 2 characters').max(100),
  dob: z.string().min(1, 'Date of Birth is required'),
  age: z.coerce.number().min(0, 'Age must be positive').max(120),
  gender: z.enum(['Male', 'Female', 'Transgender', 'Other', 'Prefer not to say']),
  mobile: z.string().min(10, 'Valid 10-digit mobile number required').max(15),
  mobile_verified: z.boolean().default(true),
  aadhaar: z.string().min(12, 'Aadhaar must be 12 digits').max(16),
  family_id: z.string().min(4, 'Family ID / Ration Card Number required'),
  marital_status: z.enum(['Single', 'Married', 'Widowed', 'Divorced', 'Separated']),
  photo_url: z.string().optional(),
  village: z.string().min(1, 'Village selection is required'),
  ward_number: z.string().min(1, 'Ward number is required'),
  house_number: z.string().optional(),
  pincode: z.string().optional(),

  // Step 2: Education
  education: z.enum([
    'No Formal Education', 'Primary', 'Middle', 'High School',
    'Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctorate'
  ]),
  school_college: z.string().optional(),
  currently_studying: z.boolean().default(false),
  student_id: z.string().optional(),

  // Step 3: Employment
  occupation: z.enum([
    'Student', 'Homemaker', 'Farmer', 'Agricultural Labourer',
    'Government Employee', 'Private Employee', 'Self Employed', 'Business Owner',
    'Daily Wage Worker', 'Construction Worker', 'Teacher', 'Healthcare Worker',
    'Retired', 'Unemployed'
  ]),
  monthly_income: z.coerce.number().min(0).default(0),
  annual_income_range: z.enum([
    'Below ₹1,00,000', '₹1,00,000 – ₹2,50,000', '₹2,50,000 – ₹5,00,000',
    '₹5,00,000 – ₹10,00,000', 'Above ₹10,00,000'
  ]),
  annual_income: z.coerce.number().min(0).default(50000),
  employer_name: z.string().optional(),

  // Step 4: Land Details
  own_land: z.boolean().default(false),
  land_type: z.enum(['Agricultural', 'Residential', 'Commercial', 'Mixed']).optional().or(z.literal('')),
  land_area_acres: z.coerce.number().min(0).optional(),
  crop_type: z.string().optional(),
  livestock: z.string().optional(),

  // Step 5: Family Details
  family_members_count: z.coerce.number().min(1, 'At least 1 family member required').default(1),
  children_count: z.coerce.number().min(0).default(0),
  women_count: z.coerce.number().min(0).default(0),
  senior_citizens_count: z.coerce.number().min(0).default(0),
  has_widow: z.boolean().default(false),
  has_disabled: z.boolean().default(false),
  disability_type: z.string().optional(),
  has_pregnant: z.boolean().default(false),
  has_lactating: z.boolean().default(false),
  has_girl_child: z.boolean().default(false),

  // Step 6: Women Empowerment
  shg_member: z.boolean().default(false),
  shg_name: z.string().optional(),
  entrepreneur: z.boolean().default(false),
  business_vertical: z.string().optional(),
  interested_skill_training: z.boolean().default(false),
  interested_govt_loans: z.boolean().default(false),
  has_bank_account: z.boolean().default(true),
  has_jandhan_account: z.boolean().default(false),
  digital_literate: z.boolean().default(false),
  has_smartphone: z.boolean().default(true),
  has_internet: z.boolean().default(true),
  previous_scheme_benefits: z.array(z.string()).default([]),
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

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
})

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  department: z.string().optional(),
})
