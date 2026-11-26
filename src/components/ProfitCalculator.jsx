import React, { useState } from 'react';
import { Calculator, Store, TrendingUp, Sparkles } from 'lucide-react';

const PRESETS = [
  {
    id: 'main-pack',
    label: '主力正裝包（$190）',
    desc: '珠貝凍乾／巴西蘑菇肉條正裝袋',
    retailPrice: 190,
    unitCost: 55,
    storeCutPct: 35,
    activeStores: 20,
    packsPerStore: 18,
  },
  {
    id: 'mini-pack',
    label: '櫃檯隨手包／扭蛋包（$49）',
    desc: '貓咖餵食互動包・遛狗獎勵小包',
    retailPrice: 49,
    unitCost: 14,
    storeCutPct: 30,
    activeStores: 25,
    packsPerStore: 45,
  },
  {
    id: 'gift-box',
    label: '美容・旅宿聯名禮盒（$320）',
    desc: '連假住宿退房禮盒・機能保養組',
    retailPrice: 320,
    unitCost: 92,
    storeCutPct: 35,
    activeStores: 15,
    packsPerStore: 12,
  },
];

export default function ProfitCalculator({ stores, onJumpToExplore }) {
  const [activePreset, setActivePreset] = useState('main-pack');
  const [retailPrice, setRetailPrice] = useState(190);
  const [unitCost, setUnitCost] = useState(55);
  const [storeCutPct, setStoreCutPct] = useState(35);
  const [activeStores, setActiveStores] = useState(20);
  const [packsPerStore, setPacksPerStore] = useState(18);

  const progressedStoreCount = Math.max(
    1,
    stores.filter((s) => s.status === '已上架合作' || s.status === '洽談中').length
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setRetailPrice(p.retailPrice);
    setUnitCost(p.unitCost);
    setStoreCutPct(p.storeCutPct);
    setActiveStores(p.activeStores);
    setPacksPerStore(p.packsPerStore);
  };

  const storeProfitPerPack = Math.round((retailPrice * storeCutPct) / 100);
  const brandNetPerPack = retailPrice - storeProfitPerPack - unitCost;
  const brandMarginPct = retailPrice > 0 ? Math.round((brandNetPerPack / retailPrice) * 100) : 0;

  const totalMonthlyPacks = activeStores * packsPerStore;
  const totalMonthlyGross = totalMonthlyPacks * retailPrice;
  const totalMonthlyStoreCut = totalMonthlyPacks * storeProfitPerPack;
  const totalMonthlyNet = totalMonthlyPacks * brandNetPerPack;
  const totalAnnualNet = totalMonthlyNet * 12;

  const costShareWidth = Math.max(5, Math.min(85, Math.round((unitCost / retailPrice) * 100)));
  const storeShareWidth = Math.max(5, Math.min(85, storeCutPct));
  const brandShareWidth = Math.max(0, 100 - costShareWidth - storeShareWidth);

  return (
    <div className="mt-scroll-page">
      <div className="mt-page-container">
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 999,
              background: '#EFECE6',
              fontSize: 12.5,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            <Calculator size={14} />
            B2B 實體通路寄賣算盤
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            寄賣分潤試算：鋪進店家到底能賺多少？
          </h1>
          <p style={{ fontSize: 15, color: '#57534E', margin: 0, lineHeight: 1.6 }}>
            不用懂複雜會計表，拉動下方滑桿，一眼看懂「給寵物美容／貓咖抽成後，每包還剩多少淨利、鋪滿幾家店能創造多少穩定月收入」。
          </p>
        </div>

        {/* One-Click Product Presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`mt-outline-chip ${activePreset === p.id ? 'is-selected' : ''}`}
              style={{ height: 40, padding: '0 16px' }}
              onClick={() => applyPreset(p)}
            >
              <Sparkles size={14} />
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-calc-grid">
          {/* Left: Interactive Sliders */}
          <div className="mt-surface-card">
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 20px' }}>
              調整產品定價與合作家數
            </h3>

            <div className="mt-slider-group">
              <div className="mt-slider-header">
                <span className="mt-slider-title">1. 單包終端售價（客人買的價格）</span>
                <span className="mt-slider-val">NT$ {retailPrice}</span>
              </div>
              <input
                type="range"
                className="mt-range"
                min={35}
                max={450}
                step={5}
                value={retailPrice}
                onChange={(e) => {
                  setActivePreset('custom');
                  setRetailPrice(Number(e.target.value));
                }}
              />
            </div>

            <div className="mt-slider-group">
              <div className="mt-slider-header">
                <span className="mt-slider-title">2. 單包食材＋代工包裝成本</span>
                <span className="mt-slider-val">NT$ {unitCost}</span>
              </div>
              <input
                type="range"
                className="mt-range"
                min={10}
                max={200}
                step={2}
                value={unitCost}
                onChange={(e) => {
                  setActivePreset('custom');
                  setUnitCost(Number(e.target.value));
                }}
              />
            </div>

            <div className="mt-slider-group">
              <div className="mt-slider-header">
                <span className="mt-slider-title">3. 給合作店家的寄賣抽成比例</span>
                <span className="mt-slider-val">{storeCutPct}%（店賺 ${storeProfitPerPack}/包）</span>
              </div>
              <input
                type="range"
                className="mt-range"
                min={20}
                max={45}
                step={1}
                value={storeCutPct}
                onChange={(e) => {
                  setActivePreset('custom');
                  setStoreCutPct(Number(e.target.value));
                }}
              />
              <div style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>
                💡 業界行情：獨立貓咖與寵物美容「寄賣（賣出才月結）」常見抽成為 30%–35%；若店家願意「買斷進貨」可讓利至 40%。
              </div>
            </div>

            <div className="mt-slider-group">
              <div className="mt-slider-header">
                <span className="mt-slider-title">4. 成功上架的合作店家數</span>
                <span className="mt-slider-val">{activeStores} 家店</span>
              </div>
              <input
                type="range"
                className="mt-range"
                min={1}
                max={120}
                step={1}
                value={activeStores}
                onChange={(e) => setActiveStores(Number(e.target.value))}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                <button
                  type="button"
                  className="mt-add-pill-btn"
                  style={{ height: 28, fontSize: 11.5, padding: '0 10px' }}
                  onClick={() => setActiveStores(progressedStoreCount)}
                >
                  套用目前地圖洽談／已上架（{progressedStoreCount} 家）
                </button>
                <button
                  type="button"
                  className="mt-add-pill-btn"
                  style={{ height: 28, fontSize: 11.5, padding: '0 10px' }}
                  onClick={() => setActiveStores(30)}
                >
                  高屏首波 30 家
                </button>
                <button
                  type="button"
                  className="mt-add-pill-btn"
                  style={{ height: 28, fontSize: 11.5, padding: '0 10px' }}
                  onClick={() =>
                    setActiveStores(stores.filter((s) => s.region === '高雄').length)
                  }
                >
                  高雄全區（{stores.filter((s) => s.region === '高雄').length} 家）
                </button>
              </div>
            </div>

            <div className="mt-slider-group" style={{ marginBottom: 0 }}>
              <div className="mt-slider-header">
                <span className="mt-slider-title">5. 平均每家店每月賣出包數</span>
                <span className="mt-slider-val">
                  {packsPerStore} 包/月（約每兩天賣 {(packsPerStore / 15).toFixed(1)} 包）
                </span>
              </div>
              <input
                type="range"
                className="mt-range"
                min={5}
                max={80}
                step={1}
                value={packsPerStore}
                onChange={(e) => setPacksPerStore(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Right: Plain-Language Result Readout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: '#141312',
                color: '#FAF8F5',
                borderRadius: 24,
                padding: '26px 26px',
              }}
            >
              <div style={{ fontSize: 13, color: '#A8A29E', fontWeight: 600, marginBottom: 6 }}>
                {activeStores} 家合作門市 · 每月預估品牌實拿淨利
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: brandNetPerPack >= 0 ? '#6EE7B7' : '#FCA5A5',
                  marginBottom: 6,
                }}
              >
                NT$ {totalMonthlyNet.toLocaleString()}
                <span style={{ fontSize: 16, fontWeight: 600, color: '#FAF8F5' }}> / 月</span>
              </div>
              <div style={{ fontSize: 13.5, color: '#D6D3D1', marginBottom: 20 }}>
                一年 12 個月累積穩定通路淨利：
                <strong style={{ color: '#FFFFFF', marginLeft: 4 }}>
                  NT$ {totalAnnualNet.toLocaleString()}
                </strong>
              </div>

              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.12)',
                  paddingTop: 16,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ color: '#A8A29E' }}>全通路每月總銷量</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>
                    {totalMonthlyPacks.toLocaleString()} 包
                  </div>
                </div>
                <div>
                  <div style={{ color: '#A8A29E' }}>全通路終端總營業額</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>
                    NT$ {totalMonthlyGross.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#A8A29E' }}>合作店家合計賺走分潤</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2, color: '#FCD34D' }}>
                    NT$ {totalMonthlyStoreCut.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#A8A29E' }}>品牌單包淨利率</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>
                    {brandMarginPct}%（${brandNetPerPack}/包）
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Per-Pack Breakdown Card */}
            <div className="mt-surface-card" style={{ padding: 22 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 12 }}>
                單包售價 NT$ {retailPrice} 的錢去哪裡了？
              </div>

              <div
                style={{
                  display: 'flex',
                  height: 18,
                  borderRadius: 999,
                  overflow: 'hidden',
                  marginBottom: 14,
                  background: '#E7E5E4',
                }}
              >
                <div
                  style={{ width: `${storeShareWidth}%`, background: '#F59E0B' }}
                  title="店家分潤"
                />
                <div
                  style={{ width: `${costShareWidth}%`, background: '#78716C' }}
                  title="製作成本"
                />
                <div
                  style={{ width: `${brandShareWidth}%`, background: '#1F8A5B' }}
                  title="品牌實拿淨利"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <span className="mt-dot" style={{ background: '#F59E0B', marginRight: 6 }} />
                    給寵物店／貓咖老闆抽成（{storeCutPct}%）
                  </span>
                  <strong>NT$ {storeProfitPerPack}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <span className="mt-dot" style={{ background: '#78716C', marginRight: 6 }} />
                    食材原料＋代工包裝成本
                  </span>
                  <strong>NT$ {unitCost}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    borderTop: '1px solid rgba(20,19,18,0.08)',
                    color: brandNetPerPack >= 0 ? '#166534' : '#B91C1C',
                  }}
                >
                  <span>
                    <span className="mt-dot" style={{ background: '#1F8A5B', marginRight: 6 }} />
                    <strong>我們實拿落袋淨利</strong>
                  </span>
                  <strong>NT$ {brandNetPerPack} / 包</strong>
                </div>
              </div>
            </div>

            <div className="mt-surface-card" style={{ padding: '18px 22px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 13, color: '#44403C', lineHeight: 1.55 }}>
                  <TrendingUp
                    size={15}
                    style={{ display: 'inline', verticalAlign: '-2px', marginRight: 5 }}
                  />
                  <strong>談判超好切入：</strong>
                  對美容店與貓咖來說「不用先掏錢囤貨、擺在櫃檯賣掉一包就現賺 ${storeProfitPerPack}」，老闆幾乎零拒絕理由！
                </div>
                <button
                  type="button"
                  className="mt-add-pill-btn"
                  style={{ flexShrink: 0 }}
                  onClick={() => onJumpToExplore({ region: '高雄' })}
                >
                  <Store size={14} />
                  去挑店
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
