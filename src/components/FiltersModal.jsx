import React from 'react';
import { X } from 'lucide-react';
import { OUTREACH_STATUSES, REGIONS, STORE_CATEGORIES } from '../data/partnersData';

export default function FiltersModal({
  isOpen,
  onClose,
  selectedRegion,
  setSelectedRegion,
  selectedDistrict = 'all',
  setSelectedDistrict = () => {},
  availableDistricts = [],
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  onlyStarred,
  setOnlyStarred,
  resultCount,
  onResetFilters,
}) {
  if (!isOpen) return null;

  return (
    <div className="mt-modal-backdrop" onClick={onClose}>
      <div className="mt-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="mt-modal-header">
          <button type="button" className="mt-modal-close" onClick={onClose} title="關閉">
            <X size={18} />
          </button>
          <h3 className="mt-modal-title">篩選合作通路 Filters</h3>
        </div>

        <div className="mt-modal-body">
          {/* Section 1: Region */}
          <div className="mt-filter-section">
            <h4 className="mt-filter-heading">縣市區域（高雄 83 家密集部署＋屏東＆全台示範點）</h4>
            <div className="mt-chip-cloud">
              {REGIONS.map((reg) => (
                <button
                  key={reg.id}
                  type="button"
                  className={`mt-outline-chip ${selectedRegion === reg.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedRegion(reg.id);
                    setSelectedDistrict('all');
                  }}
                >
                  {reg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1.5: District Sub-Filter */}
          {availableDistricts.length > 1 && (
            <div className="mt-filter-section">
              <h4 className="mt-filter-heading">行政區快篩</h4>
              <div className="mt-chip-cloud">
                <button
                  type="button"
                  className={`mt-outline-chip ${selectedDistrict === 'all' ? 'is-selected' : ''}`}
                  onClick={() => setSelectedDistrict('all')}
                >
                  全部行政區
                </button>
                {availableDistricts.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    className={`mt-outline-chip ${selectedDistrict === d.name ? 'is-selected' : ''}`}
                    onClick={() => setSelectedDistrict(d.name)}
                  >
                    {d.name} ({d.count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Store Category */}
          <div className="mt-filter-section">
            <h4 className="mt-filter-heading">店家業態分類</h4>
            <div className="mt-chip-cloud">
              {STORE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`mt-outline-chip ${selectedCategory === cat.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Outreach Status */}
          <div className="mt-filter-section">
            <h4 className="mt-filter-heading">拓點洽談進度</h4>
            <div className="mt-chip-cloud">
              <button
                type="button"
                className={`mt-outline-chip ${selectedStatus === 'all' ? 'is-selected' : ''}`}
                onClick={() => setSelectedStatus('all')}
              >
                全部進度
              </button>
              {OUTREACH_STATUSES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  className={`mt-outline-chip ${selectedStatus === st.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedStatus(st.id)}
                >
                  <span className="mt-dot" style={{ background: st.color }} />
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Starred Priority */}
          <div className="mt-filter-section">
            <h4 className="mt-filter-heading">重點名單篩選</h4>
            <div className="mt-chip-cloud">
              <button
                type="button"
                className={`mt-outline-chip ${onlyStarred ? 'is-selected' : ''}`}
                onClick={() => setOnlyStarred(!onlyStarred)}
              >
                ♥ 只顯示已加入重點關注的店家
              </button>
            </div>
          </div>
        </div>

        <div className="mt-modal-footer">
          <button type="button" className="mt-text-btn" onClick={onResetFilters}>
            清除全部篩選
          </button>
          <button type="button" className="mt-black-cta" onClick={onClose}>
            顯示 {resultCount} 家通路
          </button>
        </div>
      </div>
    </div>
  );
}
