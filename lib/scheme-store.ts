import { getStoredResidents, type ResidentRecord } from './resident-store'

export interface SchemeRecord {
  id: string
  title: string
  name?: string
  category: 'Women Empowerment' | 'Agriculture' | 'Education' | 'Health' | 'Housing' | 'Pension' | 'Employment' | 'Business' | 'Student Scholarship' | 'Livestock' | 'Infrastructure' | 'Other'
  type: 'Central Government' | 'State Government' | 'District' | 'Panchayat'
  description: string
  benefits_list: string[]
  benefit_details: {
    type: string
    amount: string
    frequency: string
  }
  launch_date: string
  closing_date: string
  status: 'active' | 'upcoming' | 'closed' | 'draft' | 'published'
  
  // Step 2 Eligibility
  eligibility: {
    min_age?: number
    max_age?: number
    gender?: 'Male' | 'Female' | 'All'
    occupation?: string[]
    income_range?: string[]
    education?: string[]
    land_ownership?: 'No Land' | 'Agricultural' | 'Residential' | 'Commercial' | 'Any'
    land_size_acres?: number
    disability?: 'Yes' | 'No' | 'Any'
    marital_status?: string[]
    village_filter?: string
    ward_filter?: string
    category_filter?: string[]
  }

  // Step 3 Documents
  required_documents: string[]

  // Step 4 Application Method
  application_method: {
    type: 'Online' | 'Offline' | 'Both'
    online_url?: string
    official_website?: string
    redirection_link?: string
    office_name?: string
    officer_name?: string
    office_address?: string
    working_hours?: string
    contact_number?: string
    maps_location?: string
  }

  // Step 5 Media
  media: {
    poster_url?: string
    pdf_url?: string
    brochure_url?: string
    video_url?: string
  }

  // Step 6 AI Checker
  ai_checker_enabled: boolean

  // Step 8 Important Info
  important_info: {
    faqs: { question: string; answer: string }[]
    terms_and_conditions?: string
    helpline_number?: string
    official_website?: string
    official_email?: string
  }

  // Step 9 AI Summary
  ai_summary: string

  created_at: string
  updated_at: string
}

export const INITIAL_SCHEMES: SchemeRecord[] = [
  {
    id: 'SCH-001',
    title: 'Kalaignar Magalir Urimai Thittam',
    name: 'Kalaignar Magalir Urimai Thittam',
    category: 'Women Empowerment',
    type: 'State Government',
    description: 'Direct financial assistance of ₹1,000 monthly for women heads of eligible households across Tamil Nadu to improve livelihood standard, economic autonomy, and nutrition.',
    benefits_list: [
      '₹1,000 Direct Monthly Bank Transfer',
      'Priority access to Self Help Group loans',
      'Free financial literacy training'
    ],
    benefit_details: {
      type: 'Cash Assistance',
      amount: '₹1,000',
      frequency: 'Monthly'
    },
    launch_date: '2023-09-15',
    closing_date: '2027-12-31',
    status: 'active',
    eligibility: {
      min_age: 21,
      max_age: 65,
      gender: 'Female',
      occupation: ['Homemaker', 'Daily Wage Worker', 'Agricultural Labourer', 'Self Employed'],
      income_range: ['Below ₹1,00,000', '₹1,00,000 – ₹2,50,000'],
      education: ['Any'],
      land_ownership: 'Any',
      disability: 'Any',
      marital_status: ['Single', 'Married', 'Widow', 'Divorced']
    },
    required_documents: ['Aadhaar Card', 'Ration Card', 'Bank Passbook', 'Income Certificate'],
    application_method: {
      type: 'Both',
      online_url: 'https://kmut.tn.gov.in',
      official_website: 'https://kmut.tn.gov.in',
      office_name: 'Block Development Office (BDO) GramSeva Center',
      officer_name: 'Welfare Extension Officer',
      office_address: 'Main Road, Village Block Headquarters',
      working_hours: '9:30 AM - 5:30 PM (Mon-Sat)',
      contact_number: '1800-425-1000',
      maps_location: 'https://maps.google.com/?q=BDO+Office'
    },
    media: {
      poster_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      pdf_url: '#',
      brochure_url: '#',
      video_url: '#'
    },
    ai_checker_enabled: true,
    important_info: {
      faqs: [
        { question: 'Is there an age relaxation for widows?', answer: 'Yes, eligible widows above 18 years can apply with valid death certificate of spouse.' },
        { question: 'How is money transferred?', answer: 'Directly deposited into your Aadhaar-seeded bank account on the 15th of every month.' }
      ],
      terms_and_conditions: 'Applicant household annual electricity consumption must be below 3600 units.',
      helpline_number: '1800-425-1000',
      official_website: 'https://kmut.tn.gov.in',
      official_email: 'support.kmut@tn.gov.in'
    },
    ai_summary: 'Provides ₹1,000 direct monthly cash assistance to women household heads aged 21–65 with annual family income below ₹2.5 lakh.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-07-25T00:00:00Z'
  },
  {
    id: 'SCH-002',
    title: 'PM Kisan Samman Nidhi Scheme',
    name: 'PM Kisan Samman Nidhi Scheme',
    category: 'Agriculture',
    type: 'Central Government',
    description: 'Income support scheme for all landholding farmer families across the country to enable them to meet agricultural inputs and domestic needs.',
    benefits_list: [
      '₹6,000 Annual cash benefit in 3 equal installments of ₹2,000',
      'Direct Benefit Transfer (DBT) into bank account',
      'Subsidy on Kisan Credit Card loans'
    ],
    benefit_details: {
      type: 'Cash Assistance',
      amount: '₹6,000',
      frequency: 'Annual'
    },
    launch_date: '2019-02-24',
    closing_date: '2028-12-31',
    status: 'active',
    eligibility: {
      min_age: 18,
      max_age: 80,
      gender: 'All',
      occupation: ['Farmer', 'Agricultural Labourer'],
      income_range: ['Below ₹1,00,000', '₹1,00,000 – ₹2,50,000', '₹2,50,000 – ₹5,00,000'],
      land_ownership: 'Agricultural',
      disability: 'Any'
    },
    required_documents: ['Aadhaar Card', 'Land Document', 'Bank Passbook', 'Farmer Certificate'],
    application_method: {
      type: 'Online',
      online_url: 'https://pmkisan.gov.in',
      official_website: 'https://pmkisan.gov.in'
    },
    media: {
      poster_url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
      pdf_url: '#'
    },
    ai_checker_enabled: true,
    important_info: {
      faqs: [
        { question: 'Is e-KYC mandatory for PM Kisan?', answer: 'Yes, mandatory Aadhaar e-KYC must be completed via OTP or bio-metric authentication.' }
      ],
      helpline_number: '155261 / 011-24300606',
      official_website: 'https://pmkisan.gov.in'
    },
    ai_summary: 'Provides ₹6,000 annual direct income support in 3 installments to landholding farmer families with cultivable land.',
    created_at: '2026-01-05T00:00:00Z',
    updated_at: '2026-07-25T00:00:00Z'
  },
  {
    id: 'SCH-003',
    title: 'Moovalur Ramamirtham Ammaiyar Higher Education Scheme (Pudhumai Penn)',
    name: 'Moovalur Ramamirtham Ammaiyar Higher Education Scheme (Pudhumai Penn)',
    category: 'Student Scholarship',
    type: 'State Government',
    description: 'Financial assistance of ₹1,000 per month for female students who studied from Class 6 to 12 in Government schools and are now pursuing higher education.',
    benefits_list: [
      '₹1,000 Monthly cash stipend throughout degree completion',
      'Free Laptop scheme priority',
      'Career counseling and internship support'
    ],
    benefit_details: {
      type: 'Scholarship',
      amount: '₹1,000',
      frequency: 'Monthly'
    },
    launch_date: '2022-09-05',
    closing_date: '2027-06-30',
    status: 'active',
    eligibility: {
      min_age: 17,
      max_age: 25,
      gender: 'Female',
      occupation: ['Student'],
      education: ['Undergraduate', 'Diploma', 'Postgraduate'],
      income_range: ['Below ₹1,00,000', '₹1,00,000 – ₹2,50,000', '₹2,50,000 – ₹5,00,000']
    },
    required_documents: ['Aadhaar Card', 'Transfer Certificate', 'Bank Passbook', 'Passport Photo'],
    application_method: {
      type: 'Online',
      online_url: 'https://penkalvi.tn.gov.in',
      official_website: 'https://penkalvi.tn.gov.in'
    },
    media: {
      poster_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
    },
    ai_checker_enabled: true,
    important_info: {
      faqs: [
        { question: 'Can private college students apply?', answer: 'Yes, provided the student completed schooling (6th-12th) in a Tamil Nadu Government school.' }
      ],
      helpline_number: '1800-425-0111'
    },
    ai_summary: 'Grants ₹1,000 monthly financial aid to female students pursuing higher education who studied in government schools from Class 6 to 12.',
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-07-25T00:00:00Z'
  }
]

const SCHEME_STORAGE_KEY = 'gramseva_scheme_database_v2'

export function getStoredSchemes(): SchemeRecord[] {
  if (typeof window === 'undefined') return INITIAL_SCHEMES
  try {
    const raw = localStorage.getItem(SCHEME_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(SCHEME_STORAGE_KEY, JSON.stringify(INITIAL_SCHEMES))
      return INITIAL_SCHEMES
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_SCHEMES
  }
}

export function saveStoredSchemes(schemes: SchemeRecord[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SCHEME_STORAGE_KEY, JSON.stringify(schemes))
  window.dispatchEvent(new CustomEvent('gramseva_scheme_db_updated'))
}

export function getLatestSchemes(limit: number = 4): SchemeRecord[] {
  const schemes = getStoredSchemes().filter(s => s.status !== 'draft')
  schemes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return schemes.slice(0, limit)
}

export function saveScheme(schemeData: Partial<SchemeRecord>): SchemeRecord {
  const schemes = getStoredSchemes()
  const now = new Date().toISOString()
  
  let newScheme: SchemeRecord
  if (schemeData.id) {
    const idx = schemes.findIndex(s => s.id === schemeData.id)
    if (idx !== -1) {
      newScheme = {
        ...schemes[idx],
        ...schemeData,
        updated_at: now,
      } as SchemeRecord
      schemes[idx] = newScheme
    } else {
      newScheme = {
        ...INITIAL_SCHEMES[0],
        ...schemeData,
        id: schemeData.id,
        created_at: now,
        updated_at: now,
      } as SchemeRecord
      schemes.unshift(newScheme)
    }
  } else {
    const id = `SCH-${Date.now().toString().slice(-4)}`
    newScheme = {
      id,
      title: schemeData.title || schemeData.name || 'New Welfare Scheme',
      name: schemeData.title || schemeData.name || 'New Welfare Scheme',
      category: schemeData.category || 'Women Empowerment',
      type: schemeData.type || 'State Government',
      description: schemeData.description || '',
      benefits_list: schemeData.benefits_list || [],
      benefit_details: schemeData.benefit_details || { type: 'Subsidy', amount: '₹5,000', frequency: 'One-time' },
      launch_date: schemeData.launch_date || new Date().toISOString().split('T')[0],
      closing_date: schemeData.closing_date || '2027-12-31',
      status: schemeData.status || 'active',
      eligibility: schemeData.eligibility || { gender: 'All' },
      required_documents: schemeData.required_documents || ['Aadhaar Card', 'Ration Card'],
      application_method: schemeData.application_method || { type: 'Online' },
      media: schemeData.media || {},
      ai_checker_enabled: schemeData.ai_checker_enabled ?? true,
      important_info: schemeData.important_info || { faqs: [] },
      ai_summary: schemeData.ai_summary || '',
      created_at: now,
      updated_at: now,
    }
    schemes.unshift(newScheme)
  }

  saveStoredSchemes(schemes)

  // Trigger automated notification event for eligible residents
  if (typeof window !== 'undefined') {
    const notification = {
      id: `NOTIF-${Date.now()}`,
      title: `🎉 New Government Scheme Published: ${newScheme.title}`,
      message: `The BDO Admin has deployed "${newScheme.title}". Check your eligibility now!`,
      date: new Date().toLocaleString(),
      type: 'scheme',
      scheme_id: newScheme.id
    }
    const notifs = JSON.parse(localStorage.getItem('gramseva_notifications') || '[]')
    notifs.unshift(notification)
    localStorage.setItem('gramseva_notifications', JSON.stringify(notifs))
  }

  return newScheme
}

// ─── TARGET BENEFICIARY ESTIMATOR ──────────────────────────────────────────────
export function estimateTargetBeneficiaries(eligibility: SchemeRecord['eligibility']) {
  const residents = getStoredResidents()
  
  let eligibleWomen = 0
  let eligibleFarmers = 0
  let eligibleStudents = 0
  let eligibleWidows = 0
  const villageBreakdown: Record<string, number> = {}

  residents.forEach(r => {
    let matches = true

    // Gender check
    if (eligibility.gender && eligibility.gender !== 'All' && r.gender !== eligibility.gender) {
      matches = false
    }
    // Age check
    if (eligibility.min_age !== undefined && r.age < eligibility.min_age) matches = false
    if (eligibility.max_age !== undefined && r.age > eligibility.max_age) matches = false

    // Occupation check
    if (eligibility.occupation && eligibility.occupation.length > 0 && !eligibility.occupation.includes('Any')) {
      if (!eligibility.occupation.includes(r.occupation)) matches = false
    }

    // Disability check
    if (eligibility.disability === 'Yes' && !r.has_disabled) matches = false

    // Marital check
    if (eligibility.marital_status && eligibility.marital_status.length > 0 && !eligibility.marital_status.includes('Any')) {
      if (!eligibility.marital_status.includes(r.marital_status)) matches = false
    }

    if (matches) {
      if (r.gender === 'Female') eligibleWomen++
      if (r.occupation === 'Farmer') eligibleFarmers++
      if (r.occupation === 'Student') eligibleStudents++
      if (r.has_widow || r.marital_status === 'Widowed') eligibleWidows++

      villageBreakdown[r.village] = (villageBreakdown[r.village] || 0) + 1
    }
  })

  const totalEligible = Object.values(villageBreakdown).reduce((a, b) => a + b, 0)

  return {
    totalEligible,
    eligibleWomen,
    eligibleFarmers,
    eligibleStudents,
    eligibleWidows,
    villageBreakdown
  }
}

// ─── AI ELIGIBILITY EVALUATOR ──────────────────────────────────────────────────
export function evaluateResidentEligibility(scheme: SchemeRecord, resident: ResidentRecord) {
  const criteria = scheme.eligibility
  const matched: string[] = []
  const missing: string[] = []

  // 1. Age
  if (criteria.min_age !== undefined || criteria.max_age !== undefined) {
    const min = criteria.min_age ?? 0
    const max = criteria.max_age ?? 120
    if (resident.age >= min && resident.age <= max) {
      matched.push(`Age ${resident.age} is within required range (${min}–${max} years)`)
    } else {
      missing.push(`Age requirement: ${min}–${max} years (Current age: ${resident.age})`)
    }
  }

  // 2. Gender
  if (criteria.gender && criteria.gender !== 'All') {
    if (resident.gender === criteria.gender) {
      matched.push(`Gender requirement (${criteria.gender}) satisfied`)
    } else {
      missing.push(`Scheme restricted to ${criteria.gender} applicants only`)
    }
  }

  // 3. Occupation
  if (criteria.occupation && criteria.occupation.length > 0 && !criteria.occupation.includes('Any')) {
    if (criteria.occupation.includes(resident.occupation)) {
      matched.push(`Occupation (${resident.occupation}) qualifies for scheme`)
    } else {
      missing.push(`Occupation must be one of: ${criteria.occupation.join(', ')}`)
    }
  }

  // 4. Income Range
  if (criteria.income_range && criteria.income_range.length > 0 && !criteria.income_range.includes('Any')) {
    if (criteria.income_range.includes(resident.annual_income_range)) {
      matched.push(`Annual income (${resident.annual_income_range}) is within eligible limit`)
    } else {
      missing.push(`Income range must be: ${criteria.income_range.join(', ')}`)
    }
  }

  // 5. Disability
  if (criteria.disability === 'Yes') {
    if (resident.has_disabled) {
      matched.push(`Differently-abled status verified`)
    } else {
      missing.push(`Requires registered Differently-Abled status`)
    }
  }

  // Determine overall status
  let status: 'Eligible' | 'Partially Eligible' | 'Not Eligible' = 'Eligible'
  let explanation = ''

  if (missing.length === 0) {
    status = 'Eligible'
    explanation = `🎉 Congratulations! Your verified resident profile satisfies all ${matched.length} eligibility criteria for "${scheme.title}".`
  } else if (missing.length === 1 && matched.length > 0) {
    status = 'Partially Eligible'
    explanation = `⚠️ You satisfy ${matched.length} criteria but missing 1 requirement: ${missing[0]}.`
  } else {
    status = 'Not Eligible'
    explanation = `❌ Profile does not meet ${missing.length} requirements: ${missing.slice(0, 2).join('; ')}.`
  }

  return {
    status,
    matched,
    missing,
    explanation
  }
}
