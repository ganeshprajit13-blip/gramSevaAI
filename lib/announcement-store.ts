export interface AnnouncementRecord {
  id: string
  title: string
  description: string
  image: string
  image_url?: string
  type: 'scheme' | 'women' | 'farmer' | 'health' | 'campaign' | 'festival' | 'emergency' | 'general'
  priority: number
  startDate: string
  endDate: string
  createdBy: string
  createdAt: string
  isActive: boolean
  
  // Backwards compatibility optional fields
  category?: 'Gram Sabha' | 'Health Camp' | 'Awareness Rally' | 'Crop Subsidy Distribution' | 'Public Works' | 'Emergency Alert' | 'Other' | string
  date?: string
  start_time?: string
  end_time?: string
  venue?: string
  village?: string
  ward_number?: string
  maps_link?: string
  eligibility_restrictions?: string
  organizer?: string
  contact_number?: string
  status?: 'Published' | 'Draft' | 'Expired'
  created_at?: string
}

export const INITIAL_ANNOUNCEMENTS: AnnouncementRecord[] = [
  {
    id: 'ANC-2026-001',
    title: 'New Government Scheme: PM Vishwakarma Yojana Support',
    description: 'Financial aid up to ₹3 Lakh, collateral-free credit, skill training & toolkits for rural artisans, traditional craftsmen, and self-employed villagers.',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    type: 'scheme',
    priority: 10,
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    createdBy: 'BDO Office - Rural Development',
    createdAt: '2026-07-20T09:00:00Z',
    isActive: true,
    category: 'Gram Sabha',
    date: '2026-08-05',
    start_time: '10:00 AM',
    end_time: '01:00 PM',
    venue: 'Gram Panchayat Community Hall, Main Road',
    village: 'All Villages',
    ward_number: 'Ward 3',
    maps_link: 'https://maps.google.com/?q=Panchayat+Hall',
    eligibility_restrictions: 'Open to all traditional artisans and craftsmen (18+ yrs).',
    organizer: 'Block Development Officer (BDO)',
    contact_number: '1800-425-1000',
    status: 'Published'
  },
  {
    id: 'ANC-2026-002',
    title: "Women's Welfare Program: Magalir Urimai Thittam Direct Aid",
    description: 'Monthly direct benefit transfer of ₹1,000 to eligible women heads of households, along with micro-entrepreneurship training and SHG support.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    type: 'women',
    priority: 9,
    startDate: '2026-08-01',
    endDate: '2026-11-30',
    createdBy: 'Women Development Department',
    createdAt: '2026-07-21T11:00:00Z',
    isActive: true,
    category: 'Awareness Rally',
    date: '2026-08-10',
    start_time: '09:30 AM',
    end_time: '03:00 PM',
    venue: 'Panchayat Union Office Ground',
    village: 'All Block Villages',
    ward_number: 'Ward 1',
    maps_link: 'https://maps.google.com/?q=Union+Office',
    eligibility_restrictions: 'Women heads of household aged 21-55 years with annual income < 2.5 Lakh.',
    organizer: 'District Women Empowerment Officer',
    contact_number: '04546-281001',
    status: 'Published'
  },
  {
    id: 'ANC-2026-003',
    title: 'Farmer Subsidy Drive: High-Yield Seeds & Solar Pumps',
    description: 'Distribution of high-yield paddy seed mini-kits at 50% government subsidy, solar irrigation pump subsidies, and soil testing kits under PM Krishi Sinchayee Yojana.',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    type: 'farmer',
    priority: 8,
    startDate: '2026-08-01',
    endDate: '2026-10-15',
    createdBy: 'Agriculture Extension Wing',
    createdAt: '2026-07-24T14:00:00Z',
    isActive: true,
    category: 'Crop Subsidy Distribution',
    date: '2026-08-18',
    start_time: '08:30 AM',
    end_time: '02:00 PM',
    venue: 'Agricultural Extension Depot, Main Market Yard',
    village: 'All Agricultural Villages',
    ward_number: 'Ward 5',
    maps_link: 'https://maps.google.com/?q=Agri+Depot',
    eligibility_restrictions: 'Registered Farmers with Aadhaar & Land Chitta copy.',
    organizer: 'Assistant Director of Agriculture & BDO Officer',
    contact_number: '04546-281005',
    status: 'Published'
  },
  {
    id: 'ANC-2026-004',
    title: 'Health Camp / Vaccination & Free Eye Screening Drive',
    description: 'Comprehensive village health camp offering free doctor consultations, blood pressure & sugar checks, eye examination, free spectacles distribution, and pediatric vaccinations.',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    type: 'health',
    priority: 7,
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    createdBy: 'District Health Mission',
    createdAt: '2026-07-22T10:30:00Z',
    isActive: true,
    category: 'Health Camp',
    date: '2026-08-12',
    start_time: '09:00 AM',
    end_time: '04:00 PM',
    venue: 'Primary Health Center (PHC), Ward 2',
    village: 'Chinnamanur & Surrounding Wards',
    ward_number: 'Ward 2',
    maps_link: 'https://maps.google.com/?q=PHC+Center',
    eligibility_restrictions: 'Free entry for all village residents, senior citizens and children.',
    organizer: 'District Health Society & BDO Medical Extension Wing',
    contact_number: '04546-281002',
    status: 'Published'
  },
  {
    id: 'ANC-2026-005',
    title: 'Student Higher Education Merit Scholarship 2026',
    description: 'Financial support up to ₹20,000/year for meritorious rural students pursuing Diploma, Engineering, Medical, and Degree courses.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    type: 'scheme',
    priority: 6,
    startDate: '2026-08-01',
    endDate: '2026-10-31',
    createdBy: 'Education Extension Dept',
    createdAt: '2026-07-23T08:00:00Z',
    isActive: true,
    category: 'Gram Sabha',
    date: '2026-08-25',
    start_time: '10:00 AM',
    end_time: '02:00 PM',
    venue: 'Government Higher Secondary School Auditorium',
    village: 'All Villages',
    ward_number: 'Ward 4',
    maps_link: 'https://maps.google.com/?q=Govt+School',
    eligibility_restrictions: 'Students passing Class 10/12 with >= 60% marks and family income < 2.5 Lakh.',
    organizer: 'District Educational Officer',
    contact_number: '04546-281008',
    status: 'Published'
  },
  {
    id: 'ANC-2026-006',
    title: 'Harvest Festival Greeting & Special Ration Distribution Alert',
    description: 'Announcement of festival gift hampers, free sugarcane and rice distribution for all smart ration cardholders across Panchayat Fair Price Shops.',
    image: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&w=800&q=80',
    type: 'festival',
    priority: 5,
    startDate: '2026-08-01',
    endDate: '2026-09-15',
    createdBy: 'Civil Supplies Dept',
    createdAt: '2026-07-25T16:00:00Z',
    isActive: true,
    category: 'Gram Sabha',
    date: '2026-09-01',
    start_time: '08:00 AM',
    end_time: '05:00 PM',
    venue: 'All Panchayat Ration Depots',
    village: 'All Villages',
    ward_number: 'All Wards',
    maps_link: 'https://maps.google.com/?q=Ration+Depot',
    eligibility_restrictions: 'Valid Smart Ration Cardholders.',
    organizer: 'Department of Civil Supplies & Consumer Protection',
    contact_number: '1967',
    status: 'Published'
  }
]

const ANNOUNCEMENT_STORAGE_KEY = 'gramseva_announcements_db_v3'

export function getStoredAnnouncements(): AnnouncementRecord[] {
  if (typeof window === 'undefined') return INITIAL_ANNOUNCEMENTS
  try {
    const raw = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS))
      return INITIAL_ANNOUNCEMENTS
    }
    const items: AnnouncementRecord[] = JSON.parse(raw)
    // Fill in default fields if missing from older versions
    return items.map(item => ({
      ...item,
      image: item.image || item.image_url || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
      type: item.type || 'general',
      priority: typeof item.priority === 'number' ? item.priority : 5,
      startDate: item.startDate || item.date || new Date().toISOString().split('T')[0],
      endDate: item.endDate || '2026-12-31',
      createdBy: item.createdBy || item.organizer || 'BDO Office',
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      isActive: typeof item.isActive === 'boolean' ? item.isActive : item.status !== 'Draft'
    }))
  } catch {
    return INITIAL_ANNOUNCEMENTS
  }
}

export function saveStoredAnnouncements(items: AnnouncementRecord[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('gramseva_announcements_updated'))
}

export function saveAnnouncement(data: Partial<AnnouncementRecord>): AnnouncementRecord {
  const items = getStoredAnnouncements()
  const now = new Date().toISOString()

  let record: AnnouncementRecord
  if (data.id) {
    const idx = items.findIndex(i => i.id === data.id)
    if (idx !== -1) {
      record = { ...items[idx], ...data } as AnnouncementRecord
      items[idx] = record
    } else {
      record = { ...INITIAL_ANNOUNCEMENTS[0], ...data, id: data.id } as AnnouncementRecord
      items.unshift(record)
    }
  } else {
    const id = `ANC-2026-${Date.now().toString().slice(-4)}`
    const img = data.image || data.image_url || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'
    record = {
      id,
      title: data.title || 'New Village Announcement',
      description: data.description || '',
      image: img,
      image_url: img,
      type: data.type || 'general',
      priority: data.priority ?? 5,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || '2026-12-31',
      createdBy: data.createdBy || 'BDO Office',
      createdAt: now,
      isActive: data.isActive ?? true,
      category: data.category || 'Gram Sabha',
      date: data.date || data.startDate || new Date().toISOString().split('T')[0],
      start_time: data.start_time || '10:00 AM',
      end_time: data.end_time || '01:00 PM',
      venue: data.venue || 'Gram Panchayat Hall',
      village: data.village || 'All Villages',
      ward_number: data.ward_number || 'Ward 1',
      maps_link: data.maps_link || 'https://maps.google.com/?q=BDO+Office',
      eligibility_restrictions: data.eligibility_restrictions || 'Open to all residents.',
      organizer: data.organizer || 'BDO Office',
      contact_number: data.contact_number || '1800-425-1000',
      status: data.isActive === false ? 'Draft' : 'Published',
      created_at: now
    }
    items.unshift(record)
  }

  // Sort by priority descending
  items.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

  saveStoredAnnouncements(items)

  // Dispatch alert to residents' notifications
  if (typeof window !== 'undefined') {
    const notification = {
      id: `NOTIF-ANC-${Date.now()}`,
      title: `📢 New Village Announcement: ${record.title}`,
      message: `Event on ${record.startDate || record.date} at ${record.venue || 'Panchayat Hall'}.`,
      date: new Date().toLocaleString(),
      type: 'announcement',
    }
    const notifs = JSON.parse(localStorage.getItem('gramseva_notifications') || '[]')
    notifs.unshift(notification)
    localStorage.setItem('gramseva_notifications', JSON.stringify(notifs))
  }

  return record
}

export function deleteAnnouncement(id: string) {
  const items = getStoredAnnouncements().filter(i => i.id !== id)
  saveStoredAnnouncements(items)
}

