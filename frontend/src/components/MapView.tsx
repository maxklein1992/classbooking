import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Training } from '../api/types'
import { formatPrice, formatTimeRange } from '../lib/dates'

interface Props {
  trainings: Training[]
}

function hasCoords(
  t: Training,
): t is Training & { lat: number; lng: number } {
  return typeof t.lat === 'number' && typeof t.lng === 'number'
}

// Eenvoudige, op-brand kaartmarker als divIcon — vermijdt de bekende
// Leaflet-issue met ontbrekende marker-afbeeldingen bij bundlers.
const pinIcon = L.divIcon({
  className: 'map-pin',
  html: '<span class="map-pin-dot"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -10],
})

export default function MapView({ trainings }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  // Kaart één keer initialiseren.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
      [39.5, -8.0],
      6,
    )
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  // Markers bijwerken wanneer de trainingen wijzigen.
  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()

    const located = trainings.filter(hasCoords)
    const bounds: L.LatLngTuple[] = []

    located.forEach((tr) => {
      const marker = L.marker([tr.lat, tr.lng], { icon: pinIcon })
      bounds.push([tr.lat, tr.lng])

      // Popup-inhoud als DOM zodat de "details"-link binnen de SPA navigeert.
      const el = document.createElement('div')
      el.className = 'map-popup'
      const title = document.createElement('strong')
      title.textContent = tr.title
      const meta = document.createElement('div')
      meta.className = 'map-popup-meta'
      meta.textContent = `${formatTimeRange(tr.startTime, tr.endTime)} · ${formatPrice(tr.price)}`
      const link = document.createElement('a')
      link.href = `/trainingen/${tr.id}`
      link.className = 'map-popup-link'
      link.textContent = t('common.details')
      link.addEventListener('click', (e) => {
        e.preventDefault()
        navigate(`/trainingen/${tr.id}`)
      })
      el.append(title, meta, link)
      marker.bindPopup(el)
      marker.addTo(layer)
    })

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
    }
    // Herbereken de grootte (container kan net zichtbaar zijn geworden).
    setTimeout(() => map.invalidateSize(), 0)
  }, [trainings, navigate, t])

  const locatedCount = trainings.filter(hasCoords).length

  return (
    <div className="map-view">
      {locatedCount < trainings.length && (
        <p className="muted map-note">
          {t('home.mapMissing', {
            count: trainings.length - locatedCount,
          })}
        </p>
      )}
      <div
        ref={containerRef}
        className="map-container"
        role="application"
        aria-label={t('home.viewMap')}
      />
    </div>
  )
}
