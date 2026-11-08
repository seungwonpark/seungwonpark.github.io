// Traffic board configuration. Addresses are geocoded by the Routes API.

export const HOME = 'Rincon Hill, San Francisco, CA'

export type Place = {
  id: string
  name: string
  address: string
  color: string
  // When true, this destination flips to "→ Home" in the evening (commute).
  commute?: boolean
}

export const PLACES: Place[] = [
  {
    id: 'office',
    name: 'Office',
    address: '135 Commonwealth Dr, Menlo Park, CA 94025',
    color: '#60a5fa',
    commute: true,
  },
  {
    id: 'hmart',
    name: 'H Mart SF',
    address: '3995 Alemany Blvd, San Francisco, CA 94132',
    color: '#f472b6',
  },
  {
    id: 'costco',
    name: 'Costco SF',
    address: '450 10th St, San Francisco, CA 94103',
    color: '#facc15',
  },
]

// From this hour on, commute destinations show the reverse trip (→ Home).
export const EVENING_HOUR = 15

// Routes API is billed per request; keep this modest (3 routes per refresh).
export const ETA_REFRESH_MIN = 10
export const TRAFFIC_REFRESH_MIN = 5
// Full page reload clears any memory growth on the TV browser.
export const PAGE_RELOAD_MIN = 60
// No ETA requests during these hours (TV is presumably off / asleep).
export const QUIET_HOURS = { start: 0, end: 5 }

export const INITIAL_CENTER = { lat: 37.62, lng: -122.3 }
export const INITIAL_ZOOM = 10
