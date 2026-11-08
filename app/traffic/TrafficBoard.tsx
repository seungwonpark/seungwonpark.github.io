'use client'

import { useEffect, useRef, useState } from 'react'
import {
  HOME,
  PLACES,
  EVENING_HOUR,
  ETA_REFRESH_MIN,
  TRAFFIC_REFRESH_MIN,
  PAGE_RELOAD_MIN,
  QUIET_HOURS,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  type Place,
} from './config'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google: any
    __trafficInit?: () => void
  }
}

const API_KEY = process.env.NEXT_PUBLIC_GMAPS_KEY ?? ''

type Eta = {
  place: Place
  label: string
  reverse: boolean
  durationSec?: number
  staticSec?: number
  meters?: number
  path?: { lat: number; lng: number }[]
  error?: string
}

// LG webOS remote key codes (plus keyboard equivalents for testing).
const KEY = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  OK: 13,
  BACK: 461,
  BACKSPACE: 8,
  ESC: 27,
  CH_UP: 33,
  CH_DOWN: 34,
  PLUS: 187,
  MINUS: 189,
  NUM_PLUS: 107,
  NUM_MINUS: 109,
  RED: 403,
  GREEN: 404,
}

const DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2230' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a93a6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#151923' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3a4152' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#c3cad8' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c3344' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1f2b' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3b4459' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b5bdcc' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1320' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4b5568' }] },
]

function decodePolyline(str: string) {
  const out: { lat: number; lng: number }[] = []
  let i = 0,
    lat = 0,
    lng = 0
  while (i < str.length) {
    for (const which of [0, 1]) {
      let b,
        shift = 0,
        result = 0
      do {
        b = str.charCodeAt(i++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const d = result & 1 ? ~(result >> 1) : result >> 1
      if (which === 0) lat += d
      else lng += d
    }
    out.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }
  return out
}

const secs = (s?: string) => (s ? parseInt(s, 10) : undefined)

async function fetchRoute(origin: string, destination: string) {
  const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask':
        'routes.duration,routes.staticDuration,routes.distanceMeters,routes.polyline.encodedPolyline',
    },
    body: JSON.stringify({
      origin: { address: origin },
      destination: { address: destination },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      units: 'IMPERIAL',
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`)
  const r = data.routes?.[0]
  if (!r) throw new Error('No route')
  return {
    durationSec: secs(r.duration),
    staticSec: secs(r.staticDuration),
    meters: r.distanceMeters as number,
    path: decodePolyline(r.polyline.encodedPolyline),
  }
}

function plan(now: Date) {
  const evening = now.getHours() >= EVENING_HOUR
  return PLACES.map((place) => {
    const reverse = !!place.commute && evening
    return {
      place,
      reverse,
      label: reverse ? `${place.name} → Home` : place.name,
      origin: reverse ? place.address : HOME,
      destination: reverse ? HOME : place.address,
    }
  })
}

const fmtTime = (d: Date, withSec = false) =>
  d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    ...(withSec ? { second: '2-digit' } : {}),
  })

export default function TrafficBoard() {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const trafficRef = useRef<any>(null)
  const linesRef = useRef<any[]>([])
  const etasRef = useRef<Eta[]>([])
  const viewRef = useRef(0)

  const [now, setNow] = useState(() => new Date())
  const [etas, setEtas] = useState<Eta[]>([])
  const [etaAt, setEtaAt] = useState<Date | null>(null)
  const [trafficAt, setTrafficAt] = useState<Date | null>(null)
  const [view, setView] = useState(0)
  const [error, setError] = useState<string | null>(API_KEY ? null : 'Missing NEXT_PUBLIC_GMAPS_KEY')
  const [ready, setReady] = useState(false)

  // Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(t)
  }, [])

  // Periodic full reload (keeps the TV browser fresh).
  useEffect(() => {
    const t = setTimeout(() => location.reload(), PAGE_RELOAD_MIN * 60_000)
    return () => clearTimeout(t)
  }, [])

  // Load Google Maps JS.
  useEffect(() => {
    if (!API_KEY) return
    window.__trafficInit = async () => {
      try {
        const g = window.google
        await g.maps.importLibrary('maps')
        const map = new g.maps.Map(mapEl.current, {
          center: INITIAL_CENTER,
          zoom: INITIAL_ZOOM,
          styles: DARK_STYLE,
          backgroundColor: '#1d2230',
          disableDefaultUI: true,
          keyboardShortcuts: false,
          gestureHandling: 'greedy',
          clickableIcons: false,
        })
        const traffic = new g.maps.TrafficLayer()
        traffic.setMap(map)
        mapRef.current = map
        trafficRef.current = traffic
        setTrafficAt(new Date())
        setReady(true)
      } catch (e: any) {
        setError(`Map failed to load: ${e?.message ?? e}`)
      }
    }
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(API_KEY)}&v=weekly&loading=async&callback=__trafficInit`
    s.async = true
    s.onerror = () => setError('Could not load Google Maps script')
    document.head.appendChild(s)
  }, [])

  // Refresh traffic tiles by toggling the layer.
  useEffect(() => {
    if (!ready) return
    const t = setInterval(() => {
      const tl = trafficRef.current
      if (!tl || document.hidden) return
      tl.setMap(null)
      setTimeout(() => {
        tl.setMap(mapRef.current)
        setTrafficAt(new Date())
      }, 300)
    }, TRAFFIC_REFRESH_MIN * 60_000)
    return () => clearInterval(t)
  }, [ready])

  // Draw routes on the map and fit the current view.
  const applyView = (idx: number, list = etasRef.current) => {
    const g = window.google
    const map = mapRef.current
    if (!g || !map) return
    linesRef.current.forEach((l) => l.setMap(null))
    linesRef.current = []
    const bounds = new g.maps.LatLngBounds()
    list.forEach((eta, i) => {
      if (!eta.path) return
      const selected = idx === 0 || idx === i + 1
      // Wide translucent halo so the traffic colors underneath stay visible.
      const halo = new g.maps.Polyline({
        path: eta.path,
        strokeColor: eta.place.color,
        strokeOpacity: selected ? 0.28 : 0.08,
        strokeWeight: selected ? 16 : 10,
        zIndex: selected ? 2 : 1,
        clickable: false,
        map,
      })
      const end = eta.reverse ? eta.path[0] : eta.path[eta.path.length - 1]
      const marker = new g.maps.Marker({
        position: end,
        map,
        clickable: false,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: selected ? 9 : 6,
          fillColor: eta.place.color,
          fillOpacity: 1,
          strokeColor: '#0b0e14',
          strokeWeight: 3,
        },
      })
      linesRef.current.push(halo, marker)
      if (selected) eta.path.forEach((p) => bounds.extend(p))
    })
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 120, bottom: 60, left: 60, right: 480 })
    } else {
      map.setCenter(INITIAL_CENTER)
      map.setZoom(INITIAL_ZOOM)
    }
  }

  // ETAs
  useEffect(() => {
    if (!ready) return
    let first = true
    const run = async () => {
      const h = new Date().getHours()
      const quiet = h >= QUIET_HOURS.start && h < QUIET_HOURS.end
      if (!first && (document.hidden || quiet)) return
      first = false
      const results: Eta[] = await Promise.all(
        plan(new Date()).map(async (p) => {
          try {
            return { place: p.place, label: p.label, reverse: p.reverse, ...(await fetchRoute(p.origin, p.destination)) }
          } catch (e: any) {
            return { place: p.place, label: p.label, reverse: p.reverse, error: e?.message ?? String(e) }
          }
        }),
      )
      etasRef.current = results
      setEtas(results)
      setEtaAt(new Date())
      applyView(viewRef.current, results)
    }
    run()
    const t = setInterval(run, ETA_REFRESH_MIN * 60_000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // Remote control
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map = mapRef.current
      if (!map) return
      const step = 250
      const setV = (v: number) => {
        viewRef.current = v
        setView(v)
        applyView(v)
      }
      switch (e.keyCode) {
        case KEY.LEFT:
          map.panBy(-step, 0)
          break
        case KEY.RIGHT:
          map.panBy(step, 0)
          break
        case KEY.UP:
          map.panBy(0, -step)
          break
        case KEY.DOWN:
          map.panBy(0, step)
          break
        case KEY.CH_UP:
        case KEY.PLUS:
        case KEY.NUM_PLUS:
          map.setZoom(map.getZoom() + 1)
          break
        case KEY.CH_DOWN:
        case KEY.MINUS:
        case KEY.NUM_MINUS:
          map.setZoom(map.getZoom() - 1)
          break
        case KEY.OK:
        case KEY.GREEN:
          setV((viewRef.current + 1) % (PLACES.length + 1))
          break
        case KEY.BACK:
        case KEY.BACKSPACE:
        case KEY.ESC:
          setV(0)
          break
        case KEY.RED:
          location.reload()
          break
        default:
          return
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const viewName = view === 0 ? 'Overview' : etas[view - 1]?.label ?? PLACES[view - 1]?.name

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1d2230] text-white" style={{ fontSize: 'clamp(14px, 1.15vw, 28px)' }}>
      <div ref={mapEl} className="absolute inset-0" />

      {/* Clock */}
      <div className="absolute left-[2.2em] top-[1.6em] rounded-2xl bg-black/55 px-[1.1em] py-[0.7em] backdrop-blur">
        <div className="font-semibold tabular-nums leading-none" style={{ fontSize: '3.4em' }}>
          {fmtTime(now)}
        </div>
        <div className="mt-[0.4em] text-white/65">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* ETA card */}
      <div className="absolute right-[2.2em] top-[1.6em] w-[21em] rounded-2xl bg-black/60 p-[1.1em] backdrop-blur">
        <div className="mb-[0.6em] flex items-baseline justify-between text-white/60">
          <span className="uppercase tracking-wider" style={{ fontSize: '0.8em' }}>
            From {etas.some((e) => e.reverse) ? 'office / home' : 'home'}
          </span>
          <span style={{ fontSize: '0.8em' }}>{viewName}</span>
        </div>
        {(etas.length ? etas : PLACES.map((p) => ({ place: p, label: p.name, reverse: false }) as Eta)).map(
          (eta, i) => {
            const min = eta.durationSec != null ? Math.round(eta.durationSec / 60) : null
            const delay =
              eta.durationSec != null && eta.staticSec != null
                ? Math.round((eta.durationSec - eta.staticSec) / 60)
                : null
            const delayColor =
              delay == null ? '' : delay >= 10 ? 'text-red-400' : delay >= 4 ? 'text-amber-300' : 'text-emerald-400'
            const selected = view === i + 1
            return (
              <div
                key={eta.place.id}
                className={`flex items-center gap-[0.8em] rounded-xl px-[0.6em] py-[0.55em] ${selected ? 'bg-white/10' : ''}`}
              >
                <span
                  className="inline-block h-[0.8em] w-[0.8em] shrink-0 rounded-full"
                  style={{ background: eta.place.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{eta.label}</div>
                  <div className="text-white/55" style={{ fontSize: '0.8em' }}>
                    {eta.error ? (
                      <span className="text-red-300">{eta.error}</span>
                    ) : eta.meters != null ? (
                      <>
                        {(eta.meters / 1609.34).toFixed(1)} mi · arrive{' '}
                        {fmtTime(new Date(Date.now() + (eta.durationSec ?? 0) * 1000))}
                      </>
                    ) : (
                      '…'
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums" style={{ fontSize: '1.7em', lineHeight: 1 }}>
                    {min ?? '–'}
                    <span className="ml-[0.15em] font-normal text-white/60" style={{ fontSize: '0.5em' }}>
                      min
                    </span>
                  </div>
                  {delay != null && (
                    <div className={`tabular-nums ${delayColor}`} style={{ fontSize: '0.8em' }}>
                      {delay > 0 ? `+${delay} min` : 'normal'}
                    </div>
                  )}
                </div>
              </div>
            )
          },
        )}
        <div className="mt-[0.7em] border-t border-white/10 pt-[0.6em] text-white/45" style={{ fontSize: '0.75em' }}>
          ETA {etaAt ? fmtTime(etaAt) : '—'} · traffic {trafficAt ? fmtTime(trafficAt) : '—'}
          <br />
          OK: next view · Back: overview · CH ±: zoom
        </div>
      </div>

      {error && (
        <div className="absolute inset-x-0 bottom-[2em] mx-auto w-fit rounded-xl bg-red-900/80 px-[1.2em] py-[0.6em]">
          {error}
        </div>
      )}
    </div>
  )
}
