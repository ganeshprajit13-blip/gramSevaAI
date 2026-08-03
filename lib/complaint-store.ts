export interface ComplaintRecord {
  id: string
  resident_uid: string
  resident_name: string
  resident_mobile: string
  village: string
  ward_number: string
  category: 'Drinking Water & Sanitation' | 'Roads & Streetlights' | 'Agricultural Supply & Irrigation' | 'Welfare Scheme Benefit Dispute' | 'Public Distribution System (Ration)' | 'Health & Hygiene' | 'Other'
  title: string
  description: string
  attachment_url?: string
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Resolved' | 'Rejected'
  bdo_remarks?: string
  created_at: string
  updated_at: string
}

export const INITIAL_COMPLAINTS: ComplaintRecord[] = [
  {
    id: 'CMP-2026-001',
    resident_uid: 'demo_kavitha_uid',
    resident_name: 'Kavitha R.',
    resident_mobile: '9876543210',
    village: 'Chinnamanur',
    ward_number: 'Ward 3',
    category: 'Drinking Water & Sanitation',
    title: 'Disrupted Overhead Tank Water Supply in Ward 3 Street 4',
    description: 'The overhead water tank valve has been malfunctioning for the last 4 days. Drinking water supply is disrupted for 45 households during morning hours.',
    attachment_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
    status: 'In Progress',
    bdo_remarks: 'BDO Engineer team dispatched to inspect pipeline and replace damaged 4-inch sluice valve.',
    created_at: '2026-07-22T08:30:00Z',
    updated_at: '2026-07-23T11:00:00Z'
  },
  {
    id: 'CMP-2026-002',
    resident_uid: 'demo_ramesh_uid',
    resident_name: 'Ramesh Kumar',
    resident_mobile: '9845612340',
    village: 'Melur',
    ward_number: 'Ward 1',
    category: 'Roads & Streetlights',
    title: 'Broken LED Streetlights on Primary School Road',
    description: 'Three high-mast solar streetlights near the Panchayati Primary school have been non-functional, causing safety concerns for children and elders at night.',
    status: 'Pending',
    bdo_remarks: 'Assigned to Block Electrical Supervisor for inspection.',
    created_at: '2026-07-24T14:15:00Z',
    updated_at: '2026-07-24T14:15:00Z'
  },
  {
    id: 'CMP-2026-003',
    resident_uid: 'demo_selvi_uid',
    resident_name: 'Selvi M.',
    resident_mobile: '9765432109',
    village: 'Vadapalani',
    ward_number: 'Ward 2',
    category: 'Welfare Scheme Benefit Dispute',
    title: 'Delay in Monthly Pension Deposit for Senior Citizen',
    description: 'Old Age Pension for June and July month not credited to Bank Account. Bank passbook and Aadhaar copy attached.',
    status: 'Resolved',
    bdo_remarks: 'Verification completed with Treasury Office. Pending arrears credited to SBI Account on July 25.',
    created_at: '2026-07-15T09:00:00Z',
    updated_at: '2026-07-25T16:00:00Z'
  }
]

const COMPLAINT_STORAGE_KEY = 'gramseva_complaints_db_v2'

export function getStoredComplaints(): ComplaintRecord[] {
  if (typeof window === 'undefined') return INITIAL_COMPLAINTS
  try {
    const raw = localStorage.getItem(COMPLAINT_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(COMPLAINT_STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS))
      return INITIAL_COMPLAINTS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_COMPLAINTS
  }
}

export function saveStoredComplaints(items: ComplaintRecord[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(COMPLAINT_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('gramseva_complaints_updated'))
}

export function createComplaint(data: {
  resident_uid: string
  resident_name: string
  resident_mobile: string
  village: string
  ward_number: string
  category: ComplaintRecord['category']
  title: string
  description: string
  attachment_url?: string
}): ComplaintRecord {
  const items = getStoredComplaints()
  const now = new Date().toISOString()
  const id = `CMP-2026-${Date.now().toString().slice(-4)}`

  const newRecord: ComplaintRecord = {
    id,
    resident_uid: data.resident_uid,
    resident_name: data.resident_name,
    resident_mobile: data.resident_mobile,
    village: data.village,
    ward_number: data.ward_number,
    category: data.category,
    title: data.title,
    description: data.description,
    attachment_url: data.attachment_url,
    status: 'Pending',
    bdo_remarks: 'Awaiting initial review by BDO Officer.',
    created_at: now,
    updated_at: now
  }

  items.unshift(newRecord)
  saveStoredComplaints(items)

  // Dispatch confirmation notification to resident
  if (typeof window !== 'undefined') {
    const notification = {
      id: `NOTIF-CMP-${Date.now()}`,
      title: `📑 Complaint Submitted Successfully (${id})`,
      message: `Your grievance "${data.title}" has been registered with the BDO office. Current Status: Pending.`,
      date: new Date().toLocaleString(),
      type: 'complaint_update',
      complaint_id: id
    }
    const notifs = JSON.parse(localStorage.getItem('gramseva_notifications') || '[]')
    notifs.unshift(notification)
    localStorage.setItem('gramseva_notifications', JSON.stringify(notifs))
  }

  return newRecord
}

export function updateComplaintStatus(
  id: string,
  newStatus: ComplaintRecord['status'],
  remarks: string
): ComplaintRecord | null {
  const items = getStoredComplaints()
  const idx = items.findIndex(c => c.id === id)
  if (idx === -1) return null

  const now = new Date().toISOString()
  const updated: ComplaintRecord = {
    ...items[idx],
    status: newStatus,
    bdo_remarks: remarks || items[idx].bdo_remarks,
    updated_at: now
  }

  items[idx] = updated
  saveStoredComplaints(items)

  // Dispatch automated real-time status update notification to the villager!
  if (typeof window !== 'undefined') {
    const statusEmoji = newStatus === 'Accepted' ? '🟢' : newStatus === 'In Progress' ? '🔵' : newStatus === 'Resolved' ? '✅' : '🔴'
    const notification = {
      id: `NOTIF-STATUS-${Date.now()}`,
      title: `${statusEmoji} Grievance #${updated.id} Status: ${newStatus}`,
      message: `BDO Officer updated your complaint "${updated.title}". Remarks: "${remarks || 'Status updated by Officer.'}"`,
      date: new Date().toLocaleString(),
      type: 'complaint_status_change',
      complaint_id: updated.id
    }
    const notifs = JSON.parse(localStorage.getItem('gramseva_notifications') || '[]')
    notifs.unshift(notification)
    localStorage.setItem('gramseva_notifications', JSON.stringify(notifs))
  }

  return updated
}
