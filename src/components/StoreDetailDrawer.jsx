import React, { useState } from 'react';
import { X, ExternalLink, Edit3, Copy, Check, MapPin, Sparkles, CheckSquare } from 'lucide-react';
import StoreVisualCover from './StoreVisualCover';
import { OUTREACH_STATUSES, STORE_CATEGORIES } from '../data/partnersData';

export default function StoreDetailDrawer({
  store,
  isStarred,
  onToggleStar,
  onClose,
  onUpdateStore,
  onEditModal,
  onJumpToPipeline,
  googleApiKey = '',
  initialTab = 'overview',
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [copied, setCopied] = useState(false);
  const [embedMapType, setEmbedMapType] = useState('m'); // 'm' street | 'h' satellite hybrid

  if (!store) return null;

  const catObj = STORE_CATEGORIES.find((c) => c.id === store.category) || STORE_CATEGORIES[1];
  const gmapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${store.name} ${store.address}`
  )}`;
  const gmapsPanoUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${store.lat},${store.lng}`;
  const gmapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${store.name} ${store.address}`
  )}&hl=zh-TW&t=${embedMapType}&z=${embedMapType === 'h' ? 19 : 17}&output=embed`;

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(`${store.name}｜${store.address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Single-store quick consignment estimate ($190 retail, $55 cost, 35% store cut, 18 packs/mo)
  const sampleRetail = 190;
  const sampleStoreShare = Math.round(sampleRetail * 0.35);
  const sampleNetPerPack = sampleRetail - sampleStoreShare - 55;
  const sampleMonthlyNet = sampleNetPerPack * 18;

  return (
    <aside className="mt-detail-drawer" aria-label={`${store.name} 詳細資訊`}>
      {/* Top Rounded Hero Media + Mindtrip Floating Pill Bar */}
      <div className="mt-detail-hero">
        <StoreVisualCover
          store={store}
          isStarred={isStarred}
          onToggleStar={onToggleStar}
          onCycleStatus={() => {}}
          googleApiKey={googleApiKey}
          height="215px"
          hideActions
        />
        <div className="mt-detail-hero-bar">
          <button type="button" className="mt-circle-icon-btn" onClick={onClose} title="關閉面板">
            <X size={18} />
          </button>
          <div className="mt-hero-dark-pills">
            <button
              type="button"
              className="mt-hero-pill"
              onClick={() => onJumpToPipeline && onJumpToPipeline(store.id)}
              title="跳轉至『拓點進度看板』對應列"
            >
              <CheckSquare size={13} />
              進度看板
            </button>
            <button
              type="button"
              className="mt-hero-pill"
              onClick={() => onEditModal(store)}
            >
              <Edit3 size={13} />
              編輯
            </button>
            <a
              href={gmapsPanoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-hero-pill"
            >
              360° 店門街景
              <ExternalLink size={13} />
            </a>
            <a
              href={gmapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-hero-pill"
            >
              店家照片＆導航
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="mt-detail-scroll">
        <h2 className="mt-detail-title">{store.name}</h2>
        <div className="mt-detail-sub">
          <span>
            {catObj.icon} {store.category}
          </span>
          <span>·</span>
          <span>
            {store.region} {store.district}
          </span>
          {store.ratingTag && (
            <>
              <span>·</span>
              <span style={{ color: '#9A3412', fontWeight: 600 }}>{store.ratingTag}</span>
            </>
          )}
        </div>

        {/* Mindtrip 2px Underline Tabs */}
        <div className="mt-underline-tabs">
          <button
            type="button"
            className={`mt-underline-tab ${activeTab === 'overview' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            合作攻略 Overview
          </button>
          <button
            type="button"
            className={`mt-underline-tab ${activeTab === 'gmaps' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('gmaps')}
          >
            Google 實景地圖
          </button>
          <button
            type="button"
            className={`mt-underline-tab ${activeTab === 'crm' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('crm')}
          >
            拓點進度＆備註
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.68,
                color: '#292524',
                margin: '0 0 18px',
              }}
            >
              {store.highlight}
            </p>

            <div className="mt-info-block">
              <div className="mt-info-label">推薦合作切入模式</div>
              <div className="mt-info-value">{store.collabModel || catObj.pitchTitle}</div>
            </div>

            <div className="mt-info-block">
              <div className="mt-info-label">最適合擺放的主力品項</div>
              <div className="mt-info-value">
                <Sparkles
                  size={14}
                  style={{ display: 'inline', verticalAlign: '-2px', marginRight: 5 }}
                />
                {store.recommendedSku || '海味珠貝凍乾・東港櫻花蝦肉條・養生菇蕈脆片'}
              </div>
            </div>

            <div className="mt-info-block">
              <div className="mt-info-label">門市地址（可一鍵複製或開啟導航）</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span className="mt-info-value" style={{ fontSize: 13.5 }}>
                  <MapPin
                    size={14}
                    style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }}
                  />
                  {store.address}
                </span>
                <button
                  type="button"
                  className="mt-add-pill-btn"
                  style={{ height: 30, padding: '0 10px', fontSize: 12, flexShrink: 0 }}
                  onClick={handleCopyAddress}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? '已複製' : '複製'}
                </button>
              </div>
            </div>

            {/* Single-Store Plain-Language Profit Preview */}
            <div
              style={{
                border: '1px dashed #D6D0C4',
                borderRadius: 16,
                padding: '13px 15px',
                marginBottom: 18,
                background: '#FAF7F2',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#78716C', marginBottom: 4 }}>
                💡 單店寄賣效益速算（以售價 $190、店抽 35%、月銷 18 包為例）
              </div>
              <div style={{ fontSize: 13.5, color: '#141312', lineHeight: 1.55 }}>
                店家每賣一包現賺 <strong>${sampleStoreShare}</strong>（零進貨壓力），品牌實拿淨利{' '}
                <strong>${sampleNetPerPack}/包</strong>，光這一家店每月就能穩定貢獻約{' '}
                <strong style={{ color: '#166534' }}>NT$ {sampleMonthlyNet.toLocaleString()}</strong>{' '}
                被動淨利！
              </div>
            </div>

            {/* Quick Status Bar */}
            <div style={{ marginBottom: 14 }}>
              <div className="mt-info-label" style={{ marginBottom: 8 }}>
                點擊更新目前洽談進度：
              </div>
              <div className="mt-status-stepper">
                {OUTREACH_STATUSES.map((st) => {
                  const isSel = store.status === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      className="mt-status-step-btn"
                      style={
                        isSel
                          ? {
                              background: st.bg,
                              borderColor: st.border || st.color,
                              borderWidth: '1.5px',
                              color: st.text,
                              fontWeight: 800,
                            }
                          : undefined
                      }
                      onClick={() => onUpdateStore(store.id, { status: st.id })}
                    >
                      <span className="mt-dot" style={{ background: st.color }} />
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <a
              href={gmapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-black-cta"
              style={{ width: '100%' }}
            >
              在 Google Maps 查看電話・營業時間・最新評論
              <ExternalLink size={15} />
            </a>
          </div>
        )}

        {/* TAB 2: LIVE GOOGLE MAPS EMBED */}
        {activeTab === 'gmaps' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                className={`mt-outline-chip ${embedMapType === 'm' ? 'is-selected' : ''}`}
                style={{ height: 32, fontSize: 12.5 }}
                onClick={() => setEmbedMapType('m')}
              >
                🗺️ 街道定位圖
              </button>
              <button
                type="button"
                className={`mt-outline-chip ${embedMapType === 'h' ? 'is-selected' : ''}`}
                style={{ height: 32, fontSize: 12.5 }}
                onClick={() => setEmbedMapType('h')}
              >
                🛰️ 衛星街廓空拍
              </button>
            </div>
            <div
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                border: '1px solid rgba(20,19,18,0.1)',
                height: 300,
                marginBottom: 14,
                background: '#EFECE6',
              }}
            >
              <iframe
                title={`Google Maps 實景 - ${store.name}`}
                src={gmapsEmbedUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={gmapsPanoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-black-cta"
                style={{ width: '100%' }}
              >
                🚶 開啟 Google 360° 真實店門口街景照
                <ExternalLink size={15} />
              </a>
              <a
                href={gmapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-add-pill-btn"
                style={{ width: '100%', height: 40, justifyContent: 'center', textDecoration: 'none' }}
              >
                查看店家上傳實拍照・電話・營業時間
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: CRM STATUS & NOTES */}
        {activeTab === 'crm' && (
          <div>
            <div className="mt-info-label" style={{ marginBottom: 8 }}>
              目前拓點階段（點擊切換，自動儲存於本機）
            </div>
            <div className="mt-status-stepper">
              {OUTREACH_STATUSES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  className={`mt-status-step-btn ${store.status === st.id ? 'is-selected' : ''}`}
                  onClick={() => onUpdateStore(store.id, { status: st.id })}
                >
                  <span className="mt-dot" style={{ background: st.color }} />
                  {st.label}
                </button>
              ))}
            </div>

            <div className="mt-info-label" style={{ marginBottom: 8, marginTop: 18 }}>
              拜訪與寄樣備忘錄（例如：店長稱呼、店貓喜好口味、抽成條件）
            </div>
            <textarea
              className="mt-note-textarea"
              placeholder="輸入洽談紀錄，例如：4/15 已寄出珠貝凍乾與櫻花蝦試吃包，約定週四下午致電店長..."
              value={store.note || ''}
              onChange={(e) => onUpdateStore(store.id, { note: e.target.value })}
            />
            <div style={{ fontSize: 12, color: '#78716C', marginTop: 8 }}>
              ✓ 所有修改皆會自動保存，亦可於左側「拓點進度看板」匯出成 Excel CSV 報表。
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
