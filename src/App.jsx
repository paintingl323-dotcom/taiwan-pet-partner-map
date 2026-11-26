import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Home,
  Compass,
  Calculator,
  CheckSquare,
  Heart,
  PlusSquare,
  SlidersHorizontal,
  ChevronDown,
  X,
  Plus,
  Map as MapIcon,
  List,
  Camera,
} from 'lucide-react';
import {
  INITIAL_PARTNER_STORES,
  OUTREACH_STATUSES,
  REGIONS,
  STORE_CATEGORIES,
} from './data/partnersData';
import StoreVisualCover from './components/StoreVisualCover';
import InteractiveMap from './components/InteractiveMap';
import StoreDetailDrawer from './components/StoreDetailDrawer';
import FiltersModal from './components/FiltersModal';
import StoreFormModal from './components/StoreFormModal';
import StreetViewKeyModal from './components/StreetViewKeyModal';
import HomeOverview from './components/HomeOverview';
import ProfitCalculator from './components/ProfitCalculator';
import PipelineBoard from './components/PipelineBoard';

const STORAGE_KEY_STORES = 'pawmap_partner_stores_v1';
const STORAGE_KEY_STARRED = 'pawmap_starred_ids_v1';
const STORAGE_KEY_GMAPS = 'pawmap_google_maps_api_key_v1';

function MindtripSparkle({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M14 2C14.7 8.4 17.6 11.3 24 12C17.6 12.7 14.7 15.6 14 22C13.3 15.6 10.4 12.7 4 12C10.4 11.3 13.3 8.4 14 2Z"
        fill="currentColor"
      />
      <path
        d="M22 18C22.3 20.5 23.5 21.7 26 22C23.5 22.3 22.3 23.5 22 26C21.7 23.5 20.5 22.3 18 22C20.5 21.7 21.7 20.5 22 18Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function App() {
  // Persistent Store List (auto-merges new built-in stores while preserving user status/notes & custom stores!)
  const [stores, setStores] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STORES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedMap = new Map(parsed.map((s) => [s.id, s]));
          const customStores = parsed.filter((s) => String(s.id).startsWith('custom-'));
          const mergedBuiltIns = INITIAL_PARTNER_STORES.map((base) => {
            const prev = savedMap.get(base.id);
            if (!prev) return base;
            return {
              ...base,
              status: prev.status || base.status,
              note: prev.note ?? base.note,
              photoUrl: prev.photoUrl || base.photoUrl,
            };
          });
          return [...customStores, ...mergedBuiltIns];
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_PARTNER_STORES;
  });

  // Persistent Starred IDs
  const [starredIds, setStarredIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STARRED);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['kh-01', 'kh-04', 'kh-10', 'kh-14', 'pt-01'];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(stores));
    } catch {
      // ignore
    }
  }, [stores]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STARRED, JSON.stringify(starredIds));
    } catch {
      // ignore
    }
  }, [starredIds]);

  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);

  // Navigation State: Default to 'explore' (Mindtrip's signature Floating Cards + Full-Bleed Map!)
  const [activeNav, setActiveNav] = useState(() => urlParams.get('view') || 'explore');

  // Explore Filters (Default to Kaohsiung so street-level pins look crisp like Mindtrip's city view)
  const [selectedRegion, setSelectedRegion] = useState(() => urlParams.get('region') || '高雄');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [filtersModalOpen, setFiltersModalOpen] = useState(() => urlParams.get('filters') === '1');

  // Map & Selection State
  const [hoveredStoreId, setHoveredStoreId] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(() => urlParams.get('store') || null);
  const [pipelineFocusId, setPipelineFocusId] = useState(null);
  const [mapMode, setMapMode] = useState(() => urlParams.get('mapMode') || 'cluster'); // 'cluster' | 'gmaps'
  const [fitTrigger, setFitTrigger] = useState(0);
  const [mobileShowMap, setMobileShowMap] = useState(() => urlParams.get('mobileMap') === '1');
  const initialDrawerTab = urlParams.get('tab') || 'overview';

  // Auto-scroll the left Explore card list to the selected store card whenever selectedStoreId changes!
  useEffect(() => {
    if (activeNav !== 'explore' || !selectedStoreId) return undefined;
    const timer = setTimeout(() => {
      const cardEl = document.getElementById(`explore-card-${selectedStoreId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 90);
    return () => clearTimeout(timer);
  }, [activeNav, selectedStoreId]);

  // Add / Edit Store Modal & Street View API Key Modal
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [streetViewModalOpen, setStreetViewModalOpen] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_GMAPS) || '';
    } catch {
      return '';
    }
  });

  const handleSaveGoogleKey = (key) => {
    setGoogleApiKey(key);
    try {
      if (key) localStorage.setItem(STORAGE_KEY_GMAPS, key);
      else localStorage.removeItem(STORAGE_KEY_GMAPS);
    } catch {
      // ignore
    }
  };

  const matchesRegion = (store, regionId) => {
    if (regionId === 'all') return true;
    if (regionId === '高屏') return store.region === '高雄' || store.region === '屏東';
    return store.region === regionId;
  };

  const availableDistricts = useMemo(() => {
    const counts = new Map();
    stores.forEach((s) => {
      if (matchesRegion(s, selectedRegion) && s.district) {
        counts.set(s.district, (counts.get(s.district) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [stores, selectedRegion]);

  // Filtered Stores
  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stores.filter((store) => {
      if (!matchesRegion(store, selectedRegion)) return false;
      if (selectedDistrict !== 'all' && store.district !== selectedDistrict) return false;
      if (selectedCategory !== 'all' && store.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && store.status !== selectedStatus) return false;
      if (onlyStarred && !starredIds.includes(store.id)) return false;
      if (q) {
        const hay = `${store.name} ${store.region} ${store.district} ${store.category} ${store.address} ${store.collabModel} ${store.recommendedSku} ${store.highlight}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [stores, selectedRegion, selectedDistrict, selectedCategory, selectedStatus, onlyStarred, starredIds, searchQuery]);

  const selectedStore = useMemo(
    () => stores.find((s) => s.id === selectedStoreId) || null,
    [stores, selectedStoreId]
  );

  // Re-fit map bounds whenever region or category changes
  const triggerFit = () => setFitTrigger((n) => n + 1);

  const handleRegionChange = (regionId) => {
    setSelectedRegion(regionId);
    setSelectedDistrict('all');
    setRegionMenuOpen(false);
    setTimeout(triggerFit, 40);
  };

  const handleToggleStar = (id) => {
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCycleStatus = (id) => {
    const order = OUTREACH_STATUSES.map((s) => s.id);
    setStores((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextIdx = (order.indexOf(s.status) + 1) % order.length;
        return { ...s, status: order[nextIdx] };
      })
    );
  };

  const handleUpdateStore = (id, patch) => {
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const handleSaveStore = (savedObj) => {
    setStores((prev) => {
      const exists = prev.some((s) => s.id === savedObj.id);
      if (exists) return prev.map((s) => (s.id === savedObj.id ? savedObj : s));
      return [savedObj, ...prev];
    });
    setSelectedStoreId(savedObj.id);
    setActiveNav('explore');
  };

  const handleDeleteStore = (id) => {
    setStores((prev) => prev.filter((s) => s.id !== id));
    if (selectedStoreId === id) setSelectedStoreId(null);
  };

  const handleJumpToExplore = ({ region, category, onlyStar = false }) => {
    if (region !== undefined) setSelectedRegion(region);
    if (category !== undefined) setSelectedCategory(category);
    setOnlyStarred(onlyStar);
    setActiveNav('explore');
    setMobileShowMap(false);
    setTimeout(triggerFit, 60);
  };

  const handleOpenStoreInMap = (store) => {
    setSelectedRegion(store.region || 'all');
    setSelectedDistrict('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setOnlyStarred(false);
    setMapMode('cluster');
    setSelectedStoreId(store.id);
    setActiveNav('explore');
    setMobileShowMap(false);
  };

  const handleJumpToPipeline = (storeId) => {
    setPipelineFocusId(storeId);
    setActiveNav('pipeline');
  };

  const handleResetFilters = () => {
    setSelectedRegion('all');
    setSelectedDistrict('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setOnlyStarred(false);
    setSearchQuery('');
    setTimeout(triggerFit, 50);
  };

  const activeFilterBadgeCount =
    (selectedDistrict !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0) +
    (onlyStarred ? 1 : 0);

  const currentRegionObj = REGIONS.find((r) => r.id === selectedRegion) || REGIONS[0];
  const activePartnersCount = stores.filter((s) => s.status === '已上架合作').length;

  return (
    <div className="mt-shell">
      {/* ==================== 56px MINDTRIP VERTICAL ICON RAIL ==================== */}
      <nav
        className={`mt-rail ${activeNav === 'explore' ? 'mt-rail--map-abuts' : ''}`}
        aria-label="主導覽列"
      >
        <div className="mt-rail-top">
          <button
            type="button"
            className="mt-sparkle-btn"
            title="pawmap. 毛孩通路拓點地圖"
            onClick={() => setActiveNav('home')}
          >
            <MindtripSparkle size={24} />
          </button>

          {/* 1. Home Overview */}
          <div className="mt-rail-item-wrap">
            <button
              type="button"
              className={`mt-rail-btn ${activeNav === 'home' ? 'is-active' : ''}`}
              onClick={() => setActiveNav('home')}
              aria-label="通路部署首頁"
            >
              <Home size={21} strokeWidth={activeNav === 'home' ? 2.4 : 1.9} />
            </button>
            {activeNav === 'home' && <span className="mt-rail-indicator" />}
            <span className="mt-tooltip">部署攻略首頁</span>
          </div>

          {/* 2. Explore Split-Screen Map */}
          <div className="mt-rail-item-wrap">
            <button
              type="button"
              className={`mt-rail-btn ${activeNav === 'explore' && !onlyStarred ? 'is-active' : ''}`}
              onClick={() => {
                setOnlyStarred(false);
                setActiveNav('explore');
              }}
              aria-label="互動拓點地圖"
            >
              <Compass
                size={21}
                strokeWidth={activeNav === 'explore' && !onlyStarred ? 2.4 : 1.9}
              />
            </button>
            {activeNav === 'explore' && !onlyStarred && <span className="mt-rail-indicator" />}
            <span className="mt-tooltip">互動拓點地圖 ({stores.length})</span>
          </div>

          {/* 3. Consignment Profit Calculator */}
          <div className="mt-rail-item-wrap">
            <button
              type="button"
              className={`mt-rail-btn ${activeNav === 'calculator' ? 'is-active' : ''}`}
              onClick={() => setActiveNav('calculator')}
              aria-label="寄賣分潤試算"
            >
              <Calculator size={21} strokeWidth={activeNav === 'calculator' ? 2.4 : 1.9} />
            </button>
            {activeNav === 'calculator' && <span className="mt-rail-indicator" />}
            <span className="mt-tooltip">寄賣分潤試算</span>
          </div>

          {/* 4. Outreach Pipeline Board */}
          <div className="mt-rail-item-wrap">
            <button
              type="button"
              className={`mt-rail-btn ${activeNav === 'pipeline' ? 'is-active' : ''}`}
              onClick={() => setActiveNav('pipeline')}
              aria-label="拓點進度看板"
            >
              <CheckSquare size={21} strokeWidth={activeNav === 'pipeline' ? 2.4 : 1.9} />
              {activePartnersCount > 0 && (
                <span className="mt-rail-badge">{activePartnersCount}</span>
              )}
            </button>
            {activeNav === 'pipeline' && <span className="mt-rail-indicator" />}
            <span className="mt-tooltip">拓點進度與匯出</span>
          </div>

          {/* 5. Starred Priority Stores */}
          <div className="mt-rail-item-wrap">
            <button
              type="button"
              className={`mt-rail-btn ${activeNav === 'explore' && onlyStarred ? 'is-active' : ''}`}
              onClick={() => handleJumpToExplore({ region: 'all', category: 'all', onlyStar: true })}
              aria-label="重點關注店家"
            >
              <Heart size={20} strokeWidth={activeNav === 'explore' && onlyStarred ? 2.4 : 1.9} />
            </button>
            {activeNav === 'explore' && onlyStarred && <span className="mt-rail-indicator" />}
            <span className="mt-tooltip">重點關注名單 ({starredIds.length})</span>
          </div>

          {/* 6. Quick Add Store */}
          <div className="mt-rail-item-wrap">
            <button
              type="button"
              className="mt-rail-btn"
              onClick={() => {
                setEditingStore(null);
                setStoreModalOpen(true);
              }}
              aria-label="新增合作店家"
            >
              <PlusSquare size={20} strokeWidth={1.9} />
            </button>
            <span className="mt-tooltip">+ 新增合作店家</span>
          </div>
        </div>

        {/* Bottom Vertical Mindtrip-style Wordmark */}
        <div className="mt-rail-bottom">
          <div
            className="mt-vertical-wordmark"
            onClick={() => setActiveNav('explore')}
            title="pawmap. 毛孩點心通路地圖"
          >
            <MindtripSparkle size={14} />
            <span>pawmap.</span>
          </div>
          <div className="mt-avatar-pill" title="毛孩點心通路部署專案">
            毛孩
          </div>
        </div>
      </nav>

      {/* ==================== MAIN CONTENT STAGE ==================== */}
      <main className="mt-main">
        {/* VIEW 1: EXPLORE SPLIT-SCREEN (FLOATING LEFT PANEL + FULL-BLEED MAP) */}
        {activeNav === 'explore' && (
          <div className="mt-explore-stage">
            {/* Full-Bleed Map Backdrop */}
            <InteractiveMap
              stores={filteredStores}
              selectedRegion={selectedRegion}
              hoveredStoreId={hoveredStoreId}
              selectedStore={selectedStore}
              onSelectStore={(s) => {
                setSelectedStoreId(s.id);
                setMobileShowMap(false);
              }}
              mapMode={mapMode}
              setMapMode={setMapMode}
              fitTrigger={fitTrigger}
            />

            {/* Floating Left Mindtrip Card Panel */}
            <section
              className={`mt-floating-panel ${mobileShowMap ? 'is-mobile-hidden' : ''}`}
              aria-label="合作通路探索清單"
            >
              <div className="mt-panel-header">
                {/* Row 1: City Dropdown Heading + Add Store Pill */}
                <div className="mt-region-row">
                  <div className="mt-region-MenuWrap">
                    <button
                      type="button"
                      className="mt-region-trigger"
                      onClick={() => setRegionMenuOpen(!regionMenuOpen)}
                    >
                      <span>{onlyStarred ? '♥ 重點關注名單' : currentRegionObj.label}</span>
                      <ChevronDown size={20} />
                    </button>

                    {regionMenuOpen && (
                      <div className="mt-region-dropdown">
                        {REGIONS.map((reg) => {
                          const count = stores.filter((s) => matchesRegion(s, reg.id)).length;
                          return (
                            <button
                              key={reg.id}
                              type="button"
                              className={`mt-region-option ${
                                selectedRegion === reg.id && !onlyStarred ? 'is-selected' : ''
                              }`}
                              onClick={() => {
                                setOnlyStarred(false);
                                handleRegionChange(reg.id);
                              }}
                            >
                              <span>{reg.label}</span>
                              <span style={{ fontSize: 12, opacity: 0.75 }}>{count} 家</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {['高雄', '屏東', 'all'].map((rid) => {
                      const label = rid === 'all' ? `全台 ${stores.length}` : rid;
                      const isCurr = selectedRegion === rid && !onlyStarred;
                      return (
                        <button
                          key={rid}
                          type="button"
                          onClick={() => {
                            setOnlyStarred(false);
                            handleRegionChange(rid);
                          }}
                          style={{
                            height: 30,
                            padding: '0 10px',
                            borderRadius: 999,
                            border: isCurr ? '1px solid #141312' : '1px solid #DCD7CE',
                            background: isCurr ? '#141312' : '#FCFBF9',
                            color: isCurr ? '#FAF8F5' : '#57534E',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      className="mt-add-pill-btn"
                      style={{
                        height: 30,
                        padding: '0 10px',
                        fontSize: 12,
                        background: googleApiKey ? '#DCFCE7' : undefined,
                        borderColor: googleApiKey ? '#4ADE80' : undefined,
                        color: googleApiKey ? '#166534' : undefined,
                      }}
                      title="設定自動抓取 Google 真實門牌街景照片"
                      onClick={() => setStreetViewModalOpen(true)}
                    >
                      <Camera size={13} />
                      {googleApiKey ? '已開街景' : '門牌照'}
                    </button>
                    <button
                      type="button"
                      className="mt-add-pill-btn"
                      style={{ height: 30, padding: '0 11px', fontSize: 12 }}
                      onClick={() => {
                        setEditingStore(null);
                        setStoreModalOpen(true);
                      }}
                    >
                      <Plus size={13} />
                      新增
                    </button>
                  </div>
                </div>

                {/* Row 2: Pill Search Input + Filters Button */}
                <div className="mt-search-row">
                  <div className="mt-search-box">
                    <Search size={16} color="#78716C" />
                    <input
                      type="text"
                      placeholder="搜尋店名、高雄三民、屏東、貓咖、美容..."
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

                  <button
                    type="button"
                    className={`mt-filters-btn ${activeFilterBadgeCount > 0 ? 'has-active' : ''}`}
                    onClick={() => setFiltersModalOpen(true)}
                  >
                    <SlidersHorizontal size={15} />
                    篩選
                    {activeFilterBadgeCount > 0 && (
                      <span className="mt-filter-count">{activeFilterBadgeCount}</span>
                    )}
                  </button>
                </div>

                {/* Row 3: Mindtrip Horizontal Category Pill Tabs */}
                <div className="mt-cat-tabs" role="tablist">
                  {STORE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={selectedCategory === cat.id}
                      className={`mt-cat-pill ${selectedCategory === cat.id ? 'is-active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setTimeout(triggerFit, 40);
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.id === 'all' ? '全部' : cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact 4-Stage Pipeline Filter Strip */}
              <div className="mt-pipeline-mini">
                <div className="mt-pipeline-dots">
                  <button
                    type="button"
                    className={`mt-status-chip-mini ${selectedStatus === 'all' ? 'is-active' : ''}`}
                    onClick={() => setSelectedStatus('all')}
                  >
                    全部 ({filteredStores.length})
                  </button>
                  {OUTREACH_STATUSES.map((st) => {
                    const c = stores.filter(
                      (s) =>
                        matchesRegion(s, selectedRegion) &&
                        (selectedCategory === 'all' || s.category === selectedCategory) &&
                        s.status === st.id
                    ).length;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        className={`mt-status-chip-mini ${
                          selectedStatus === st.id ? 'is-active' : ''
                        }`}
                        style={
                          selectedStatus === st.id
                            ? {
                                background: st.bg,
                                borderColor: st.border || st.color,
                                color: st.text,
                              }
                            : undefined
                        }
                        onClick={() =>
                          setSelectedStatus(selectedStatus === st.id ? 'all' : st.id)
                        }
                      >
                        <span className="mt-dot" style={{ background: st.color }} />
                        {st.label} {c}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => handleJumpToPipeline(selectedStoreId)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#141312',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    textDecoration: 'underline',
                    padding: '2px 0',
                  }}
                  title="切換至拓點進度看板檢視清單"
                >
                  進度看板 ↗
                </button>
              </div>

              {/* Scrollable 2-Column Visual Store Card Grid */}
              <div className="mt-panel-body">
                {filteredStores.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '48px 16px',
                      color: '#57534E',
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🐾</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                      找不到符合目前篩選條件的店家
                    </div>
                    <p style={{ fontSize: 13, margin: '0 0 16px' }}>
                      試著切換回「全台總覽」或清除搜尋關鍵字
                    </p>
                    <button
                      type="button"
                      className="mt-black-cta"
                      style={{ height: 36, fontSize: 13 }}
                      onClick={handleResetFilters}
                    >
                      顯示全部 {stores.length} 家通路
                    </button>
                  </div>
                ) : (
                  <div className="mt-cards-grid">
                    {filteredStores.map((store) => {
                      const catObj = STORE_CATEGORIES.find((c) => c.id === store.category);
                      const isSelected = selectedStoreId === store.id;
                      return (
                        <article
                          key={store.id}
                          id={`explore-card-${store.id}`}
                          className={`mt-place-card ${isSelected ? 'is-selected' : ''}`}
                          onMouseEnter={() => setHoveredStoreId(store.id)}
                          onMouseLeave={() => setHoveredStoreId(null)}
                          onClick={() => setSelectedStoreId(store.id)}
                        >
                          <StoreVisualCover
                            store={store}
                            isStarred={starredIds.includes(store.id)}
                            onToggleStar={handleToggleStar}
                            onCycleStatus={handleCycleStatus}
                            googleApiKey={googleApiKey}
                          />

                          <div className="mt-card-title-row">
                            <h3 className="mt-card-title">{store.name}</h3>
                          </div>

                          <div className="mt-card-meta-line">
                            <span>{catObj ? catObj.icon : '📍'}</span>
                            <span>{store.category}</span>
                            <span>·</span>
                            <span>
                              {store.region} {store.district}
                            </span>
                          </div>

                          <div className="mt-card-pitch-line" title={store.collabModel}>
                            {store.collabModel}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Right-Side Mindtrip Place Detail Drawer when a Store is Selected */}
            {selectedStore && (
              <StoreDetailDrawer
                key={selectedStore.id}
                store={selectedStore}
                isStarred={starredIds.includes(selectedStore.id)}
                onToggleStar={handleToggleStar}
                onClose={() => setSelectedStoreId(null)}
                onUpdateStore={handleUpdateStore}
                googleApiKey={googleApiKey}
                initialTab={initialDrawerTab}
                onEditModal={(st) => {
                  setEditingStore(st);
                  setStoreModalOpen(true);
                }}
                onJumpToPipeline={handleJumpToPipeline}
              />
            )}

            {/* Mobile Floating Pill Toggle (Map <-> List) */}
            {!selectedStore && (
              <button
                type="button"
                className="mt-mobile-toggle-pill"
                onClick={() => setMobileShowMap(!mobileShowMap)}
              >
                {mobileShowMap ? <List size={16} /> : <MapIcon size={16} />}
                {mobileShowMap ? `返回店家列表 (${filteredStores.length})` : '切換互動地圖'}
              </button>
            )}
          </div>
        )}

        {/* VIEW 2: HOME OVERVIEW (MINDTRIP /home STYLE) */}
        {activeNav === 'home' && (
          <HomeOverview
            stores={stores}
            starredIds={starredIds}
            onToggleStar={handleToggleStar}
            onCycleStatus={handleCycleStatus}
            onJumpToExplore={handleJumpToExplore}
            onOpenStoreInMap={handleOpenStoreInMap}
            onNavigateTab={setActiveNav}
            googleApiKey={googleApiKey}
          />
        )}

        {/* VIEW 3: CONSIGNMENT PROFIT-SPLIT CALCULATOR */}
        {activeNav === 'calculator' && (
          <ProfitCalculator stores={stores} onJumpToExplore={handleJumpToExplore} />
        )}

        {/* VIEW 4: OUTREACH PIPELINE BOARD & CSV EXPORT */}
        {activeNav === 'pipeline' && (
          <PipelineBoard
            stores={stores}
            highlightedStoreId={pipelineFocusId}
            onUpdateStore={handleUpdateStore}
            onOpenStoreInMap={handleOpenStoreInMap}
            onOpenAddModal={() => {
              setEditingStore(null);
              setStoreModalOpen(true);
            }}
            onResetAllStatuses={() =>
              setStores((prev) => prev.map((s) => ({ ...s, status: '待聯絡', note: '' })))
            }
            onRestoreDefaults={() => {
              setStores(INITIAL_PARTNER_STORES);
              localStorage.removeItem(STORAGE_KEY_STORES);
            }}
          />
        )}
      </main>

      {/* Mindtrip Filters Modal */}
      <FiltersModal
        isOpen={filtersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
        selectedRegion={selectedRegion}
        setSelectedRegion={(r) => {
          setSelectedRegion(r);
          setSelectedDistrict('all');
          setTimeout(triggerFit, 40);
        }}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={(d) => {
          setSelectedDistrict(d);
          setTimeout(triggerFit, 40);
        }}
        availableDistricts={availableDistricts}
        selectedCategory={selectedCategory}
        setSelectedCategory={(c) => {
          setSelectedCategory(c);
          setTimeout(triggerFit, 40);
        }}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        onlyStarred={onlyStarred}
        setOnlyStarred={setOnlyStarred}
        resultCount={filteredStores.length}
        onResetFilters={handleResetFilters}
      />

      {/* Add / Edit Store Modal */}
      <StoreFormModal
        isOpen={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
        editingStore={editingStore}
        onSave={handleSaveStore}
        onDelete={handleDeleteStore}
      />

      {/* Google Street View API Key Modal */}
      <StreetViewKeyModal
        isOpen={streetViewModalOpen}
        onClose={() => setStreetViewModalOpen(false)}
        googleApiKey={googleApiKey}
        onSaveKey={handleSaveGoogleKey}
      />
    </div>
  );
}
