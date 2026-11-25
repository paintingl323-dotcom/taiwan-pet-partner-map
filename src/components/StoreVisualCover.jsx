import React from 'react';
import { Heart, Check } from 'lucide-react';
import { OUTREACH_STATUSES } from '../data/partnersData';

const PALETTES = {
  寵物咖啡廳: [
    { bg: 'linear-gradient(145deg, #D99B66 0%, #9E5834 100%)', accent: '#FFF3E4', tag: '擼貓互動・隨手包' },
    { bg: 'linear-gradient(145deg, #C78259 0%, #7C4026 100%)', accent: '#FCEAD9', tag: '店貓試吃・高回購' },
    { bg: 'linear-gradient(145deg, #B58B63 0%, #6B4D35 100%)', accent: '#F7EFE4', tag: '選物木架・寄賣點' },
  ],
  寵物美容: [
    { bg: 'linear-gradient(145deg, #4F8A8B 0%, #265057 100%)', accent: '#E4F6F6', tag: '洗完澡獎勵小包' },
    { bg: 'linear-gradient(145deg, #5C8D76 0%, #2D5542 100%)', accent: '#E6F5EC', tag: '結帳櫃檯黃金位' },
    { bg: 'linear-gradient(145deg, #5A7D9A 0%, #2C465E 100%)', accent: '#E8F1F8', tag: '雙週熟客高黏著' },
  ],
  寵物旅館: [
    { bg: 'linear-gradient(145deg, #7C6A96 0%, #42345B 100%)', accent: '#F1ECF8', tag: '退房安心伴手禮' },
    { bg: 'linear-gradient(145deg, #8F6B58 0%, #4E3629 100%)', accent: '#F8EEE8', tag: '精品住宿迎賓禮' },
  ],
  友善餐廳: [
    { bg: 'linear-gradient(145deg, #B86B52 0%, #753928 100%)', accent: '#FBECE6', tag: '毛孩同行加購盤' },
    { bg: 'linear-gradient(145deg, #6E8255 0%, #3C4B2B 100%)', accent: '#EEF3E6', tag: '草皮聚會伴手禮' },
  ],
};

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function CategoryIllustration({ category, accent }) {
  if (category === '寵物咖啡廳') {
    return (
      <svg width="78" height="78" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <circle cx="40" cy="40" r="34" fill={accent} fillOpacity="0.16" />
        <path
          d="M24 50C24 38 29 31 40 31C51 31 56 38 56 50C56 55 51 58 40 58C29 58 24 55 24 50Z"
          fill={accent}
          fillOpacity="0.92"
        />
        <path d="M26 36L23 22L35 31Z" fill={accent} fillOpacity="0.92" />
        <path d="M54 36L57 22L45 31Z" fill={accent} fillOpacity="0.92" />
        <circle cx="34" cy="44" r="2.4" fill="#2A1F1A" />
        <circle cx="46" cy="44" r="2.4" fill="#2A1F1A" />
        <path d="M38 48.5L40 50.5L42 48.5" stroke="#2A1F1A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (category === '寵物美容') {
    return (
      <svg width="78" height="78" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <circle cx="40" cy="40" r="34" fill={accent} fillOpacity="0.16" />
        <circle cx="30" cy="30" r="9" fill={accent} fillOpacity="0.88" />
        <circle cx="50" cy="28" r="7" fill={accent} fillOpacity="0.72" />
        <circle cx="43" cy="46" r="13" fill={accent} fillOpacity="0.94" />
        <circle cx="28" cy="49" r="8" fill={accent} fillOpacity="0.8" />
        <path d="M53 47L56 41L59 47L65 50L59 53L56 59L53 53L47 50Z" fill="#FFFFFF" />
      </svg>
    );
  }
  if (category === '寵物旅館') {
    return (
      <svg width="78" height="78" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <circle cx="40" cy="40" r="34" fill={accent} fillOpacity="0.16" />
        <path d="M22 40L40 24L58 40V57H22V40Z" fill={accent} fillOpacity="0.92" />
        <rect x="35" y="44" width="10" height="13" rx="5" fill="#3B2E4A" fillOpacity="0.75" />
        <circle cx="40" cy="36" r="3.5" fill="#3B2E4A" fillOpacity="0.75" />
      </svg>
    );
  }
  return (
    <svg width="78" height="78" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="34" fill={accent} fillOpacity="0.16" />
      <rect x="24" y="33" width="28" height="21" rx="8" fill={accent} fillOpacity="0.92" />
      <path d="M52 37H56C58.8 37 61 39.2 61 42C61 44.8 58.8 47 56 47H52" stroke={accent} strokeWidth="3.5" />
      <path d="M21 57H57" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export default function StoreVisualCover({
  store,
  isStarred,
  onToggleStar,
  onCycleStatus,
  height,
  hideActions = false,
}) {
  const list = PALETTES[store.category] || PALETTES['寵物咖啡廳'];
  const palette = list[hashCode(store.id + store.name) % list.length];
  const statusObj = OUTREACH_STATUSES.find((s) => s.id === store.status) || OUTREACH_STATUSES[0];

  return (
    <div
      className="mt-cover-box"
      style={{
        background: palette.bg,
        ...(height ? { height, aspectRatio: 'auto', marginBottom: 0, borderRadius: 0 } : {}),
      }}
    >
      {/* Top-Left Status Badge */}
      {!hideActions && (
        <div
          className="mt-cover-status-pill"
          style={{ background: statusObj.bg, color: statusObj.text }}
        >
          <span className="mt-dot" style={{ background: statusObj.color }} />
          {statusObj.label}
        </div>
      )}

      {/* Top-Right Mindtrip Translucent Action Circles (Save ♡ & Quick Status Advance ✓) */}
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

      {/* Center Editorial Vector Emblem + Store District Tag */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '18px 12px 24px',
          textAlign: 'center',
        }}
      >
        <CategoryIllustration category={store.category} accent={palette.accent} />
        <div
          style={{
            marginTop: 4,
            padding: '3px 10px',
            borderRadius: 999,
            background: 'rgba(20, 19, 18, 0.24)',
            color: '#FFFDF9',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.02em',
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {store.ratingTag || palette.tag}
        </div>
      </div>

      {/* Mindtrip Bottom Dots */}
      <div className="mt-cover-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
