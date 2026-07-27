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
