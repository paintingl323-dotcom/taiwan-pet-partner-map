import React, { useState } from 'react';
import { Heart, Check, ExternalLink, MapPin } from 'lucide-react';
import { OUTREACH_STATUSES, STORE_CATEGORIES } from '../data/partnersData';

function latLngToTileInfo(lat, lng, zoom = 16) {
  const n = 2 ** zoom;
  const xf = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const yf =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;

  const xTile = Math.floor(xf);
  const yTile = Math.floor(yf);
  // Clamp marker position safely within visible card area
  const pinLeftPct = Math.max(24, Math.min(76, Math.round((xf - xTile) * 100)));
  const pinTopPct = Math.max(26, Math.min(68, Math.round((yf - yTile) * 100)));

  return {
    tileUrl: `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`,
    pinLeftPct,
    pinTopPct,
  };
}

function shortAddress(address, region) {
  if (!address) return '';
  return address.replace(new RegExp(`^${region}(市|縣)?`), '');
}

export default function StoreVisualCover({
  store,
  isStarred,
  onToggleStar,
  onCycleStatus,
  googleApiKey = '',
  height,
  hideActions = false,
}) {
  const [imgError, setImgError] = useState(false);

  const statusObj =
    OUTREACH_STATUSES.find((s) => s.id === store.status) || OUTREACH_STATUSES[0];
  const catObj =
    STORE_CATEGORIES.find((c) => c.id === store.category) || STORE_CATEGORIES[1];

  const streetViewPhotoUrl =
    googleApiKey && !imgError
      ? `https://maps.googleapis.com/maps/api/streetview?size=640x480&location=${encodeURIComponent(
          `${store.address}`
        )}&fov=80&pitch=5&source=outdoor&key=${encodeURIComponent(googleApiKey)}`
      : null;

  const directPhotoUrl = !imgError && store.photoUrl ? store.photoUrl : streetViewPhotoUrl;

  const tileInfo = latLngToTileInfo(
    typeof store.lat === 'number' ? store.lat : 22.642,
    typeof store.lng === 'number' ? store.lng : 120.312,
    16
  );

  const pano360Url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${store.lat},${store.lng}`;

  return (
    <div
      className="mt-cover-box"
      style={{
        background: '#E9E4DA',
        ...(height ? { height, aspectRatio: 'auto', marginBottom: 0, borderRadius: 0 } : {}),
      }}
    >
      {/* LAYER 1: Real Storefront Photo (when custom photoUrl or Google Street View API Key is active) OR Real Address Street-Block Tile */}
      {directPhotoUrl ? (
        <img
          src={directPhotoUrl}
          alt={`${store.name} 門牌實景`}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <>
          <img
            src={tileInfo.tileUrl}
            alt={`${store.address} 真實街廓位置`}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: '-10%',
              width: '120%',
              height: '120%',
              objectFit: 'cover',
              filter: 'saturate(0.92) contrast(1.03) brightness(0.99)',
            }}
          />
          {/* Subtle top/bottom vignette so badges & address bar read with high contrast */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(20,19,18,0.18) 0%, rgba(20,19,18,0.02) 45%, rgba(20,19,18,0.68) 100%)',
            }}
          />

          {/* Exact Store Pin on the Real Street Map */}
          <div
            style={{
              position: 'absolute',
              left: `${tileInfo.pinLeftPct}%`,
              top: `${tileInfo.pinTopPct}%`,
              transform: 'translate(-50%, -50%)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 9px',
              borderRadius: 999,
              background: '#141312',
              color: '#FAF8F5',
              fontSize: 11.5,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.28), 0 0 0 2px #FCFBF9',
              zIndex: 2,
              whiteSpace: 'nowrap',
            }}
          >
            <span>{catObj.icon}</span>
            <span
              style={{
                width: 6.5,
                height: 6.5,
                borderRadius: 999,
                background: statusObj.color,
              }}
            />
          </div>
        </>
      )}

      {/* Top-Left Color-Coded Status Badge */}
      {!hideActions && (
        <div
          className="mt-cover-status-pill"
          style={{
            background: statusObj.bg,
            color: statusObj.text,
            border: `1px solid ${statusObj.border || statusObj.color}`,
          }}
        >
          <span className="mt-dot" style={{ background: statusObj.color }} />
          {statusObj.label}
        </div>
      )}

      {/* Top-Right Mindtrip Translucent Action Circles */}
      {!hideActions && (
        <div className="mt-cover-actions">
          <button
            type="button"
            className={`mt-cover-circle-btn ${isStarred ? 'is-starred' : ''}`}
            title={isStarred ? '取消重點關注' : '加入重點關注名單'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(store.id);
            }}
          >
            <Heart size={14} fill={isStarred ? '#fff' : 'none'} />
          </button>
          <button
            type="button"
            className="mt-cover-circle-btn"
            title="一鍵推進拓點狀態"
            onClick={(e) => {
              e.stopPropagation();
              onCycleStatus(store.id);
            }}
          >
            <Check size={14} />
          </button>
        </div>
      )}

      {/* Bottom Real Address Bar + 1-Click Free 360° Real Storefront Street View Link */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          right: 8,
          bottom: 8,
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#FAF8F5',
            background: 'rgba(20, 19, 18, 0.66)',
            backdropFilter: 'blur(6px)',
            padding: '3px 8px',
            borderRadius: 999,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
          title={store.address}
        >
          <MapPin size={10} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
          {shortAddress(store.address, store.region)}
        </span>

        {!hideActions && (
          <a
            href={pano360Url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="免費開啟 Google 360° 真實店門口街景照片"
            style={{
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 700,
              color: '#141312',
              background: 'rgba(252, 251, 249, 0.94)',
              padding: '3px 8px',
              borderRadius: 999,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            街景
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}
