// lib/resident-store.ts
// Centralized Data System for GramSeva Resident Profiles & Real-Time Admin Synchronization

export type VerificationStatus = 'Verified' | 'Pending' | 'Rejected'

export interface DocumentRecord {
  name: string
  url?: string
  status: 'Uploaded' | 'Missing'
  fileType?: string
}

export interface ResidentRecord {
  id: string
  firebase_uid: string
  email: string
  role: 'resident' | 'admin'
  profile_complete: boolean
  profile_completion_score: number
  verification_status: VerificationStatus
  verification_remarks?: string
  
  // Step 1: Personal Info
  name: string
  dob?: string
  age: number
  gender: 'Male' | 'Female' | 'Transgender' | string
  mobile: string
  mobile_verified: boolean
  aadhaar: string // Masked e.g. XXXX-XXXX-1234
  family_id: string // Ration Card / Family ID
  marital_status: 'Single' | 'Married' | 'Widowed' | 'Divorced' | 'Separated' | string
  photo_url?: string
  village: string
  ward_number: string
  house_number?: string
  pincode?: string

  // Step 2: Education
  education: 'No Formal Education' | 'Primary' | 'Middle' | 'High School' | 'Higher Secondary' | 'Diploma' | 'Undergraduate' | 'Postgraduate' | 'Doctorate' | string
  school_college?: string
  currently_studying: boolean
  student_id?: string

  // Step 3: Employment
  occupation: 'Student' | 'Homemaker' | 'Farmer' | 'Agricultural Labourer' | 'Government Employee' | 'Private Employee' | 'Self Employed' | 'Business Owner' | 'Daily Wage Worker' | 'Construction Worker' | 'Teacher' | 'Healthcare Worker' | 'Retired' | 'Unemployed' | string
  monthly_income: number
  annual_income_range: 'Below ₹1,00,000' | '₹1,00,000 – ₹2,50,000' | '₹2,50,000 – ₹5,00,000' | '₹5,00,000 – ₹10,00,000' | 'Above ₹10,00,000' | string
  annual_income: number
  employer_name?: string

  // Step 4: Land Details
  own_land: boolean
  land_type?: 'Agricultural' | 'Residential' | 'Commercial' | 'Mixed' | string
  land_area_acres?: number
  crop_type?: 'Paddy' | 'Banana' | 'Sugarcane' | 'Vegetables' | 'Coconut' | 'Millets' | 'Cotton' | 'Others' | string
  livestock?: 'Cow' | 'Goat' | 'Chicken' | 'Fish Farm' | 'None' | string

  // Step 5: Family Details
  family_members_count: number
  children_count: number
  women_count: number
  senior_citizens_count: number
  has_widow: boolean
  has_disabled: boolean
  disability_type?: 'No Disability' | 'Physical Disability' | 'Visual Disability' | 'Hearing Disability' | 'Multiple Disability' | string
  has_pregnant: boolean
  has_lactating: boolean
  has_girl_child: boolean

  // Step 6: Women Empowerment (If Female)
  shg_member: boolean
  shg_name?: string
  entrepreneur: boolean
  business_vertical?: 'Tailoring' | 'Food Business' | 'Handicrafts' | 'Dairy' | 'Poultry' | 'Agri Business' | 'Online' | 'Retail Shop' | string
  interested_skill_training: boolean
  interested_govt_loans: boolean
  has_bank_account: boolean
  has_jandhan_account: boolean
  digital_literate: boolean
  has_smartphone: boolean
  has_internet: boolean
  previous_scheme_benefits: string[]

  // Step 7: Documents
  documents: {
    aadhaar_card?: DocumentRecord
    ration_card?: DocumentRecord
    income_cert?: DocumentRecord
    community_cert?: DocumentRecord
    disability_cert?: DocumentRecord
    land_doc?: DocumentRecord
    education_cert?: DocumentRecord
  }

  created_at: string
  updated_at: string
}

// ─── INITIAL SEED RESIDENTS (REALISTIC DEMOGRAPHICS) ─────────────────────────
const SEED_RESIDENTS: ResidentRecord[] = [
  {
    id: 'RES-101',
    firebase_uid: 'uid-meena-01',
    email: 'meenadevi@gmail.com',
    role: 'resident',
    profile_complete: true,
    profile_completion_score: 100,
    verification_status: 'Verified',
    name: 'Meena Devi',
    dob: '1989-04-12',
    age: 37,
    gender: 'Female',
    mobile: '9432109876',
    mobile_verified: true,
    aadhaar: 'XXXX-XXXX-9081',
    family_id: 'RAT-309182',
    marital_status: 'Married',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    village: 'Kumarpuram',
    ward_number: '1',
    house_number: '12/4',
    pincode: '625001',
    education: 'High School',
    school_college: 'Kumarpuram Govt High School',
    currently_studying: false,
    occupation: 'Homemaker',
    monthly_income: 8000,
    annual_income_range: 'Below ₹1,00,000',
    annual_income: 96000,
    own_land: true,
    land_type: 'Agricultural',
    land_area_acres: 1.5,
    crop_type: 'Paddy',
    livestock: 'Cow',
    family_members_count: 4,
    children_count: 2,
    women_count: 2,
    senior_citizens_count: 0,
    has_widow: false,
    has_disabled: false,
    disability_type: 'No Disability',
    has_pregnant: true,
    has_lactating: false,
    has_girl_child: true,
    shg_member: true,
    shg_name: 'Mullai Women SHG',
    entrepreneur: true,
    business_vertical: 'Tailoring',
    interested_skill_training: true,
    interested_govt_loans: true,
    has_bank_account: true,
    has_jandhan_account: true,
    digital_literate: true,
    has_smartphone: true,
    has_internet: true,
    previous_scheme_benefits: ['PMAY-G', 'Free Sewing Machine'],
    documents: {
      aadhaar_card: { name: 'Aadhaar_Meena.pdf', status: 'Uploaded' },
      ration_card: { name: 'Ration_Meena.pdf', status: 'Uploaded' },
      income_cert: { name: 'Income_Meena.pdf', status: 'Uploaded' },
      community_cert: { name: 'Community_Meena.pdf', status: 'Uploaded' },
    },
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-07-20T14:30:00Z',
  },
  {
    id: 'RES-102',
    firebase_uid: 'uid-sakthi-02',
    email: 'sakthivadivel@gmail.com',
    role: 'resident',
    profile_complete: true,
    profile_completion_score: 95,
    verification_status: 'Verified',
    name: 'Sakthi Vadivel',
    dob: '1982-08-24',
    age: 44,
    gender: 'Male',
    mobile: '9876543210',
    mobile_verified: true,
    aadhaar: 'XXXX-XXXX-4512',
    family_id: 'RAT-401928',
    marital_status: 'Married',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    village: 'Kumarpuram',
    ward_number: '1',
    house_number: '44/B',
    pincode: '625001',
    education: 'Middle School',
    school_college: 'Sakthinagar Govt School',
    currently_studying: false,
    occupation: 'Farmer',
    monthly_income: 14000,
    annual_income_range: '₹1,00,000 – ₹2,50,000',
    annual_income: 168000,
    own_land: true,
    land_type: 'Agricultural',
    land_area_acres: 2.8,
    crop_type: 'Paddy',
    livestock: 'Goat',
    family_members_count: 5,
    children_count: 2,
    women_count: 2,
    senior_citizens_count: 1,
    has_widow: false,
    has_disabled: false,
    disability_type: 'No Disability',
    has_pregnant: false,
    has_lactating: false,
    has_girl_child: true,
    shg_member: false,
    entrepreneur: false,
    interested_skill_training: false,
    interested_govt_loans: true,
    has_bank_account: true,
    has_jandhan_account: true,
    digital_literate: false,
    has_smartphone: true,
    has_internet: true,
    previous_scheme_benefits: ['PM Kisan'],
    documents: {
      aadhaar_card: { name: 'Aadhaar_Sakthi.pdf', status: 'Uploaded' },
      ration_card: { name: 'Ration_Sakthi.pdf', status: 'Uploaded' },
      land_doc: { name: 'Land_Patta.pdf', status: 'Uploaded' },
    },
    created_at: '2026-02-10T09:15:00Z',
    updated_at: '2026-07-22T11:00:00Z',
  },
  {
    id: 'RES-103',
    firebase_uid: 'uid-abirami-03',
    email: 'abirami.sundari@gmail.com',
    role: 'resident',
    profile_complete: true,
    profile_completion_score: 100,
    verification_status: 'Verified',
    name: 'Abirami Sundari',
    dob: '1995-11-05',
    age: 30,
    gender: 'Female',
    mobile: '9654321098',
    mobile_verified: true,
    aadhaar: 'XXXX-XXXX-6721',
    family_id: 'RAT-512938',
    marital_status: 'Single',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    village: 'Sakthinagar',
    ward_number: '1',
    house_number: '8/A',
    pincode: '625002',
    education: 'Postgraduate',
    school_college: 'Madurai Kamaraj University',
    currently_studying: false,
    occupation: 'Teacher',
    monthly_income: 22000,
    annual_income_range: '₹2,50,000 – ₹5,00,000',
    annual_income: 264000,
    employer_name: 'St. Mary High School',
    own_land: false,
    family_members_count: 3,
    children_count: 0,
    women_count: 2,
    senior_citizens_count: 1,
    has_widow: true,
    has_disabled: false,
    disability_type: 'No Disability',
    has_pregnant: false,
    has_lactating: false,
    has_girl_child: false,
    shg_member: true,
    shg_name: 'Rose Self Help Group',
    entrepreneur: true,
    business_vertical: 'Online',
    interested_skill_training: true,
    interested_govt_loans: true,
    has_bank_account: true,
    has_jandhan_account: false,
    digital_literate: true,
    has_smartphone: true,
    has_internet: true,
    previous_scheme_benefits: ['Girl Scholarship'],
    documents: {
      aadhaar_card: { name: 'Aadhaar_Abirami.pdf', status: 'Uploaded' },
      ration_card: { name: 'Ration_Abirami.pdf', status: 'Uploaded' },
      education_cert: { name: 'MA_Degree.pdf', status: 'Uploaded' },
    },
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-07-24T16:20:00Z',
  },
  {
    id: 'RES-104',
    firebase_uid: 'uid-kumar-04',
    email: 'kumarraja@gmail.com',
    role: 'resident',
    profile_complete: true,
    profile_completion_score: 90,
    verification_status: 'Pending',
    name: 'Kumar Raja',
    dob: '2004-03-18',
    age: 22,
    gender: 'Male',
    mobile: '9765432109',
    mobile_verified: true,
    aadhaar: 'XXXX-XXXX-1129',
    family_id: 'RAT-601928',
    marital_status: 'Single',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    village: 'Vetrikovil',
    ward_number: '2',
    house_number: '102',
    pincode: '625003',
    education: 'Undergraduate',
    school_college: 'Government Polytechnic College',
    currently_studying: true,
    student_id: 'POLY-2024-88',
    occupation: 'Student',
    monthly_income: 0,
    annual_income_range: 'Below ₹1,00,000',
    annual_income: 45000,
    own_land: false,
    family_members_count: 4,
    children_count: 1,
    women_count: 1,
    senior_citizens_count: 0,
    has_widow: false,
    has_disabled: false,
    disability_type: 'No Disability',
    has_pregnant: false,
    has_lactating: false,
    has_girl_child: false,
    shg_member: false,
    entrepreneur: false,
    interested_skill_training: true,
    interested_govt_loans: false,
    has_bank_account: true,
    has_jandhan_account: true,
    digital_literate: true,
    has_smartphone: true,
    has_internet: true,
    previous_scheme_benefits: ['Post-Matric Scholarship'],
    documents: {
      aadhaar_card: { name: 'Aadhaar_Kumar.pdf', status: 'Uploaded' },
      education_cert: { name: 'Student_ID_Proof.pdf', status: 'Uploaded' },
    },
    created_at: '2026-05-10T14:30:00Z',
    updated_at: '2026-07-25T09:00:00Z',
  },
  {
    id: 'RES-105',
    firebase_uid: 'uid-kavitha-05',
    email: 'kavitha.ramesh@gmail.com',
    role: 'resident',
    profile_complete: true,
    profile_completion_score: 95,
    verification_status: 'Pending',
    name: 'Kavitha Ramesh',
    dob: '1992-09-14',
    age: 33,
    gender: 'Female',
    mobile: '9543210987',
    mobile_verified: true,
    aadhaar: 'XXXX-XXXX-8821',
    family_id: 'RAT-701923',
    marital_status: 'Widowed',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    village: 'Ariyanayagi',
    ward_number: '4',
    house_number: '19',
    pincode: '625004',
    education: 'Primary School',
    school_college: 'Ariyanayagi Primary',
    currently_studying: false,
    occupation: 'Daily Wage Worker',
    monthly_income: 6000,
    annual_income_range: 'Below ₹1,00,000',
    annual_income: 72000,
    own_land: false,
    family_members_count: 3,
    children_count: 2,
    women_count: 1,
    senior_citizens_count: 0,
    has_widow: true,
    has_disabled: false,
    disability_type: 'No Disability',
    has_pregnant: false,
    has_lactating: true,
    has_girl_child: true,
    shg_member: false,
    entrepreneur: false,
    interested_skill_training: true,
    interested_govt_loans: true,
    has_bank_account: true,
    has_jandhan_account: true,
    digital_literate: false,
    has_smartphone: true,
    has_internet: false,
    previous_scheme_benefits: [],
    documents: {
      aadhaar_card: { name: 'Aadhaar_Kavitha.pdf', status: 'Uploaded' },
      ration_card: { name: 'Ration_Kavitha.pdf', status: 'Uploaded' },
    },
    created_at: '2026-06-12T11:00:00Z',
    updated_at: '2026-07-25T15:30:00Z',
  }
]

const STORAGE_KEY = 'gramseva_resident_database_v2'

export function getStoredResidents(): ResidentRecord[] {
  if (typeof window === 'undefined') return SEED_RESIDENTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RESIDENTS))
      return SEED_RESIDENTS
    }
    return JSON.parse(raw)
  } catch {
    return SEED_RESIDENTS
  }
}

export function saveStoredResidents(residents: ResidentRecord[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(residents))
  window.dispatchEvent(new CustomEvent('gramseva_resident_db_updated'))
}

// ─── DEDUPLICATION & VALIDATION HELPERS ───────────────────────────────────────
export function validateUniqueness(
  uid: string,
  aadhaar: string,
  familyId: string
): { valid: boolean; error?: string } {
  const residents = getStoredResidents()

  // Clean values for comparison
  const cleanAadhaar = aadhaar.replace(/\D/g, '')
  const cleanFamilyId = familyId.trim().toUpperCase()

  for (const r of residents) {
    if (r.firebase_uid === uid) continue // Skip self

    const existingAadhaar = r.aadhaar.replace(/\D/g, '')
    if (cleanAadhaar && existingAadhaar && cleanAadhaar === existingAadhaar) {
      return {
        valid: false,
        error: `Aadhaar card number (${aadhaar}) is already registered to resident ${r.name}. One Aadhaar card = One Resident profile.`
      }
    }

    const existingFamilyId = r.family_id.trim().toUpperCase()
    if (cleanFamilyId && existingFamilyId && cleanFamilyId === existingFamilyId) {
      return {
        valid: false,
        error: `Family ID / Ration Card (${familyId}) is already registered under ${r.name}.`
      }
    }
  }

  return { valid: true }
}

// ─── UPSERT RESIDENT PROFILE ──────────────────────────────────────────────────
export function upsertResidentProfile(profileData: Partial<ResidentRecord> & { firebase_uid: string; email: string }): ResidentRecord {
  const residents = getStoredResidents()
  const idx = residents.findIndex(r => r.firebase_uid === profileData.firebase_uid)

  const now = new Date().toISOString()
  
  // Calculate completion score
  const score = calculateProfileScore(profileData)
  const isComplete = score >= 80

  let updatedRecord: ResidentRecord

  if (idx !== -1) {
    updatedRecord = {
      ...residents[idx],
      ...profileData,
      profile_complete: isComplete,
      profile_completion_score: score,
      verification_status: profileData.verification_status || residents[idx].verification_status || 'Pending',
      updated_at: now,
    } as ResidentRecord
    residents[idx] = updatedRecord
  } else {
    updatedRecord = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      role: 'resident',
      verification_status: 'Pending',
      profile_complete: isComplete,
      profile_completion_score: score,
      name: profileData.name || 'New Resident',
      age: profileData.age || 25,
      gender: profileData.gender || 'Female',
      mobile: profileData.mobile || '',
      mobile_verified: profileData.mobile_verified || false,
      aadhaar: profileData.aadhaar || '',
      family_id: profileData.family_id || '',
      marital_status: profileData.marital_status || 'Single',
      village: profileData.village || 'Kumarpuram',
      ward_number: profileData.ward_number || '1',
      education: profileData.education || 'High School',
      currently_studying: profileData.currently_studying || false,
      occupation: profileData.occupation || 'Homemaker',
      monthly_income: profileData.monthly_income || 0,
      annual_income_range: profileData.annual_income_range || 'Below ₹1,00,000',
      annual_income: profileData.annual_income || 50000,
      own_land: profileData.own_land || false,
      family_members_count: profileData.family_members_count || 1,
      children_count: profileData.children_count || 0,
      women_count: profileData.women_count || 1,
      senior_citizens_count: profileData.senior_citizens_count || 0,
      has_widow: profileData.has_widow || false,
      has_disabled: profileData.has_disabled || false,
      has_pregnant: profileData.has_pregnant || false,
      has_lactating: profileData.has_lactating || false,
      has_girl_child: profileData.has_girl_child || false,
      shg_member: profileData.shg_member || false,
      entrepreneur: profileData.entrepreneur || false,
      interested_skill_training: profileData.interested_skill_training || false,
      interested_govt_loans: profileData.interested_govt_loans || false,
      has_bank_account: profileData.has_bank_account || false,
      has_jandhan_account: profileData.has_jandhan_account || false,
      digital_literate: profileData.digital_literate || false,
      has_smartphone: profileData.has_smartphone || false,
      has_internet: profileData.has_internet || false,
      previous_scheme_benefits: profileData.previous_scheme_benefits || [],
      documents: profileData.documents || {},
      created_at: now,
      updated_at: now,
      ...profileData,
    } as ResidentRecord
    residents.unshift(updatedRecord)
  }

  saveStoredResidents(residents)
  return updatedRecord
}

// ─── ADMIN VERIFICATION UPDATE ────────────────────────────────────────────────
export function updateVerificationStatus(id: string, status: VerificationStatus, remarks?: string): ResidentRecord | null {
  const residents = getStoredResidents()
  const idx = residents.findIndex(r => r.id === id)
  if (idx === -1) return null

  residents[idx].verification_status = status
  if (remarks) residents[idx].verification_remarks = remarks
  residents[idx].updated_at = new Date().toISOString()

  saveStoredResidents(residents)
  return residents[idx]
}

// ─── CALCULATE PROFILE COMPLETION SCORE ───────────────────────────────────────
export function calculateProfileScore(p: Partial<ResidentRecord>): number {
  const requiredFields = [
    'name', 'dob', 'gender', 'mobile', 'aadhaar', 'family_id',
    'village', 'ward_number', 'education', 'occupation',
    'annual_income_range', 'family_members_count'
  ]

  let filled = 0
  for (const f of requiredFields) {
    if (p[f as keyof ResidentRecord] !== undefined && p[f as keyof ResidentRecord] !== '') {
      filled++
    }
  }

  // Documents check
  let docsCount = 0
  if (p.documents?.aadhaar_card?.status === 'Uploaded') docsCount++
  if (p.documents?.ration_card?.status === 'Uploaded') docsCount++

  const baseScore = Math.round((filled / requiredFields.length) * 80)
  const docScore = docsCount * 10

  return Math.min(100, baseScore + docScore)
}

// ─── COMPUTE REAL-TIME DEMOGRAPHIC METRICS FOR BDO DASHBOARD ─────────────────
export function computeCentralMetrics(verifiedOnly = false) {
  const allResidents = getStoredResidents()
  const residents = verifiedOnly
    ? allResidents.filter(r => r.verification_status === 'Verified')
    : allResidents

  const totalFamilies = residents.length
  const totalPopulation = residents.reduce((acc, r) => acc + (r.family_members_count || 1), 0)

  const male = residents.filter(r => r.gender === 'Male').length
  const female = residents.filter(r => r.gender === 'Female').length
  const transgender = residents.filter(r => r.gender === 'Transgender').length

  const womenRegistered = female
  const womenEligible = residents.filter(r => r.gender === 'Female' && (r.annual_income <= 250000 || r.shg_member || r.has_widow || r.has_pregnant)).length
  const womenBenefited = residents.filter(r => r.gender === 'Female' && (r.previous_scheme_benefits?.length || 0) > 0).length
  const womenYetToApply = Math.max(0, womenEligible - womenBenefited)

  // 1. EDUCATION METRICS
  const noFormalEdu = residents.filter(r => r.education === 'No Formal Education').length
  const primaryEdu = residents.filter(r => r.education === 'Primary' || r.education === 'Primary School').length
  const middleEdu = residents.filter(r => r.education === 'Middle').length
  const highSchoolEdu = residents.filter(r => r.education === 'High School').length
  const higherSecEdu = residents.filter(r => r.education === 'Higher Secondary').length
  const diplomaEdu = residents.filter(r => r.education === 'Diploma').length
  const undergradEdu = residents.filter(r => r.education === 'Undergraduate').length
  const postgradEdu = residents.filter(r => r.education === 'Postgraduate' || r.education === 'Doctorate').length

  const literateCount = residents.length - noFormalEdu
  const literacyRate = residents.length > 0 ? Math.round((literateCount / residents.length) * 100) : 0

  const schoolStudents = residents.filter(r => r.currently_studying && (r.education === 'Primary' || r.education === 'Middle' || r.education === 'High School' || r.education === 'Higher Secondary')).length
  const collegeStudents = residents.filter(r => r.currently_studying && (r.education === 'Diploma' || r.education === 'Undergraduate' || r.education === 'Postgraduate')).length
  const totalStudents = residents.filter(r => r.currently_studying || r.occupation === 'Student').length
  const schoolDropouts = residents.filter(r => r.age >= 6 && r.age <= 17 && !r.currently_studying && r.education === 'Primary').length

  // 2. AGRICULTURE METRICS
  const totalFarmers = residents.filter(r => r.occupation === 'Farmer' || r.own_land || (r.crop_type && r.crop_type !== 'None')).length
  const womenFarmers = residents.filter(r => r.gender === 'Female' && (r.occupation === 'Farmer' || r.own_land)).length
  const landOwners = residents.filter(r => r.own_land).length
  const totalCultivableAcres = residents.reduce((acc, r) => acc + (r.land_area_acres || 0), 0)
  const irrigatedAcres = Math.round(totalCultivableAcres * 0.72)
  const livestockOwners = residents.filter(r => r.livestock && r.livestock !== 'None').length

  // 3. EMPLOYMENT METRICS
  const govtEmployees = residents.filter(r => r.occupation === 'Government Employee').length
  const privateEmployees = residents.filter(r => r.occupation === 'Private Employee' || r.occupation === 'Teacher' || r.occupation === 'Healthcare Worker').length
  const selfEmployed = residents.filter(r => r.occupation === 'Self Employed').length
  const businessOwners = residents.filter(r => r.occupation === 'Business Owner' || r.entrepreneur).length
  const dailyWagers = residents.filter(r => r.occupation === 'Daily Wage Worker' || r.occupation === 'Agricultural Labourer' || r.occupation === 'Construction Worker').length
  const unemployedCount = residents.filter(r => r.occupation === 'Unemployed' || (r.age >= 18 && r.age <= 60 && !r.occupation)).length
  const retiredCount = residents.filter(r => r.occupation === 'Retired' || (r.age > 60 && r.occupation !== 'Farmer')).length

  const employableAgeCount = residents.filter(r => r.age >= 18 && r.age <= 60 && r.occupation !== 'Student' && r.occupation !== 'Homemaker').length
  const employedCount = govtEmployees + privateEmployees + selfEmployed + businessOwners + dailyWagers + totalFarmers
  const employmentRate = employableAgeCount > 0 ? Math.round((employedCount / employableAgeCount) * 100) : 75

  // 4. HEALTH & WELFARE
  const pregnantWomen = residents.filter(r => r.has_pregnant).length
  const lactatingMothers = residents.filter(r => r.has_lactating).length
  const seniorCitizens = residents.filter(r => r.age >= 60 || r.senior_citizens_count > 0).length
  const disabledCount = residents.filter(r => r.has_disabled || (r.disability_type && r.disability_type !== 'No Disability')).length
  const widows = residents.filter(r => r.marital_status === 'Widowed' || r.has_widow).length
  const chronicPatients = Math.round(seniorCitizens * 0.35)
  const healthInsuranceCoverage = residents.filter(r => r.previous_scheme_benefits?.some(b => b.toLowerCase().includes('health') || b.toLowerCase().includes('insurance')) || r.has_bank_account).length

  // 5. HOUSING & INFRASTRUCTURE
  const ownHouses = residents.filter(r => r.own_land || r.house_number).length
  const rentalHouses = Math.max(0, residents.length - ownHouses)
  const noToiletHouses = Math.round(residents.length * 0.12)
  const drinkingWaterCoverage = Math.round(residents.length * 0.88)
  const electricityCoverage = Math.round(residents.length * 0.96)
  const roadConnectivity = Math.round(residents.length * 0.92)
  const internetCoverage = residents.filter(r => r.has_internet || r.has_smartphone).length

  // 6. FINANCIAL INCLUSION
  const bankAccountsCount = residents.filter(r => r.has_bank_account).length
  const jandhanAccountsCount = residents.filter(r => r.has_jandhan_account).length
  const activeSHGMembers = residents.filter(r => r.shg_member).length
  const womenEntrepreneurs = residents.filter(r => r.gender === 'Female' && (r.entrepreneur || r.business_vertical)).length
  const loansAvailedCount = residents.filter(r => r.interested_govt_loans || (r.previous_scheme_benefits?.length || 0) > 0).length
  const pensionBeneficiariesCount = residents.filter(r => r.marital_status === 'Widowed' || r.age >= 60).length

  // 7. DEMOGRAPHICS
  const genderRatio = male > 0 ? Math.round((female / male) * 1000) : 980
  const avgFamilySize = residents.length > 0 ? (totalPopulation / residents.length).toFixed(1) : '4.2'

  // Calculate Empowerment & Overall Village Development Indices (0-100)
  const coverageRate = womenEligible > 0 ? (womenBenefited / womenEligible) * 100 : 50
  const digitalRate = female > 0 ? (residents.filter(r => r.gender === 'Female' && r.digital_literate).length / female) * 100 : 50
  const shgRate = female > 0 ? (activeSHGMembers / female) * 100 : 50
  const bankRate = female > 0 ? (residents.filter(r => r.gender === 'Female' && r.has_bank_account).length / female) * 100 : 50

  const empowermentIndex = Math.round(
    (coverageRate * 0.3) + (digitalRate * 0.2) + (shgRate * 0.25) + (bankRate * 0.25)
  )

  const overallDevelopmentIndex = Math.round(
    (literacyRate * 0.2) + (employmentRate * 0.2) + (empowermentIndex * 0.2) + ((bankAccountsCount / (residents.length || 1)) * 20) + 18
  )

  // Village Heatmap Scores computed live
  const villageScores = ['Kumarpuram', 'Sakthinagar', 'Vetrikovil', 'Mullaivayal', 'Kaligapuram', 'Periyakadu', 'Ariyanayagi', 'Kaviyarkulam'].map(v => {
    const vResidents = residents.filter(r => r.village === v)
    const vWomen = vResidents.filter(r => r.gender === 'Female').length
    const vSHG = vResidents.filter(r => r.shg_member).length
    const vBenefited = vResidents.filter(r => (r.previous_scheme_benefits?.length || 0) > 0).length
    const score = vResidents.length === 0 ? 45 : Math.min(100, Math.round(((vSHG * 15) + (vBenefited * 20) + (vResidents.length * 10))))

    return {
      village: v,
      score,
      women: vWomen,
      shg: vSHG,
      verified: vResidents.filter(r => r.verification_status === 'Verified').length,
      total: vResidents.length
    }
  })

  return {
    totalPopulation,
    totalFamilies,
    male,
    female,
    transgender,
    genderRatio,
    avgFamilySize,
    womenRegistered,
    womenEligible,
    womenBenefited,
    womenYetToApply,
    empowermentIndex,
    overallDevelopmentIndex,

    // Education
    literacyRate,
    noFormalEdu,
    primaryEdu,
    middleEdu,
    highSchoolEdu,
    higherSecEdu,
    diplomaEdu,
    undergradEdu,
    postgradEdu,
    schoolStudents,
    collegeStudents,
    totalStudents,
    schoolDropouts,

    // Agriculture
    totalFarmers,
    womenFarmers,
    landOwners,
    totalCultivableAcres,
    irrigatedAcres,
    livestockOwners,

    // Employment
    govtEmployees,
    privateEmployees,
    selfEmployed,
    businessOwners,
    dailyWagers,
    unemployedCount,
    retiredCount,
    employmentRate,

    // Health
    pregnantWomen,
    lactatingMothers,
    seniorCitizens,
    disabledCount,
    widows,
    chronicPatients,
    healthInsuranceCoverage,

    // Housing & Infra
    ownHouses,
    rentalHouses,
    noToiletHouses,
    drinkingWaterCoverage,
    electricityCoverage,
    roadConnectivity,
    internetCoverage,

    // Financial
    bankAccountsCount,
    jandhanAccountsCount,
    activeSHGMembers,
    womenEntrepreneurs,
    loansAvailedCount,
    pensionBeneficiariesCount,

    // Village scores & admin status
    villageScores,
    pendingVerifications: allResidents.filter(r => r.verification_status === 'Pending').length,
    verifiedCount: allResidents.filter(r => r.verification_status === 'Verified').length,
    rejectedCount: allResidents.filter(r => r.verification_status === 'Rejected').length,
  }
}

