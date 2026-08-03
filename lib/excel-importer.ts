// lib/excel-importer.ts
// Excel/CSV Bulk Demographic Data Importer for GramSeva BDO Portal
// Parses uploaded files, validates columns, deduplicates, and upserts into resident-store

import * as XLSX from 'xlsx'
import { getStoredResidents, saveStoredResidents, type ResidentRecord } from './resident-store'

export interface ImportResult {
  fileName: string
  totalRowsRead: number
  imported: number
  updated: number
  duplicatesSkipped: number
  errors: number
  errorDetails: string[]
  status: 'success' | 'partial' | 'failed'
}

export interface ColumnSchemaInfo {
  header: string
  key: string
  required: 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL'
  type: string
  description: string
  sample: string
}

export const SCHEMA_INFO: ColumnSchemaInfo[] = [
  { header: 'id', key: 'id', required: 'RECOMMENDED', type: 'Text / Code', description: 'Unique Resident ID (e.g. RES-101). Existing IDs get updated.', sample: 'RES-101' },
  { header: 'name', key: 'name', required: 'REQUIRED', type: 'Text', description: 'Full legal name of the resident.', sample: 'Meena Devi' },
  { header: 'gender', key: 'gender', required: 'REQUIRED', type: 'Text (Enum)', description: 'Male / Female / Transgender', sample: 'Female' },
  { header: 'village', key: 'village', required: 'REQUIRED', type: 'Text', description: 'Village name (e.g. Kumarpuram, Sakthinagar).', sample: 'Kumarpuram' },
  { header: 'dob', key: 'dob', required: 'RECOMMENDED', type: 'Date (YYYY-MM-DD)', description: 'Date of Birth. Age is calculated automatically.', sample: '1989-04-12' },
  { header: 'age', key: 'age', required: 'OPTIONAL', type: 'Number', description: 'Age in years (used if DoB is blank).', sample: '37' },
  { header: 'mobile', key: 'mobile', required: 'RECOMMENDED', type: 'Text / Number', description: '10-digit mobile phone number.', sample: '9432109876' },
  { header: 'aadhaar', key: 'aadhaar', required: 'RECOMMENDED', type: 'Text (Masked)', description: '12-digit Aadhaar Card number (used for deduplication).', sample: 'XXXX-XXXX-9081' },
  { header: 'family_id', key: 'family_id', required: 'RECOMMENDED', type: 'Text', description: 'Ration Card number or Smart Card Family ID.', sample: 'RAT-309182' },
  { header: 'marital_status', key: 'marital_status', required: 'RECOMMENDED', type: 'Text (Enum)', description: 'Single / Married / Widowed / Divorced', sample: 'Married' },
  { header: 'ward_number', key: 'ward_number', required: 'RECOMMENDED', type: 'Number / Text', description: 'Ward number within the village (1, 2, 3, 4...).', sample: '1' },
  { header: 'house_number', key: 'house_number', required: 'OPTIONAL', type: 'Text', description: 'House / Door number.', sample: '12/4' },
  { header: 'pincode', key: 'pincode', required: 'OPTIONAL', type: 'Number', description: '6-digit postal pincode.', sample: '625001' },
  { header: 'education', key: 'education', required: 'RECOMMENDED', type: 'Text (Enum)', description: 'No Formal Education / Primary / Middle / High School / Higher Secondary / Diploma / Undergraduate / Postgraduate', sample: 'High School' },
  { header: 'occupation', key: 'occupation', required: 'RECOMMENDED', type: 'Text (Enum)', description: 'Farmer / Homemaker / Daily Wage Worker / Student / Private Employee / Business Owner / Teacher / Retired / Unemployed', sample: 'Homemaker' },
  { header: 'monthly_income', key: 'monthly_income', required: 'RECOMMENDED', type: 'Number (₹)', description: 'Monthly income in Rupees.', sample: '8000' },
  { header: 'annual_income', key: 'annual_income', required: 'RECOMMENDED', type: 'Number (₹)', description: 'Annual family income in Rupees.', sample: '96000' },
  { header: 'own_land', key: 'own_land', required: 'OPTIONAL', type: 'Boolean (Yes/No)', description: 'Does the household own agricultural / residential land?', sample: 'Yes' },
  { header: 'land_area_acres', key: 'land_area_acres', required: 'OPTIONAL', type: 'Number', description: 'Total land holding in acres.', sample: '1.5' },
  { header: 'crop_type', key: 'crop_type', required: 'OPTIONAL', type: 'Text (Enum)', description: 'Paddy / Banana / Sugarcane / Vegetables / Millets / Coconut / Cotton', sample: 'Paddy' },
  { header: 'livestock', key: 'livestock', required: 'OPTIONAL', type: 'Text (Enum)', description: 'Cow / Goat / Chicken / Fish Farm / None', sample: 'Cow' },
  { header: 'family_members_count', key: 'family_members_count', required: 'RECOMMENDED', type: 'Number', description: 'Total family members count.', sample: '4' },
  { header: 'women_count', key: 'women_count', required: 'RECOMMENDED', type: 'Number', description: 'Number of female family members.', sample: '2' },
  { header: 'has_widow', key: 'has_widow', required: 'OPTIONAL', type: 'Boolean (Yes/No)', description: 'Contains widow family member.', sample: 'No' },
  { header: 'has_disabled', key: 'has_disabled', required: 'OPTIONAL', type: 'Boolean (Yes/No)', description: 'Contains differently-abled family member.', sample: 'No' },
  { header: 'has_pregnant', key: 'has_pregnant', required: 'OPTIONAL', type: 'Boolean (Yes/No)', description: 'Contains pregnant or lactating mother.', sample: 'Yes' },
  { header: 'shg_member', key: 'shg_member', required: 'OPTIONAL', type: 'Boolean (Yes/No)', description: 'Is a member of a Self Help Group (SHG)?', sample: 'Yes' },
  { header: 'shg_name', key: 'shg_name', required: 'OPTIONAL', type: 'Text', description: 'Name of the SHG group.', sample: 'Mullai Women SHG' },
  { header: 'entrepreneur', key: 'entrepreneur', required: 'OPTIONAL', type: 'Boolean (Yes/No)', description: 'Runs a micro-enterprise or business.', sample: 'Yes' },
  { header: 'business_vertical', key: 'business_vertical', required: 'OPTIONAL', type: 'Text (Enum)', description: 'Tailoring / Food Business / Handicrafts / Dairy / Poultry / Agri Business / Retail Shop', sample: 'Tailoring' },
  { header: 'verification_status', key: 'verification_status', required: 'OPTIONAL', type: 'Text (Enum)', description: 'Verified / Pending / Rejected', sample: 'Verified' }
]

export function downloadSampleExcelTemplate() {
  if (typeof window === 'undefined') return

  const sampleRows = [
    {
      id: 'RES-101',
      name: 'Meena Devi',
      dob: '1989-04-12',
      age: 37,
      gender: 'Female',
      mobile: '9432109876',
      aadhaar: 'XXXX-XXXX-9081',
      family_id: 'RAT-309182',
      marital_status: 'Married',
      village: 'Kumarpuram',
      ward_number: '1',
      house_number: '12/4',
      pincode: '625001',
      education: 'High School',
      occupation: 'Homemaker',
      monthly_income: 8000,
      annual_income: 96000,
      own_land: 'Yes',
      land_area_acres: 1.5,
      crop_type: 'Paddy',
      livestock: 'Cow',
      family_members_count: 4,
      women_count: 2,
      has_widow: 'No',
      has_disabled: 'No',
      has_pregnant: 'Yes',
      shg_member: 'Yes',
      shg_name: 'Mullai Women SHG',
      entrepreneur: 'Yes',
      business_vertical: 'Tailoring',
      verification_status: 'Verified'
    },
    {
      id: 'RES-102',
      name: 'Sakthi Vadivel',
      dob: '1982-08-24',
      age: 44,
      gender: 'Male',
      mobile: '9876543210',
      aadhaar: 'XXXX-XXXX-4512',
      family_id: 'RAT-401928',
      marital_status: 'Married',
      village: 'Kumarpuram',
      ward_number: '1',
      house_number: '44/B',
      pincode: '625001',
      education: 'Middle School',
      occupation: 'Farmer',
      monthly_income: 14000,
      annual_income: 168000,
      own_land: 'Yes',
      land_area_acres: 2.8,
      crop_type: 'Paddy',
      livestock: 'Goat',
      family_members_count: 5,
      women_count: 2,
      has_widow: 'No',
      has_disabled: 'No',
      has_pregnant: 'No',
      shg_member: 'No',
      shg_name: '',
      entrepreneur: 'No',
      business_vertical: '',
      verification_status: 'Verified'
    },
    {
      id: 'RES-103',
      name: 'Abirami Sundari',
      dob: '1995-11-05',
      age: 30,
      gender: 'Female',
      mobile: '9654321098',
      aadhaar: 'XXXX-XXXX-6721',
      family_id: 'RAT-512938',
      marital_status: 'Single',
      village: 'Sakthinagar',
      ward_number: '1',
      house_number: '8/A',
      pincode: '625002',
      education: 'Postgraduate',
      occupation: 'Teacher',
      monthly_income: 22000,
      annual_income: 264000,
      own_land: 'No',
      land_area_acres: 0,
      crop_type: '',
      livestock: 'None',
      family_members_count: 3,
      women_count: 2,
      has_widow: 'Yes',
      has_disabled: 'No',
      has_pregnant: 'No',
      shg_member: 'Yes',
      shg_name: 'Rose Self Help Group',
      entrepreneur: 'Yes',
      business_vertical: 'Online',
      verification_status: 'Verified'
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(sampleRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Demographics Sample')

  XLSX.writeFile(workbook, 'GramSeva_Demographics_Sample.xlsx')
}

// Column name mapping: maps common Excel header variations → internal field names
const COLUMN_MAP: Record<string, keyof ResidentRecord> = {
  // ID fields
  'id': 'id',
  'resident_id': 'id',
  'residentid': 'id',
  'resident id': 'id',
  'res_id': 'id',

  // Personal
  'name': 'name',
  'full_name': 'name',
  'full name': 'name',
  'resident_name': 'name',
  'resident name': 'name',

  'dob': 'dob',
  'date_of_birth': 'dob',
  'date of birth': 'dob',
  'dateofbirth': 'dob',
  'birth_date': 'dob',

  'age': 'age',

  'gender': 'gender',
  'sex': 'gender',

  'mobile': 'mobile',
  'mobile_number': 'mobile',
  'mobile number': 'mobile',
  'phone': 'mobile',
  'phone_number': 'mobile',
  'phone number': 'mobile',
  'contact': 'mobile',
  'contact_number': 'mobile',

  'aadhaar': 'aadhaar',
  'aadhaar_number': 'aadhaar',
  'aadhaar number': 'aadhaar',
  'aadhar': 'aadhaar',

  'family_id': 'family_id',
  'family id': 'family_id',
  'ration_card': 'family_id',
  'ration card': 'family_id',
  'ration_card_number': 'family_id',
  'ration card number': 'family_id',

  'marital_status': 'marital_status',
  'marital status': 'marital_status',
  'marital': 'marital_status',

  'village': 'village',
  'village_name': 'village',

  'ward': 'ward_number',
  'ward_number': 'ward_number',
  'ward number': 'ward_number',

  'house_number': 'house_number',
  'house number': 'house_number',
  'house no': 'house_number',

  'pincode': 'pincode',
  'pin': 'pincode',
  'pin_code': 'pincode',

  // Education
  'education': 'education',
  'qualification': 'education',
  'highest_qualification': 'education',
  'highest qualification': 'education',

  'school_college': 'school_college',
  'school': 'school_college',
  'college': 'school_college',
  'institution': 'school_college',

  'currently_studying': 'currently_studying',
  'currently studying': 'currently_studying',

  'student_id': 'student_id',
  'student id': 'student_id',

  // Employment
  'occupation': 'occupation',
  'job': 'occupation',
  'employment': 'occupation',

  'monthly_income': 'monthly_income',
  'monthly income': 'monthly_income',
  'income': 'monthly_income',

  'annual_income': 'annual_income',
  'annual income': 'annual_income',
  'yearly_income': 'annual_income',
  'yearly income': 'annual_income',

  'annual_income_range': 'annual_income_range',
  'income_range': 'annual_income_range',
  'income range': 'annual_income_range',
  'annual income range': 'annual_income_range',

  'employer_name': 'employer_name',
  'employer': 'employer_name',

  // Land
  'own_land': 'own_land',
  'owns_land': 'own_land',
  'own land': 'own_land',
  'land_owner': 'own_land',

  'land_type': 'land_type',
  'land type': 'land_type',

  'land_area_acres': 'land_area_acres',
  'land area': 'land_area_acres',
  'land_area': 'land_area_acres',
  'acres': 'land_area_acres',

  'crop_type': 'crop_type',
  'crop type': 'crop_type',
  'crop': 'crop_type',

  'livestock': 'livestock',

  // Family
  'family_members_count': 'family_members_count',
  'family members': 'family_members_count',
  'family_members': 'family_members_count',
  'family_size': 'family_members_count',
  'family size': 'family_members_count',

  'children_count': 'children_count',
  'children': 'children_count',
  'no_of_children': 'children_count',

  'women_count': 'women_count',
  'women': 'women_count',
  'no_of_women': 'women_count',

  'senior_citizens_count': 'senior_citizens_count',
  'senior_citizens': 'senior_citizens_count',
  'senior citizens': 'senior_citizens_count',
  'elderly': 'senior_citizens_count',

  'has_widow': 'has_widow',
  'widow': 'has_widow',

  'has_disabled': 'has_disabled',
  'disabled': 'has_disabled',
  'disability': 'has_disabled',

  'disability_type': 'disability_type',
  'disability type': 'disability_type',

  'has_pregnant': 'has_pregnant',
  'pregnant': 'has_pregnant',

  'has_lactating': 'has_lactating',
  'lactating': 'has_lactating',

  'has_girl_child': 'has_girl_child',
  'girl_child': 'has_girl_child',
  'girl child': 'has_girl_child',

  // Women empowerment
  'shg_member': 'shg_member',
  'shg member': 'shg_member',
  'shg': 'shg_member',

  'shg_name': 'shg_name',
  'shg name': 'shg_name',

  'entrepreneur': 'entrepreneur',
  'is_entrepreneur': 'entrepreneur',

  'business_vertical': 'business_vertical',
  'business': 'business_vertical',
  'business type': 'business_vertical',

  'interested_skill_training': 'interested_skill_training',
  'skill_training': 'interested_skill_training',
  'skill training': 'interested_skill_training',

  'interested_govt_loans': 'interested_govt_loans',
  'govt_loans': 'interested_govt_loans',
  'govt loans': 'interested_govt_loans',

  'has_bank_account': 'has_bank_account',
  'bank_account': 'has_bank_account',
  'bank account': 'has_bank_account',

  'has_jandhan_account': 'has_jandhan_account',
  'jandhan': 'has_jandhan_account',
  'jan_dhan': 'has_jandhan_account',

  'digital_literate': 'digital_literate',
  'digital literate': 'digital_literate',
  'digital_literacy': 'digital_literate',

  'has_smartphone': 'has_smartphone',
  'smartphone': 'has_smartphone',

  'has_internet': 'has_internet',
  'internet': 'has_internet',

  'email': 'email',
  'email_id': 'email',

  'verification_status': 'verification_status',
  'verification': 'verification_status',
  'status': 'verification_status',
}

const REQUIRED_COLUMNS: (keyof ResidentRecord)[] = ['name', 'gender', 'village']

function parseBool(val: any): boolean {
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val > 0
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim()
    return ['yes', 'true', '1', 'y', 'haan', 'aam'].includes(lower)
  }
  return false
}

function parseNumber(val: any, fallback = 0): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const cleaned = val.replace(/[₹,\s]/g, '')
    const n = parseFloat(cleaned)
    return isNaN(n) ? fallback : n
  }
  return fallback
}

function inferIncomeRange(annual: number): string {
  if (annual < 100000) return 'Below ₹1,00,000'
  if (annual <= 250000) return '₹1,00,000 – ₹2,50,000'
  if (annual <= 500000) return '₹2,50,000 – ₹5,00,000'
  if (annual <= 1000000) return '₹5,00,000 – ₹10,00,000'
  return 'Above ₹10,00,000'
}

function calculateAge(dob: string): number {
  try {
    const d = new Date(dob)
    if (isNaN(d.getTime())) return 25
    const today = new Date()
    let age = today.getFullYear() - d.getFullYear()
    const m = today.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
    return Math.max(0, age)
  } catch {
    return 25
  }
}

function mapRowToResident(row: Record<string, any>, columnMapping: Record<string, keyof ResidentRecord>, rowIndex: number): { record: Partial<ResidentRecord> | null; error?: string } {
  const mapped: Record<string, any> = {}

  // Apply column mapping
  for (const [excelCol, internalField] of Object.entries(columnMapping)) {
    if (row[excelCol] !== undefined && row[excelCol] !== null && row[excelCol] !== '') {
      mapped[internalField] = row[excelCol]
    }
  }

  // Validate required fields
  if (!mapped.name || String(mapped.name).trim() === '') {
    return { record: null, error: `Row ${rowIndex}: Missing required field "name"` }
  }

  const now = new Date().toISOString()
  const age = mapped.dob ? calculateAge(String(mapped.dob)) : parseNumber(mapped.age, 25)
  const monthlyIncome = parseNumber(mapped.monthly_income, 0)
  const annualIncome = parseNumber(mapped.annual_income, monthlyIncome * 12)

  const record: Partial<ResidentRecord> = {
    id: mapped.id ? String(mapped.id) : `RES-IMP-${Date.now().toString().slice(-4)}-${rowIndex}`,
    firebase_uid: mapped.firebase_uid || `imported-${Date.now()}-${rowIndex}`,
    email: mapped.email || `imported.${rowIndex}@gramseva.local`,
    role: 'resident',
    profile_complete: true,
    profile_completion_score: 85,
    verification_status: (mapped.verification_status as any) || 'Verified',

    name: String(mapped.name).trim(),
    dob: mapped.dob ? String(mapped.dob) : undefined,
    age,
    gender: mapped.gender ? String(mapped.gender).trim() : 'Female',
    mobile: mapped.mobile ? String(mapped.mobile).replace(/\D/g, '') : '',
    mobile_verified: !!mapped.mobile,
    aadhaar: mapped.aadhaar ? String(mapped.aadhaar) : '',
    family_id: mapped.family_id ? String(mapped.family_id) : '',
    marital_status: mapped.marital_status ? String(mapped.marital_status) : 'Single',
    village: mapped.village ? String(mapped.village).trim() : 'Kumarpuram',
    ward_number: mapped.ward_number ? String(mapped.ward_number).replace(/\D/g, '') || '1' : '1',
    house_number: mapped.house_number ? String(mapped.house_number) : undefined,
    pincode: mapped.pincode ? String(mapped.pincode) : '625001',

    education: mapped.education ? String(mapped.education) : 'High School',
    school_college: mapped.school_college ? String(mapped.school_college) : undefined,
    currently_studying: parseBool(mapped.currently_studying),
    student_id: mapped.student_id ? String(mapped.student_id) : undefined,

    occupation: mapped.occupation ? String(mapped.occupation) : 'Homemaker',
    monthly_income: monthlyIncome,
    annual_income: annualIncome,
    annual_income_range: mapped.annual_income_range ? String(mapped.annual_income_range) : inferIncomeRange(annualIncome),
    employer_name: mapped.employer_name ? String(mapped.employer_name) : undefined,

    own_land: parseBool(mapped.own_land),
    land_type: mapped.land_type ? String(mapped.land_type) : undefined,
    land_area_acres: mapped.land_area_acres ? parseNumber(mapped.land_area_acres) : undefined,
    crop_type: mapped.crop_type ? String(mapped.crop_type) : undefined,
    livestock: mapped.livestock ? String(mapped.livestock) : 'None',

    family_members_count: parseNumber(mapped.family_members_count, 1),
    children_count: parseNumber(mapped.children_count, 0),
    women_count: parseNumber(mapped.women_count, mapped.gender === 'Female' ? 1 : 0),
    senior_citizens_count: parseNumber(mapped.senior_citizens_count, 0),
    has_widow: parseBool(mapped.has_widow) || mapped.marital_status === 'Widowed',
    has_disabled: parseBool(mapped.has_disabled),
    disability_type: mapped.disability_type ? String(mapped.disability_type) : 'No Disability',
    has_pregnant: parseBool(mapped.has_pregnant),
    has_lactating: parseBool(mapped.has_lactating),
    has_girl_child: parseBool(mapped.has_girl_child),

    shg_member: parseBool(mapped.shg_member),
    shg_name: mapped.shg_name ? String(mapped.shg_name) : undefined,
    entrepreneur: parseBool(mapped.entrepreneur),
    business_vertical: mapped.business_vertical ? String(mapped.business_vertical) : undefined,
    interested_skill_training: parseBool(mapped.interested_skill_training),
    interested_govt_loans: parseBool(mapped.interested_govt_loans),
    has_bank_account: parseBool(mapped.has_bank_account),
    has_jandhan_account: parseBool(mapped.has_jandhan_account),
    digital_literate: parseBool(mapped.digital_literate),
    has_smartphone: parseBool(mapped.has_smartphone),
    has_internet: parseBool(mapped.has_internet),
    previous_scheme_benefits: [],

    documents: {},
    created_at: now,
    updated_at: now,
  }

  return { record }
}

export function parseAndImportFile(fileBuffer: ArrayBuffer, fileName: string): ImportResult {
  const result: ImportResult = {
    fileName,
    totalRowsRead: 0,
    imported: 0,
    updated: 0,
    duplicatesSkipped: 0,
    errors: 0,
    errorDetails: [],
    status: 'success',
  }

  try {
    // 1. Parse workbook
    const workbook = XLSX.read(fileBuffer, { type: 'array', cellDates: true })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      result.status = 'failed'
      result.errorDetails.push('No sheets found in the uploaded file.')
      return result
    }

    const sheet = workbook.Sheets[sheetName]
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    result.totalRowsRead = rawRows.length

    if (rawRows.length === 0) {
      result.status = 'failed'
      result.errorDetails.push('The uploaded file contains no data rows.')
      return result
    }

    // 2. Build column mapping from the first row's keys
    const excelHeaders = Object.keys(rawRows[0])
    const columnMapping: Record<string, keyof ResidentRecord> = {}
    const unmappedHeaders: string[] = []

    for (const header of excelHeaders) {
      const normalizedHeader = header.toLowerCase().trim().replace(/[^a-z0-9_ ]/g, '')
      if (COLUMN_MAP[normalizedHeader]) {
        columnMapping[header] = COLUMN_MAP[normalizedHeader]
      } else {
        unmappedHeaders.push(header)
      }
    }

    // 3. Check required columns
    const mappedFields = new Set(Object.values(columnMapping))
    const missingRequired = REQUIRED_COLUMNS.filter(f => !mappedFields.has(f))
    if (missingRequired.length > 0) {
      result.status = 'failed'
      result.errorDetails.push(`Missing required columns: ${missingRequired.join(', ')}. Found columns: ${excelHeaders.join(', ')}`)
      return result
    }

    // 4. Get existing residents for deduplication
    const existingResidents = getStoredResidents()
    const existingIdMap = new Map(existingResidents.map(r => [r.id, r]))
    const existingAadhaarMap = new Map(existingResidents.filter(r => r.aadhaar).map(r => [r.aadhaar.replace(/\D/g, ''), r]))

    // 5. Parse each row
    const newRecords: ResidentRecord[] = [...existingResidents]
    const processedIds = new Set<string>()

    for (let i = 0; i < rawRows.length; i++) {
      const { record, error } = mapRowToResident(rawRows[i], columnMapping, i + 2) // +2 for header row + 1-indexed

      if (error || !record) {
        result.errors++
        if (error) result.errorDetails.push(error)
        continue
      }

      const recordId = record.id!
      const recordAadhaar = record.aadhaar?.replace(/\D/g, '') || ''

      // Skip duplicate IDs within same file
      if (processedIds.has(recordId)) {
        result.duplicatesSkipped++
        continue
      }
      processedIds.add(recordId)

      // Check if already exists → update
      const existingIdx = newRecords.findIndex(r => r.id === recordId)
      if (existingIdx !== -1) {
        newRecords[existingIdx] = { ...newRecords[existingIdx], ...record, updated_at: new Date().toISOString() } as ResidentRecord
        result.updated++
      } else if (recordAadhaar && existingAadhaarMap.has(recordAadhaar)) {
        // Same aadhaar → update
        const existAadhaarIdx = newRecords.findIndex(r => r.aadhaar.replace(/\D/g, '') === recordAadhaar)
        if (existAadhaarIdx !== -1) {
          newRecords[existAadhaarIdx] = { ...newRecords[existAadhaarIdx], ...record, id: newRecords[existAadhaarIdx].id, updated_at: new Date().toISOString() } as ResidentRecord
          result.updated++
        }
      } else {
        // New record
        newRecords.push(record as ResidentRecord)
        result.imported++
      }
    }

    // 6. Save to store
    saveStoredResidents(newRecords)

    if (result.errors > 0 && result.imported === 0 && result.updated === 0) {
      result.status = 'failed'
    } else if (result.errors > 0) {
      result.status = 'partial'
    } else {
      result.status = 'success'
    }

  } catch (err: any) {
    result.status = 'failed'
    result.errors++
    result.errorDetails.push(`File parsing error: ${err.message || 'Unknown error'}`)
  }

  return result
}
