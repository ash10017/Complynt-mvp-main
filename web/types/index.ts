export interface Compliance {
  id: number
  name: string
  authority: string
  category: string
  frequency: string
  description: string
  documents: string[]
  dueDate: string
  status: 'Pending' | 'Completed' | 'Overdue'
  history: string[]
  vaultDocs?: VaultDoc[]
  licenseId?: string
}

export interface VaultDoc {
  name: string
  url: string
  expiry: string
  uploadedAt: string
}

export interface UserProfile {
  bizType: string
  compliances: Compliance[]
  alertPrefs: { email: string; phone: string; method: string }
  onboardingComplete: boolean
  createdAt: string
}

export interface TemperatureLog {
  id: string
  date: string
  time: string
  probe: 'fridge' | 'freezer' | 'hot_hold' | 'delivery' | 'cooking'
  label: string
  tempC: number
  pass: boolean
  corrective?: string
  recordedBy: string
}

export interface StaffCert {
  type: string
  provider: string
  certNumber: string
  completedDate: string
  expiryDate: string
}

export interface StaffMember {
  id: string
  name: string
  role: string
  startDate: string
  rtwChecked: boolean
  rtwDate: string
  certs: StaffCert[]
}

export interface AllergenDish {
  id: string
  name: string
  description?: string
  allergens: string[]
}

export interface HACCPData {
  updatedAt: string
  bizType: string
  kitchenType: string
  activities: string[]
  managerName: string
  reviewFrequency: string
}

export type Region = 'IN' | 'AU' | 'UK'

export interface ContactSubmission {
  name: string
  email: string
  business: string | null
  region: string | null
  message: string
  createdAt: unknown
  source: string
}
