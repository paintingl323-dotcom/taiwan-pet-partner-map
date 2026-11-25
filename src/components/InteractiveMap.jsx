import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocateFixed, Plus, Minus, ExternalLink, Map as MapIcon, Navigation } from 'lucide-react';
import { OUTREACH_STATUSES, STORE_CATEGORIES } from '../data/partnersData';

function getCategoryIcon(category) {
  const found = STORE_CATEGORIES.find((c) => c.id === category);
  return found ? found.icon : '📍';
}

function getStatusColor(status) {
  const found = OUTREACH_STATUSES.find((s) => s.id === status);
  return found ? found.color : '#78716C';
}

function shortName(name) {
  const cleaned = name.split(/[（(·\s]/)[0];
  return cleaned.length > 6 ? `${cleaned.slice(0, 6)}…` : cleaned;
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function InteractiveMap({
  stores,
  hoveredStoreId,
  selectedStore,
  onSelectStore,
  mapMode,
  setMapMode,
  fitTrigger,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markerMapRef = useRef(new Map());

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return undefined;

    const isDesktopInit = window.innerWidth >= 1024;
    const map = L.map(mapContainerRef.current, {
      center: isDesktopInit ? [22.642, 120.266] : [22.642, 120.312],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Mindtrip-style pill markers whenever stores change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markerMapRef.current.clear();

    stores.forEach((store) => {
      if (typeof store.lat !== 'number' || typeof store.lng !== 'number') return;
      const isHighlighted =
        hoveredStoreId === store.id || (selectedStore && selectedStore.id === store.id);
      const dotColor = getStatusColor(store.status);
      const iconEmoji = getCategoryIcon(store.category);

      const divIcon = L.divIcon({
        className: 'mt-pin-wrapper',
        html: `<div class="mt-map-pill ${isHighlighted ? 'is-highlighted' : ''}" data-store-id="${escapeHtml(store.id)}">
          <span>${iconEmoji}</span>
          <span class="mt-map-pill-dot" style="background:${dotColor}"></span>
          <span>${escapeHtml(shortName(store.name))}</span>
        </div>`,
        iconSize: null,
        iconAnchor: [48, 15],
      });

      const marker = L.marker([store.lat, store.lng], {
        icon: divIcon,
        zIndexOffset: isHighlighted ? 900 : 0,
      });

      marker.on('click', () => {
        onSelectStore(store);
      });

      marker.addTo(layer);
      markerMapRef.current.set(store.id, marker);
    });
  }, [stores, hoveredStoreId, selectedStore, onSelectStore]);

  // Fit bounds cleanly into visible right-hand area when region/filter changes
  const fitAllVisibleStores = () => {
    const map = mapInstanceRef.current;
    if (!map || !stores.length) return;
    const validCoords = stores
      .filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number')
      .map((s) => [s.lat, s.lng]);
    if (!validCoords.length) return;

    const isDesktop = window.innerWidth >= 1024;
    const bounds = L.latLngBounds(validCoords);
    map.fitBounds(bounds, {
      paddingTopLeft: isDesktop ? [555, 64] : [36, 64],
      paddingBottomRight: isDesktop ? [64, 64] : [36, 90],
      maxZoom: 15,
      animate: true,
      duration: 0.45,
    });
  };

  useEffect(() => {
    if (fitTrigger > 0) {
      fitAllVisibleStores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitTrigger]);

  // Pan smoothly when a store is selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStore) return;
    if (typeof selectedStore.lat !== 'number' || typeof selectedStore.lng !== 'number') return;

    const isDesktop = window.innerWidth >= 1024;
    const targetZoom = Math.max(map.getZoom(), 14);
    const point = map.project([selectedStore.lat, selectedStore.lng], targetZoom);
    // Shift center slightly so selected pin appears between left panel and right detail drawer
    const offsetX = isDesktop ? -40 : 0;
    const adjustedLatLng = map.unproject(point.add([offsetX, 0]), targetZoom);
    map.flyTo(adjustedLatLng, targetZoom, { duration: 0.4 });
  }, [selectedStore]);

  const activeGmapsStore = selectedStore || stores[0] || null;
  const gmapsEmbedUrl = activeGmapsStore
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        `${activeGmapsStore.name} ${activeGmapsStore.address}`
      )}&hl=zh-TW&z=16&output=embed`
    : '';
  const gmapsDirectUrl = activeGmapsStore
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${activeGmapsStore.name} ${activeGmapsStore.address}`
      )}`
    : 'https://www.google.com/maps';

  const progressedCount = stores.filter((s) => s.status !== '待聯絡').length;
  const activePartnerCount = stores.filter((s) => s.status === '已上架合作').length;

  return (
    <div className="mt-map-backdrop">
      {/* Top-Right Mindtrip Floating Segmented Map Switcher */}
      <div className="mt-map-mode-switch">
        <button
          type="button"
          className={`mt-map-mode-btn ${mapMode === 'cluster' ? 'is-active' : ''}`}
          onClick={() => setMapMode('cluster')}
        >
          <MapIcon size={14} />
          全區分佈釘選
        </button>
        <button
          type="button"
          className={`mt-map-mode-btn ${mapMode === 'gmaps' ? 'is-active' : ''}`}
          onClick={() => setMapMode('gmaps')}
        >
          <Navigation size={14} />
          Google Maps 實景
        </button>
      </div>

      {/* Base Interactive Multi-Pin Map */}
      <div
        ref={mapContainerRef}
        className="mt-leaflet-canvas"
        style={{
          visibility: mapMode === 'gmaps' && window.innerWidth < 1024 ? 'hidden' : 'visible',
        }}
      />

      {/* Live Google Maps Mode (Right Half on Desktop / Full on Mobile) */}
      {mapMode === 'gmaps' && activeGmapsStore && (
        <div className="mt-gmaps-live-stage">
          <div className="mt-gmaps-frame-card">
            <div className="mt-gmaps-bar">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#141312' }}>
                  📍 {activeGmapsStore.name}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: '#57534E',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {activeGmapsStore.address}（點左側任一店家即可即時切換 Google 地圖定位）
                </div>
              </div>
              <a
                href={gmapsDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-black-cta"
                style={{ height: 36, padding: '0 15px', fontSize: 12.5, flexShrink: 0 }}
              >
                開啟 Google Maps 導航與評論
                <ExternalLink size={13} />
              </a>
            </div>
            <iframe
              title={`Google Maps - ${activeGmapsStore.name}`}
              src={gmapsEmbedUrl}
              style={{ flex: 1, width: '100%', height: '100%', minHeight: 320, border: 'none' }}
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}

      {/* Bottom Status Pill (Echoing Mindtrip's Frosted Weather Pill) */}
      {mapMode === 'cluster' && !selectedStore && (
        <div className="mt-map-status-pill">
          <span className="mt-dot" style={{ background: '#1F8A5B' }} />
          <span>目前顯示 {stores.length} 家通路</span>
          <span style={{ color: '#A8A29E' }}>·</span>
          <span>已推進 {progressedCount} 家</span>
          <span style={{ color: '#A8A29E' }}>·</span>
          <span style={{ color: '#166534', fontWeight: 700 }}>已上架 {activePartnerCount} 家</span>
        </div>
      )}

      {/* Bottom-Right Mindtrip Circular Map Controls */}
      {mapMode === 'cluster' && (
        <div className="mt-map-controls">
          <button
            type="button"
            className="mt-map-fab"
            title="自動縮放顯示目前篩選店家"
            onClick={fitAllVisibleStores}
          >
            <LocateFixed size={18} />
          </button>
          <div className="mt-zoom-stack">
            <button
              type="button"
              title="放大地圖"
              onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomIn()}
            >
              <Plus size={17} />
            </button>
            <button
              type="button"
              title="縮小地圖"
              onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomOut()}
            >
              <Minus size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
