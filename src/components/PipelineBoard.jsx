import React, { useState } from 'react';
import { Download, Plus, RotateCcw, ExternalLink, MapPin } from 'lucide-react';
import { OUTREACH_STATUSES, STORE_CATEGORIES } from '../data/partnersData';

export default function PipelineBoard({
  stores,
  onUpdateStore,
  onOpenStoreInMap,
  onOpenAddModal,
  onResetAllStatuses,
  onRestoreDefaults,
}) {
  const [activeTab, setActiveTab] = useState('all');

  const filtered =
    activeTab === 'all' ? stores : stores.filter((s) => s.status === activeTab);

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
        {/* Top Header + Mindtrip Solid Black Action Pill (matching user's /agents screenshot) */}
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
              一眼掌握全台 {stores.length} 家合作目標門市的寄樣、洽談與上架進度，隨時匯出業務報表。
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
            marginBottom: 24,
          }}
        >
          {OUTREACH_STATUSES.map((st) => {
            const count = stores.filter((s) => s.status === st.id).length;
            return (
              <div
                key={st.id}
                onClick={() => setActiveTab(st.id)}
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
              全部店家 ({stores.length})
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

        {/* Clean Human-Friendly Card List (No Dense Admin Spreadsheet!) */}
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
              目前此階段尚無店家紀錄
            </div>
            <button
              type="button"
              className="mt-black-cta"
              style={{ height: 38, fontSize: 13 }}
              onClick={() => setActiveTab('all')}
            >
              返回檢視全部店家
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((store) => {
              const catObj = STORE_CATEGORIES.find((c) => c.id === store.category);
              const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${store.name} ${store.address}`
              )}`;
              return (
                <div
                  key={store.id}
                  style={{
                    background: '#F7F5F0',
                    borderRadius: 20,
                    padding: '16px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    border: '1px solid rgba(20,19,18,0.06)',
                  }}
                >
                  <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 16, color: '#141312' }}>{store.name}</strong>
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
                        marginTop: 8,
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <select
                      aria-label={`${store.name} 拓點狀態`}
                      value={store.status}
                      onChange={(e) => onUpdateStore(store.id, { status: e.target.value })}
                      style={{
                        height: 36,
                        padding: '0 12px',
                        borderRadius: 999,
                        border: '1px solid #DCD7CE',
                        background: '#FCFBF9',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {OUTREACH_STATUSES.map((st) => (
                        <option key={st.id} value={st.id}>
                          ● {st.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="mt-add-pill-btn"
                      onClick={() => onOpenStoreInMap(store)}
                    >
                      <MapPin size={13} />
                      地圖定位
                    </button>

                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-add-pill-btn"
                      style={{ textDecoration: 'none' }}
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
