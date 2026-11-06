/**
 * mock-db.ts
 * File-based mock database used when Supabase is not configured.
 * Stores data in .next/mock-data/ so it persists across HMR cycles.
 */
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const DATA_DIR = path.join(process.cwd(), '.next', 'mock-data')
const SCHEMES_FILE = path.join(DATA_DIR, 'schemes.json')
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
  } catch {
    return fallback
  }
}

function writeJSON(filePath: string, data: unknown) {
  ensureDir()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_SCHEMES = [
  {
    id: 'seed-1', name: 'PM Kisan Samman Nidhi', name_ta: 'பிரதம மந்திரி கிசான் சம்மான் நிதி திட்டம்',
    description: 'Financial assistance to small and marginal farmers. Farmers receive ₹6,000 per year in three installments directly to bank accounts.',
    description_ta: 'விவசாயிகளுக்கு ஆண்டுக்கு ₹6,000 நிதி உதவி வழங்கும் திட்டம். தலா ₹2,000 வீதம் 3 தவணைகளில் நேரடியாக வங்கிக் கணக்கில் வரவு வைக்கப்படுகிறது.',
    benefits: ['₹6,000 per year', 'Direct Bank Transfer', 'Three installments of ₹2,000'],
    benefits_ta: ['ஆண்டுக்கு ₹6,000 உதவித்தொகை', 'நேரடி வங்கி பரிமாற்றம்', '3 தவணைகளில் தலா ₹2,000'],
    department: 'Agriculture Department', category: 'Agriculture', category_ta: 'வேளாண்மை / விவசாயிகள்',
    application_mode: 'Online', official_url: 'https://pmkisan.gov.in',
    eligibility_summary: 'Small and marginal farmers with landholding up to 2 hectares',
    eligibility_summary_ta: '2 ஹெக்டேர் வரை விவசாய நிலம் வைத்துள்ள சிறு மற்றும் குறு விவசாயிகள்',
    status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    eligibility_rules: [{ rules: [{ field: 'farmer_status', operator: '=', value: true, label: 'Must be a farmer' }], logic: 'AND' }]
  },
  {
    id: 'seed-2', name: 'Pradhan Mantri Awas Yojana (Gramin)', name_ta: 'பிரதம மந்திரி ஆவாஸ் யோஜனா (கிராமப்புற வீட்டுவசதி)',
    description: 'Housing scheme to provide pucca houses to houseless families in rural areas.',
    description_ta: 'கிராமப்புறங்களில் வீடற்ற ஏழைக் குடும்பங்களுக்கு கான்கிரீட் நிரந்தர வீடுகள் கட்டித் தரும் திட்டம்.',
    benefits: ['₹1.20 Lakh for plain areas', '₹1.30 Lakh for hilly areas', 'Skilled labour support'],
    benefits_ta: ['சமவெளிப் பகுதிக்கு ₹1.20 லட்சம்', 'மலைப்பகுதிக்கு ₹1.30 லட்சம்', '100 நாள் வேலை திட்ட ஊதிய ஆதரவு'],
    department: 'Rural Development', category: 'Housing', category_ta: 'வீட்டுவசதி',
    application_mode: 'Offline', official_url: 'https://pmayg.nic.in',
    eligibility_summary: 'Houseless families with BPL status, SC/ST/Minorities/Disabled preferred',
    eligibility_summary_ta: 'வறுமைக்கோட்டுக்கு கீழ் உள்ள சொந்த வீடற்ற குடும்பங்கள்',
    status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    eligibility_rules: [{ rules: [{ field: 'annual_income', operator: '<=', value: 100000, label: 'Annual income ≤ ₹1 Lakh' }], logic: 'AND' }]
  },
  {
    id: 'seed-3', name: 'Ayushman Bharat PM-JAY', name_ta: 'ஆயுஷ்மான் பாரத் - முதலமைச்சர் மருத்துவக் காப்பீடு',
    description: 'Health insurance scheme providing coverage up to ₹5 Lakh per family per year.',
    description_ta: 'குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் வரை கட்டணமில்லா மருத்துவச் சிகிச்சையை வழங்கும் மருத்துவக் காப்பீட்டுத் திட்டம்.',
    benefits: ['₹5 Lakh health coverage per family per year', 'Cashless treatment', 'Covers 1,949+ procedures'],
    benefits_ta: ['ஆண்டுக்கு ₹5 லட்சம் குடும்ப மருத்துவக் காப்பீடு', 'பணமில்லா கட்டணமில்லா சிகிச்சை', '1,949+ சிகிச்சைகள்'],
    department: 'Health Department', category: 'Health', category_ta: 'சுகாதாரம் / மருத்துவம்',
    application_mode: 'Both', official_url: 'https://pmjay.gov.in',
    eligibility_summary: 'BPL families and poor/vulnerable population groups',
    eligibility_summary_ta: 'வறுமைக்கோட்டுக்கு கீழ் உள்ள குடும்பங்கள் மற்றும் விளிம்புநிலை மக்கள்',
    status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    eligibility_rules: [{ rules: [{ field: 'annual_income', operator: '<=', value: 200000, label: 'Income ≤ ₹2 Lakh (BPL)' }], logic: 'AND' }]
  },
  {
    id: 'seed-4', name: 'MNREGA Employment Guarantee', name_ta: 'மகாத்மா காந்தி 100 நாள் வேலை உறுதித் திட்டம்',
    description: 'Guarantees 100 days of wage employment to rural households for unskilled manual work.',
    description_ta: 'கிராமப்புற குடும்பங்களுக்கு ஆண்டுக்கு 100 நாட்கள் கூலி வேலைவாய்ப்பை உறுதி செய்யும் சட்டம்.',
    benefits: ['100 days guaranteed employment per year', 'Minimum wage as per state', 'Unemployment allowance'],
    benefits_ta: ['ஆண்டுக்கு 100 நாட்கள் வேலை உறுதி', 'அரசு நிர்ணயித்த குறைந்தபட்ச தினசரி ஊதியம்', 'வேலையில்லா உதவிப்படி'],
    department: 'Rural Development', category: 'Employment', category_ta: 'வேலைவாய்ப்பு',
    application_mode: 'Offline', official_url: 'https://nrega.nic.in',
    eligibility_summary: 'Rural households, adult members (18+) willing to do unskilled manual work',
    eligibility_summary_ta: 'கிராமப்புறங்களில் வசிக்கும் 18 வயது நிரம்பிய உடலுழைப்பு செய்யத் தயாராக உள்ள குடிமக்கள்',
    status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    eligibility_rules: [{ rules: [{ field: 'age', operator: '>=', value: 18, label: 'Age at least 18 years' }], logic: 'AND' }]
  },
  {
    id: 'seed-5', name: 'National Scholarship Portal Scheme', name_ta: 'தேசிய கல்வி உதவித்தொகை தளம் (NSP)',
    description: 'Central sector scholarship for minority community students from Class I to PhD.',
    description_ta: 'சிறுபான்மையினர் மற்றும் ஏழை மாணவர்களுக்கு 1-ஆம் வகுப்பு முதல் முனைவர் பட்டம் வரை கல்வி உதவித்தொகை வழங்கும் திட்டம்.',
    benefits: ['Pre-matric: Up to ₹1,100/month', 'Post-matric: Up to ₹1,200/month', 'Merit-cum-Means: Up to ₹20,000/year'],
    benefits_ta: ['பள்ளி படிப்பு: மாதம் ₹1,100 வரை', 'உயர்கல்வி: மாதம் ₹1,200 வரை', 'தகுதி மற்றும் வருமான அடிப்படையிலான உதவித்தொகை'],
    department: 'Minority Affairs', category: 'Education', category_ta: 'கல்வி',
    application_mode: 'Online', official_url: 'https://scholarships.gov.in',
    eligibility_summary: 'Students from minority community, income below ₹2 Lakh, minimum 50% marks',
    eligibility_summary_ta: 'குடும்ப வருமானம் ₹2 லட்சத்திற்குள் உள்ள தகுதியுடைய மாணவர்கள்',
    status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    eligibility_rules: [{ rules: [{ field: 'annual_income', operator: '<=', value: 200000, label: 'Family income ≤ ₹2 Lakh' }], logic: 'AND' }]
  },
]

// ─── Public API ──────────────────────────────────────────────────────────────

export function isMockMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return (
    !url ||
    url.includes('placeholder') ||
    !key ||
    key.includes('placeholder')
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export const mockDb = {
  schemes: {
    list(opts: { page?: number; limit?: number; search?: string; category?: string; status?: string } = {}) {
      let data: AnyRecord[] = readJSON(SCHEMES_FILE, null as unknown as AnyRecord[])
      if (!data) {
        data = SEED_SCHEMES as AnyRecord[]
        writeJSON(SCHEMES_FILE, data)
      }

      if (opts.search) {
        const q = opts.search.toLowerCase()
        data = data.filter((s) =>
          s.name?.toLowerCase().includes(q) ||
          s.name_ta?.toLowerCase().includes(q) ||
          s.title?.toLowerCase().includes(q) ||
          s.title_ta?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.description_ta?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.category_ta?.toLowerCase().includes(q) ||
          s.eligibility_summary?.toLowerCase().includes(q) ||
          s.eligibility_summary_ta?.toLowerCase().includes(q)
        )
      }
      if (opts.category) data = data.filter((s) => s.category === opts.category || s.category_ta === opts.category)
      if (opts.status) data = data.filter((s) => s.status === opts.status)

      const total = data.length
      const page = opts.page ?? 1
      const limit = opts.limit ?? 12
      const offset = (page - 1) * limit
      const paged = data.slice(offset, offset + limit)

      return { data: paged, count: total }
    },

    get(id: string): AnyRecord | null {
      const data: AnyRecord[] = readJSON(SCHEMES_FILE, SEED_SCHEMES as AnyRecord[])
      return data.find((s) => s.id === id) ?? null
    },

    create(body: AnyRecord): AnyRecord {
      const data: AnyRecord[] = readJSON(SCHEMES_FILE, SEED_SCHEMES as AnyRecord[])
      const now = new Date().toISOString()
      const newScheme = { ...body, id: randomUUID(), created_at: now, updated_at: now }
      data.unshift(newScheme)
      writeJSON(SCHEMES_FILE, data)
      return newScheme
    },

    update(id: string, body: AnyRecord): AnyRecord | null {
      const data: AnyRecord[] = readJSON(SCHEMES_FILE, SEED_SCHEMES as AnyRecord[])
      const idx = data.findIndex((s) => s.id === id)
      if (idx !== -1) {
        data[idx] = { ...data[idx], ...body, id, updated_at: new Date().toISOString() }
        writeJSON(SCHEMES_FILE, data)
        return data[idx]
      }
      return null
    },

    delete(id: string): boolean {
      const data: AnyRecord[] = readJSON(SCHEMES_FILE, SEED_SCHEMES as AnyRecord[])
      const filtered = data.filter((s) => s.id !== id)
      if (filtered.length === data.length) return false
      writeJSON(SCHEMES_FILE, filtered)
      return true
    },
  },

  notifications: {
    list() {
      return readJSON(NOTIFICATIONS_FILE, [] as AnyRecord[])
    },
    create(body: AnyRecord): AnyRecord {
      const data: AnyRecord[] = readJSON(NOTIFICATIONS_FILE, [])
      const n = { ...body, id: randomUUID(), created_at: new Date().toISOString() }
      data.unshift(n)
      writeJSON(NOTIFICATIONS_FILE, data)
      return n
    },
  },
}
