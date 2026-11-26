import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Plus,
  RotateCcw,
  ExternalLink,
  MapPin,
  ChevronDown,
  Check,
  Search,
  X,
  Compass,
} from 'lucide-react';
import { OUTREACH_STATUSES, REGIONS, STORE_CATEGORIES } from '../data/partnersData';

export default function PipelineBoard({
  stores,
  highlightedStoreId = null,
  onUpdateStore,
  onOpenStoreInMap,
  onOpenAddModal,
  onResetAllStatuses,
  onRestoreDefaults,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuStoreId, setOpenMenuStoreId] = useState(null);

  useEffect(() => {
    const closeMenu = () => setOpenMenuStoreId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Auto-scroll to highlighted store when jumping from 圖一 (Explore Map) -> 圖二 (Pipeline Board)
  useEffect(() => {
    if (!highlightedStoreId) return;
    setActiveTab('all');
    setRegionFilter('all');
    setSearchQuery('');
    const timer = setTimeout(() => {
      const el = document.getElementById(`pipeline-row-${highlightedStoreId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => clearTimeout(timer);
  }, [highlightedStoreId]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stores.filter((s) => {
      if (activeTab !== 'all' && s.status !== activeTab) return false;
      if (regionFilter !== 'all') {
        if (regionFilter === '高屏') {
          if (s.region !== '高雄' && s.region !== '屏東') return false;
        } else if (s.region !== regionFilter) {
          return false;
        }
      }
      if (q) {
        const hay = `${s.name} ${s.region} ${s.district} ${s.category} ${s.address} ${s.collabModel} ${s.note || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [stores, activeTab, regionFilter, searchQuery]);

  const exportCsv = () => {
    const headers = [
      '店家名稱',
      '縣市',
      '行政區',
      '業態分類',
      '拓點進度',
      '推薦切入模式',
      '推薦品項',
      '完整地址',
      'Google Maps 連結',
      '備註紀錄',
    ];
    const rows = stores.map((s) => [
      s.name,
      s.region,
      s.district,
      s.category,
      s.status,
      s.collabModel || '',
      s.recommendedSku || '',
      s.address,
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name} ${s.address}`)}`,
      s.note || '',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `毛孩點心_全台實體寄賣拓點名單_${stores.length}家.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-scroll-page">
      <div className="mt-page-container">
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              拓點進度看板
            </h1>
            <p style={{ fontSize: 14.5, color: '#57534E', margin: 0 }}>
              一眼掌握全台 {stores.length} 家門市進度；<strong>點擊任一店名、照片或「跳轉地圖位置」</strong>即可直接飛往互動地圖對應釘選！
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="mt-add-pill-btn" onClick={exportCsv}>
              <Download size={14} />
              匯出 Excel (CSV)
            </button>
            <button
              type="button"
              className="mt-black-cta"
              style={{ height: 38, padding: '0 18px', fontSize: 13.5 }}
              onClick={onOpenAddModal}
            >
              <Plus size={15} />
              新增合作店家
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {OUTREACH_STATUSES.map((st) => {
            const count = stores.filter((s) => s.status === st.id).length;
            return (
              <div
                key={st.id}
                onClick={() => setActiveTab(activeTab === st.id ? 'all' : st.id)}
                style={{
                  padding: '16px 18px',
                  borderRadius: 20,
                  background: activeTab === st.id ? st.bg : '#F7F5F0',
                  border:
                    activeTab === st.id
                      ? `1.5px solid ${st.color}`
                      : '1px solid rgba(20,19,18,0.07)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    color: st.text,
                  }}
                >
                  <span className="mt-dot" style={{ background: st.color }} />
                  {st.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6, color: '#141312' }}>
                  {count}{' '}
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#78716C' }}>家店</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* NEW: Search Box + Region Quick Filter inside Pipeline Board! */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 16,
            background: '#F7F5F0',
            padding: '12px 16px',
            borderRadius: 20,
            border: '1px solid rgba(20,19,18,0.06)',
          }}
        >
          <div className="mt-search-box" style={{ flex: '1 1 260px', background: '#FCFBF9', height: 40 }}>
            <Search size={16} color="#78716C" />
            <input
              type="text"
              placeholder="輸入店名快速找店（例如：貓咪、半刻貓、屏東、左營、美容...）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="mt-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="清除搜尋"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {REGIONS.filter((r) => r.id !== '高屏').map((reg) => {
              const isSel = regionFilter === reg.id;
              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => setRegionFilter(reg.id)}
                  style={{
                    height: 34,
                    padding: '0 12px',
                    borderRadius: 999,
                    border: isSel ? '1px solid #141312' : '1px solid #DCD7CE',
                    background: isSel ? '#141312' : '#FCFBF9',
                    color: isSel ? '#FAF8F5' : '#57534E',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {reg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mindtrip 2px Underline Tabs + Utility Reset */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            borderBottom: '1px solid rgba(20,19,18,0.085)',
            marginBottom: 20,
          }}
        >
          <div className="mt-underline-tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
            <button
              type="button"
              className={`mt-underline-tab ${activeTab === 'all' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              全部進度 ({filtered.length})
            </button>
            {OUTREACH_STATUSES.map((st) => (
              <button
                key={st.id}
                type="button"
                className={`mt-underline-tab ${activeTab === st.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(st.id)}
              >
                {st.label} ({stores.filter((s) => s.status === st.id).length})
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, paddingBottom: 8 }}>
            <button
              type="button"
              className="mt-text-btn"
              style={{ fontSize: 12.5 }}
              onClick={onResetAllStatuses}
            >
              全部清為「待聯絡」
            </button>
            <button
              type="button"
              className="mt-text-btn"
              style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={onRestoreDefaults}
            >
              <RotateCcw size={12} />
              還原預設示範資料
            </button>
          </div>
        </div>

        {/* Clean Human-Friendly Card List with Real Store Thumbnails + 1-Click Jump to Map */}
        {filtered.length === 0 ? (
          <div
            style={{
              border: '1px dashed #D6D0C4',
              borderRadius: 20,
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>👀</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>
              找不到符合條件的店家紀錄
            </div>
            <button
              type="button"
              className="mt-black-cta"
              style={{ height: 38, fontSize: 13 }}
              onClick={() => {
                setActiveTab('all');
                setRegionFilter('all');
                setSearchQuery('');
              }}
            >
              顯示全部店家
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((store) => {
              const catObj = STORE_CATEGORIES.find((c) => c.id === store.category);
              const statusObj =
                OUTREACH_STATUSES.find((st) => st.id === store.status) || OUTREACH_STATUSES[0];
              const isMenuOpen = openMenuStoreId === store.id;
              const isHighlighted = highlightedStoreId === store.id;
              const thumbSrc = store.photoUrl
                ? store.photoUrl
                : !String(store.id).startsWith('custom-')
                ? `./stores/${store.id}.jpg`
                : null;
              const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${store.name} ${store.address}`
              )}`;

              return (
                <div
                  key={store.id}
                  id={`pipeline-row-${store.id}`}
                  style={{
                    background: isHighlighted ? '#FEF9EC' : '#F7F5F0',
                    borderRadius: 20,
                    padding: '14px 18px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    border: isHighlighted
                      ? '2px solid #D97706'
                      : '1px solid rgba(20,19,18,0.06)',
                    borderLeft: `5px solid ${statusObj.color}`,
                    boxShadow: isHighlighted ? '0 8px 24px rgba(217,119,6,0.16)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Left: Clickable Store Thumbnail + Clickable Store Name -> Jumps straight to 圖一 Map! */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      flex: '1 1 320px',
                      minWidth: 0,
                    }}
                  >
                    {thumbSrc && (
                      <div
                        onClick={() => onOpenStoreInMap(store)}
                        title="點擊跳轉至互動地圖位置"
                        style={{
                          width: 66,
                          height: 66,
                          borderRadius: 14,
                          overflow: 'hidden',
                          flexShrink: 0,
                          cursor: 'pointer',
                          background: '#E7E2D8',
                          border: '1px solid rgba(20,19,18,0.08)',
                        }}
                      >
                        <img
                          src={thumbSrc}
                          alt={store.name}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => onOpenStoreInMap(store)}
                          title="點擊跳轉至互動地圖查看此店位置"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            padding: 0,
                            fontSize: 16,
                            fontWeight: 800,
                            color: '#141312',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            textDecoration: 'underline',
                            textDecorationColor: 'rgba(20,19,18,0.28)',
                            textUnderlineOffset: '3px',
                          }}
                        >
                          {store.name}
                          <Compass size={14} color="#57534E" />
                        </button>
                        <span
                          style={{
                            fontSize: 12,
                            padding: '2px 9px',
                            borderRadius: 999,
                            background: '#EFECE6',
                            color: '#57534E',
                            fontWeight: 600,
                          }}
                        >
                          {catObj ? catObj.icon : '📍'} {store.category} · {store.region}
                          {store.district}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#57534E', marginTop: 4 }}>
                        {store.address} ｜ 切入建議：{store.collabModel}
                      </div>
                      <input
                        type="text"
                        placeholder="點擊直接輸入拜訪／寄樣備註..."
                        value={store.note || ''}
                        onChange={(e) => onUpdateStore(store.id, { note: e.target.value })}
                        style={{
                          marginTop: 7,
                          width: '100%',
                          maxWidth: 480,
                          padding: '6px 11px',
                          borderRadius: 10,
                          border: '1px solid #DCD7CE',
                          background: '#FCFBF9',
                          fontSize: 12.5,
                          color: '#141312',
                        }}
                      />
                    </div>
                  </div>

                  {/* Right: Color-Coded Status Dropdown + Prominent Jump-to-Map CTA + Google Maps */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        aria-label={`${store.name} 拓點狀態`}
                        onClick={() => setOpenMenuStoreId(isMenuOpen ? null : store.id)}
                        style={{
                          height: 36,
                          padding: '0 13px',
                          borderRadius: 999,
                          border: `1.5px solid ${statusObj.border || statusObj.color}`,
                          background: statusObj.bg,
                          color: statusObj.text,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 7,
                        }}
                      >
                        <span
                          style={{
                            width: 8.5,
                            height: 8.5,
                            borderRadius: 999,
                            background: statusObj.color,
                            flexShrink: 0,
                          }}
                        />
                        <span>{statusObj.label}</span>
                        <ChevronDown size={14} style={{ opacity: 0.8 }} />
                      </button>

                      {isMenuOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            right: 0,
                            minWidth: 168,
                            background: '#FCFBF9',
                            borderRadius: 16,
                            padding: 6,
                            boxShadow:
                              '0 12px 28px rgba(20,19,18,0.16), 0 0 0 1px rgba(20,19,18,0.08)',
                            zIndex: 55,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                          }}
                        >
                          {OUTREACH_STATUSES.map((st) => {
                            const selected = store.status === st.id;
                            return (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  onUpdateStore(store.id, { status: st.id });
                                  setOpenMenuStoreId(null);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 11px',
                                  borderRadius: 11,
                                  border: selected
                                    ? `1px solid ${st.border || st.color}`
                                    : '1px solid transparent',
                                  background: selected ? st.bg : 'transparent',
                                  color: selected ? st.text : '#292524',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 8,
                                }}
                              >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                                  <span
                                    style={{
                                      width: 8.5,
                                      height: 8.5,
                                      borderRadius: 999,
                                      background: st.color,
                                    }}
                                  />
                                  {st.label}
                                </span>
                                {selected && <Check size={14} color={st.color} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="mt-black-cta"
                      style={{ height: 36, padding: '0 14px', fontSize: 12.5 }}
                      onClick={() => onOpenStoreInMap(store)}
                    >
                      <MapPin size={13} />
                      跳轉地圖位置
                    </button>

                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-add-pill-btn"
                      style={{ textDecoration: 'none', height: 36 }}
                    >
                      Google Maps
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
