import React, { useState } from 'react';
import { Sparkles, Map as MapIcon, ArrowUpRight, Check } from 'lucide-react';
import StoreVisualCover from './StoreVisualCover';
import { STORE_CATEGORIES } from '../data/partnersData';

const PLAYBOOK_CARDS = [
  {
    category: '寵物美容',
    gradient: 'linear-gradient(160deg, #0D326E 0%, #061838 100%)',
    badge: '回購率 NO.1',
    title: '寵物美容沙龍\n結帳櫃檯黃金位',
    desc: '飼主每 2–4 週固定接送洗澡，美容師順口推薦獎勵肉條，成交最自然。',
  },
  {
    category: '寵物咖啡廳',
    gradient: 'linear-gradient(160deg, #A33710 0%, #4A1605 100%)',
    badge: '體驗轉單最快',
    title: '寵物咖啡廳・貓咖\n現場餵食互動包',
    desc: '推出 $39–$50 擼貓餵食小包，毛孩搶著吃就是最強活廣告，掃碼買正裝包。',
  },
  {
    category: '寵物旅館',
    gradient: 'linear-gradient(160deg, #086796 0%, #042D46 100%)',
    badge: '高客單禮盒',
    title: '精品寵物旅館\n退房安心伴手禮',
    desc: '連假外宿家長消費力高，退房附贈 10g 試吃包與門市禮盒，客單價最高。',
  },
  {
    category: '友善餐廳',
    gradient: 'linear-gradient(160deg, #255D34 0%, #0F2B17 100%)',
    badge: '店家零備料負擔',
    title: '寵物友善早午餐\n毛孩專屬加購盤',
    desc: '主人點餐 +$49 幫毛孩加點無添加海味／菇蕈點心，拆袋即上桌直接分潤。',
  },
];

export default function HomeOverview({
  stores,
  starredIds,
  onToggleStar,
  onCycleStatus,
  onJumpToExplore,
  onOpenStoreInMap,
  onNavigateTab,
}) {
  const [previewRegion, setPreviewRegion] = useState('高雄');

  const khCount = stores.filter((s) => s.region === '高雄').length;
  const ptCount = stores.filter((s) => s.region === '屏東').length;
  const otherCount = stores.length - khCount - ptCount;
  const previewStores = stores.filter((s) => s.region === previewRegion).slice(0, 4);

  return (
    <div className="mt-scroll-page">
      <div className="mt-home-container">
        {/* Top Mindtrip Pastel-Circle Category Pills */}
        <div className="mt-top-pastel-bar">
          <button
            type="button"
            className="mt-pastel-pill"
            onClick={() => onJumpToExplore({ category: '寵物咖啡廳' })}
          >
            <span className="mt-pastel-icon" style={{ background: '#FDE8D7' }}>
              🐱
            </span>
            寵物咖啡廳
          </button>
          <button
            type="button"
            className="mt-pastel-pill"
            onClick={() => onJumpToExplore({ category: '寵物美容' })}
          >
            <span className="mt-pastel-icon" style={{ background: '#DDF2F2' }}>
              ✂️
            </span>
            寵物美容沙龍
          </button>
          <button
            type="button"
            className="mt-pastel-pill"
            onClick={() => onJumpToExplore({ category: '寵物旅館' })}
          >
            <span className="mt-pastel-icon" style={{ background: '#EAE4F7' }}>
              🏨
            </span>
            寵物精品旅館
          </button>
          <button
            type="button"
            className="mt-pastel-pill"
            onClick={() => onJumpToExplore({ category: '友善餐廳' })}
          >
            <span className="mt-pastel-icon" style={{ background: '#FCE4EC' }}>
              ☕
            </span>
            寵物友善餐廳
          </button>
          <button
            type="button"
            className="mt-pastel-pill"
            onClick={() => onNavigateTab('calculator')}
          >
            <span className="mt-pastel-icon" style={{ background: '#E3F4E8' }}>
              🧮
            </span>
            寄賣分潤試算
          </button>
          <button
            type="button"
            className="mt-pastel-pill"
            onClick={() => onNavigateTab('pipeline')}
          >
            <span className="mt-pastel-icon" style={{ background: '#F3EFE6' }}>
              📋
            </span>
            拓點進度清單
          </button>
        </div>

        {/* Mindtrip Sparkle Emblem + Greeting */}
        <div className="mt-greeting-sparkle">
          <Sparkles size={20} />
        </div>
        <h1 className="mt-greeting-title">毛孩點心．全台實體通路分佈與寄賣部署指南</h1>
        <p className="mt-greeting-sub">
          除了週末寵物展與毛孩市集擺攤曝光，把點心鋪進<strong>「寵物美容院、貓狗咖啡廳、寵物旅館與友善餐廳」</strong>，
          免付店租、免請店員，讓美容師與店長每天幫我們自然推薦，打造 365 天不斷電的在地回購網。
        </p>

        {/* 4 Mindtrip Rounded-2xl Deep Gradient Strategy Cards */}
        <div className="mt-action-grid-4">
          {PLAYBOOK_CARDS.map((card) => (
            <div
              key={card.category}
              className="mt-gradient-card"
              style={{ background: card.gradient }}
              onClick={() => onJumpToExplore({ category: card.category })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.16)',
                    fontSize: 11.5,
                    fontWeight: 700,
                  }}
                >
                  {card.badge}
                </span>
                <ArrowUpRight size={18} style={{ opacity: 0.85 }} />
              </div>

              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    margin: '24px 0 8px',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ fontSize: 12.5, lineHeight: 1.5, margin: 0, opacity: 0.88 }}>
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mindtrip Center Promo Box ("More things I can do for you" style) */}
        <div
          style={{
            border: '1px solid rgba(20, 19, 18, 0.09)',
            borderRadius: 24,
            padding: '26px 30px',
            background: '#FAF8F4',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 42,
          }}
        >
          <div style={{ maxWidth: 360 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>
              從高屏主場出發，逐步複製全台
            </h2>
            <p style={{ fontSize: 13.5, color: '#57534E', margin: 0, lineHeight: 1.6 }}>
              已整理 {stores.length} 家真實高評價店家並串接 Google Maps 導航，點擊任一店家即可查看切入話術與追蹤寄樣進度。
            </p>
          </div>

          <div style={{ flex: 1, minWidth: 260, maxWidth: 400 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '7px 0',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <span>📍 高雄市主力部署圈（三民／左營／鼓山／鳳山等）</span>
              <span>
                {khCount} 家 <Check size={15} style={{ verticalAlign: '-2px' }} />
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '7px 0',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <span>🌴 屏東縣拓展圈（屏東市／潮州／恆春墾丁）</span>
              <span>
                {ptCount} 家 <Check size={15} style={{ verticalAlign: '-2px' }} />
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '7px 0',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <span>🚄 台南・台中・台北指標示範名店</span>
              <span>
                {otherCount} 家 <Check size={15} style={{ verticalAlign: '-2px' }} />
              </span>
            </div>

            <button
              type="button"
              className="mt-black-cta"
              style={{ width: '100%', marginTop: 14 }}
              onClick={() => onJumpToExplore({ region: 'all', category: 'all' })}
            >
              開啟全螢幕互動拓點地圖
            </button>
          </div>
        </div>

        {/* Mindtrip "For you in [City]" Section + Map Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>精選優先拜訪名單</span>
            <div
              style={{
                display: 'inline-flex',
                padding: 3,
                borderRadius: 999,
                background: '#EFECE6',
              }}
            >
              {['高雄', '屏東', '台南'].map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setPreviewRegion(reg)}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '5px 13px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: previewRegion === reg ? '#FCFBF9' : 'transparent',
                    color: previewRegion === reg ? '#141312' : '#78716C',
                    boxShadow: previewRegion === reg ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="mt-add-pill-btn"
            onClick={() => onJumpToExplore({ region: previewRegion })}
          >
            <MapIcon size={14} />
            在地圖查看全部 {previewRegion} 通路
          </button>
        </div>

        <div className="mt-action-grid-4">
          {previewStores.map((store) => {
            const catObj = STORE_CATEGORIES.find((c) => c.id === store.category);
            return (
              <div
                key={store.id}
                className="mt-place-card"
                onClick={() => onOpenStoreInMap(store)}
              >
                <StoreVisualCover
                  store={store}
                  isStarred={starredIds.includes(store.id)}
                  onToggleStar={onToggleStar}
                  onCycleStatus={onCycleStatus}
                />
                <h4 className="mt-card-title">{store.name}</h4>
                <div className="mt-card-meta-line">
                  <span>{catObj ? catObj.icon : '📍'}</span>
                  <span>{store.category}</span>
                  <span>·</span>
                  <span>
                    {store.region} {store.district}
                  </span>
                </div>
                <div className="mt-card-pitch-line">{store.collabModel}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
