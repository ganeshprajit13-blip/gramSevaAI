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
    id: 'seed-1', name: 'PM Kisan Samman Nidhi',
    description: 'Financial assistance to small and marginal farmers. Farmers receive ₹6,000 per year in three installments directly to bank accounts.',
    benefits: ['₹6,000 per year', 'Direct Bank Transfer', 'Three installments of ₹2,000'],
    department: 'Agriculture Department', category: 'Agriculture',
    application_mode: 'Online', official_url: 'https://pmkisan.gov.in',
    eligibility_summary: 'Small and marginal farmers with landholding up to 2 hectares',
    status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    eligibility_rules: [{ rules: [{ field: 'farmer_status', operator: '=', value: true, label: 'Must be a farmer' }], logic: 'AND' }]
  },
  {
    id: 'seed-2', name: 'Pradhan Mantri Awas Yojana (Gramin)',
    description: 'Housing scheme to provide pucca houses to houseless families in rural areas.',
    benefits: ['₹1.20 Lakh for plain areas', '₹1.30 Lakh for hilly areas', 'Skilled labour support'],
    department: 'Rural Development', category: 'Housing',
    application_mode: 'Offline', official_url: 'https://pmayg.nic.in',
    eligibility_summary: 'Houseless families with BPL status, SC/ST/Minorities/Disabled preferred',
    status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    eligibility_rules: [{ rules: [{ field: 'annual_income', operator: '<=', value: 100000, label: 'Annual income ≤ ₹1 Lakh' }], logic: 'AND' }]
  },
  {
    id: 'seed-3', name: 'Ayushman Bharat PM-JAY',
    description: 'Health insurance scheme providing coverage up to ₹5 Lakh per family per year.',
    benefits: ['₹5 Lakh health coverage per family per year', 'Cashless treatment', 'Covers 1,949+ procedures'],
    department: 'Health Department', category: 'Health',
    application_mode: 'Both', official_url: 'https://pmjay.gov.in',
    eligibility_summary: 'BPL families and poor/vulnerable population groups',
    status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    eligibility_rules: [{ rules: [{ field: 'annual_income', operator: '<=', value: 200000, label: 'Income ≤ ₹2 Lakh (BPL)' }], logic: 'AND' }]
  },
  {
    id: 'seed-4', name: 'MNREGA Employment Guarantee',
    description: 'Guarantees 100 days of wage employment to rural households for unskilled manual work.',
    benefits: ['100 days guaranteed employment per year', 'Minimum wage as per state', 'Unemployment allowance'],
    department: 'Rural Development', category: 'Employment',
    application_mode: 'Offline', official_url: 'https://nrega.nic.in',
    eligibility_summary: 'Rural households, adult members (18+) willing to do unskilled manual work',
    status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    eligibility_rules: [{ rules: [{ field: 'age', operator: '>=', value: 18, label: 'Age at least 18 years' }], logic: 'AND' }]
  },
  {
    id: 'seed-5', name: 'National Scholarship Portal Scheme',
    description: 'Central sector scholarship for minority community students from Class I to PhD.',
    benefits: ['Pre-matric: Up to ₹1,100/month', 'Post-matric: Up to ₹1,200/month', 'Merit-cum-Means: Up to ₹20,000/year'],
    department: 'Minority Affairs', category: 'Education',
    application_mode: 'Online', official_url: 'https://scholarships.gov.in',
    eligibility_summary: 'Students from minority community, income below ₹2 Lakh, minimum 50% marks',
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
          s.description?.toLowerCase().includes(q) ||
          s.eligibility_summary?.toLowerCase().includes(q)
        )
      }
      if (opts.category) data = data.filter((s) => s.category === opts.category)
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
      if (idx === -1) return null
      data[idx] = { ...data[idx], ...body, id, updated_at: new Date().toISOString() }
      writeJSON(SCHEMES_FILE, data)
      return data[idx]
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
