export interface ServiceRecord {
  id: string
  name: string
  description: string
  department: string
  image: string
  status: 'Available' | 'New' | 'Under Maintenance'
  category: string
  created_at: string
  updated_at?: string
  isActive?: boolean
}

export const INITIAL_SERVICES: ServiceRecord[] = [
  {
    id: 'SVC-001',
    name: 'Birth Certificate Registration',
    description: 'Apply for newborn birth registration and official government digital certificate issuance within 21 days.',
    department: 'Revenue & Civil Registration',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    status: 'Available',
    category: 'Civil Registration',
    created_at: '2026-07-20T10:00:00Z',
    isActive: true
  },
  {
    id: 'SVC-002',
    name: 'Income & Revenue Certificate',
    description: 'Official revenue income declaration certificate mandatory for central & state welfare scheme applications.',
    department: 'Taluk Revenue Department',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    status: 'New',
    category: 'Revenue Services',
    created_at: '2026-07-22T09:30:00Z',
    isActive: true
  },
  {
    id: 'SVC-003',
    name: 'Land Records & Patta Transfer',
    description: 'Online land mutation, Chitta extract download, and agricultural land ownership record transfer.',
    department: 'Land Survey & Settlement',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    status: 'Available',
    category: 'Land Revenue',
    created_at: '2026-07-23T14:15:00Z',
    isActive: true
  },
  {
    id: 'SVC-004',
    name: 'Household Water Pipeline Connection',
    description: 'Application for new drinking water tap connection and pipeline maintenance under Jal Jeevan Mission.',
    department: 'Panchayat Union Water Board',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    status: 'New',
    category: 'Public Utilities',
    created_at: '2026-07-24T16:00:00Z',
    isActive: true
  },
  {
    id: 'SVC-005',
    name: 'Community Caste Certificate',
    description: 'Official caste and community verification certificate for education admissions and government jobs.',
    department: 'Revenue Department',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    status: 'Available',
    category: 'Revenue Services',
    created_at: '2026-07-25T11:00:00Z',
    isActive: true
  }
]

const SERVICE_STORAGE_KEY = 'gramseva_services_db_v1'

export function getStoredServices(): ServiceRecord[] {
  if (typeof window === 'undefined') return INITIAL_SERVICES
  try {
    const raw = localStorage.getItem(SERVICE_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(SERVICE_STORAGE_KEY, JSON.stringify(INITIAL_SERVICES))
      return INITIAL_SERVICES
    }
    const items: ServiceRecord[] = JSON.parse(raw)
    return items.map(s => ({
      ...s,
      isActive: s.isActive !== false
    }))
  } catch {
    return INITIAL_SERVICES
  }
}

export function saveStoredServices(services: ServiceRecord[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SERVICE_STORAGE_KEY, JSON.stringify(services))
  window.dispatchEvent(new CustomEvent('gramseva_services_db_updated'))
}

export function getLatestServices(limit: number = 4): ServiceRecord[] {
  const items = getStoredServices().filter(s => s.isActive !== false)
  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return items.slice(0, limit)
}

export function saveService(serviceData: Partial<ServiceRecord>): ServiceRecord {
  const services = getStoredServices()
  const now = new Date().toISOString()
  
  let newService: ServiceRecord
  if (serviceData.id) {
    const idx = services.findIndex(s => s.id === serviceData.id)
    if (idx !== -1) {
      newService = {
        ...services[idx],
        ...serviceData,
        updated_at: now,
      } as ServiceRecord
      services[idx] = newService
    } else {
      newService = {
        ...INITIAL_SERVICES[0],
        ...serviceData,
        id: serviceData.id,
        created_at: now,
        updated_at: now,
      } as ServiceRecord
      services.unshift(newService)
    }
  } else {
    const id = `SVC-${Date.now().toString().slice(-4)}`
    newService = {
      id,
      name: serviceData.name || 'New Village Service',
      description: serviceData.description || '',
      department: serviceData.department || 'Panchayat Office',
      image: serviceData.image || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      status: serviceData.status || 'Available',
      category: serviceData.category || 'General Service',
      created_at: now,
      updated_at: now,
      isActive: serviceData.isActive ?? true
    }
    services.unshift(newService)
  }

  saveStoredServices(services)
  return newService
}

export function deleteService(id: string) {
  const items = getStoredServices().filter(s => s.id !== id)
  saveStoredServices(items)
}
