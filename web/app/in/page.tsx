// India market is not currently active — redirect to region selector
import { redirect } from 'next/navigation'

export default function IndiaPage() {
  redirect('/')
}
