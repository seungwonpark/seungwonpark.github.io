import type { Metadata } from 'next'
import TrafficBoard from './TrafficBoard'

export const metadata: Metadata = {
  title: 'Traffic',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  openGraph: null,
}

export default function Page() {
  return <TrafficBoard />
}
