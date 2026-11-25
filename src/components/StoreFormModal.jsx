import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { OUTREACH_STATUSES, REGIONS, STORE_CATEGORIES } from '../data/partnersData';

const REGION_DEFAULT_COORDS = {
  高雄: { lat: 22.642, lng: 120.312 },
  屏東: { lat: 22.672, lng: 120.489 },
  台南: { lat: 22.997, lng: 120.203 },
  台中: { lat: 24.153, lng: 120.658 },
  台北: { lat: 25.044, lng: 121.535 },
};

export default function StoreFormModal({ isOpen, onClose, editingStore, onSave, onDelete }) {
  const [form, setForm] = useState({
    name: '',
    region: '高雄',
    district: '三民區',
    category: '寵物美容',
    address: '',
    status: '待聯絡',
    ratingTag: '',
    collabModel: '櫃檯隨手包寄賣（35% 店方分潤）',
    recommendedSku: '海味珠貝凍乾・東港櫻花蝦肉條',
    highlight: '',
    note: '',
    lat: '',
    lng: '',
  });

  useEffect(() => {
    if (editingStore) {
      setForm({
        name: editingStore.name || '',
        region: editingStore.region || '高雄',
        district: editingStore.district || '',
        category: editingStore.category || '寵物美容',
        address: editingStore.address || '',
        status: editingStore.status || '待聯絡',
        ratingTag: editingStore.ratingTag || '',
        collabModel: editingStore.collabModel || '',
        recommendedSku: editingStore.recommendedSku || '',
        highlight: editingStore.highlight || '',
        note: editingStore.note || '',
        lat: editingStore.lat ?? '',
        lng: editingStore.lng ?? '',
      });
    } else {
      setForm({
        name: '',
        region: '高雄',
        district: '左營區',
        category: '寵物美容',
        address: '',
        status: '待聯絡',
        ratingTag: '自訂新增潛力店',
        collabModel: '櫃檯隨手包寄賣＋試吃小包',
        recommendedSku: '海味珠貝凍乾・猴頭菇養生脆片',
        highlight: '手動新增之潛力合作門市，可隨時開啟 Google Maps 實景導航與追蹤洽談進度。',
        note: '',
        lat: '',
        lng: '',
      });
    }
  }, [editingStore, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const fallback = REGION_DEFAULT_COORDS[form.region] || REGION_DEFAULT_COORDS['高雄'];
    const jitter = () => (Math.random() - 0.5) * 0.014;
    const parsedLat = form.lat !== '' && !Number.isNaN(Number(form.lat)) ? Number(form.lat) : fallback.lat + jitter();
    const parsedLng = form.lng !== '' && !Number.isNaN(Number(form.lng)) ? Number(form.lng) : fallback.lng + jitter();

    onSave({
      ...(editingStore || { id: `custom-${Date.now()}` }),
      ...form,
      name: form.name.trim(),
      address: form.address.trim() || `${form.region}${form.district}`,
      lat: parsedLat,
      lng: parsedLng,
    });
    onClose();
  };

  return (
    <div className="mt-modal-backdrop" onClick={onClose}>
      <form className="mt-modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="mt-modal-header">
          <button type="button" className="mt-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
          <h3 className="mt-modal-title">{editingStore ? '編輯合作店家資訊' : '+ 新增潛力合作店家'}</h3>
        </div>

        <div className="mt-modal-body">
          <div className="mt-form-grid">
            <div className="mt-field full">
              <label>店家名稱 *</label>
              <input
                type="text"
                required
                placeholder="例如：毛絨絨寵物美容沙龍"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="mt-field">
              <label>所在縣市</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              >
                {REGIONS.filter((r) => r.id !== 'all' && r.id !== '高屏').map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-field">
              <label>行政區／商圈</label>
              <input
                type="text"
                placeholder="例如：左營區、屏東市"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
            </div>

            <div className="mt-field">
              <label>業態分類</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {STORE_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-field">
              <label>拓點洽談狀態</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {OUTREACH_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-field full">
              <label>門市完整地址（Google Maps 將自動依店名＋地址精準定位）</label>
              <input
                type="text"
                placeholder="例如：高雄市左營區博愛二路..."
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="mt-field">
              <label>合作切入方案</label>
              <input
                type="text"
                value={form.collabModel}
                onChange={(e) => setForm({ ...form, collabModel: e.target.value })}
              />
            </div>

            <div className="mt-field">
              <label>推薦擺放品項</label>
              <input
                type="text"
                value={form.recommendedSku}
                onChange={(e) => setForm({ ...form, recommendedSku: e.target.value })}
              />
            </div>

            <div className="mt-field full">
              <label>店家特色亮點說明</label>
              <textarea
                rows={2}
                value={form.highlight}
                onChange={(e) => setForm({ ...form, highlight: e.target.value })}
              />
            </div>

            <div className="mt-field full">
              <label>內部拜訪／寄樣備註</label>
              <textarea
                rows={2}
                placeholder="例如：店長電話、試吃包寄出日期..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="mt-modal-footer">
          {editingStore ? (
            <button
              type="button"
              className="mt-text-btn"
              style={{ color: '#B91C1C', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={() => {
                onDelete(editingStore.id);
                onClose();
              }}
            >
              <Trash2 size={14} />
              刪除此店家
            </button>
          ) : (
            <span style={{ fontSize: 12, color: '#78716C' }}>免填經緯度，系統自動對應地圖</span>
          )}
          <button type="submit" className="mt-black-cta">
            儲存店家
          </button>
        </div>
      </form>
    </div>
  );
}
