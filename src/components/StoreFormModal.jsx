import React, { useState, useEffect } from 'react';
import { X, Trash2, Link2, Sparkles, Loader2 } from 'lucide-react';
import { OUTREACH_STATUSES, REGIONS, STORE_CATEGORIES } from '../data/partnersData';

const REGION_DEFAULT_COORDS = {
  高雄: { lat: 22.642, lng: 120.312 },
  屏東: { lat: 22.672, lng: 120.489 },
  台南: { lat: 22.997, lng: 120.203 },
  台中: { lat: 24.153, lng: 120.658 },
  台北: { lat: 25.044, lng: 121.535 },
};

function guessCategoryAndCollab(nameText) {
  const s = String(nameText || '');
  if (/美容|沙龍|澡|洗|造型|SPA/i.test(s)) {
    return {
      category: '寵物美容',
      collabModel: '洗護結帳檯立牌寄賣＋洗澡獎勵小包',
      recommendedSku: '巴西蘑菇保健肉條・枸杞亮眼小餅',
    };
  }
  if (/旅|宿|安親|保母|莊園|樂園/i.test(s)) {
    return {
      category: '寵物旅館',
      collabModel: '連假住宿退房安心伴手禮＋櫃檯寄賣',
      recommendedSku: '珠貝原粒凍乾・猴頭菇嫩雞條',
    };
  }
  if (/貓|喵|擼|柴|犬咖|狗咖|中途/i.test(s)) {
    return {
      category: '寵物咖啡廳',
      collabModel: '現場餵食互動小包（$49）＋櫃檯隨手包寄賣',
      recommendedSku: '海味珠貝凍乾・東港櫻花蝦肉泥條',
    };
  }
  return {
    category: '友善餐廳',
    collabModel: '毛孩專屬加價購點心盤＋櫃檯寄賣',
    recommendedSku: '栗子南瓜小圓餅・猴頭菇雞肉脆片',
  };
}

function detectRegionFromText(text) {
  if (/屏東|潮州|恆春|東港|墾丁/.test(text)) return '屏東';
  if (/台南|中西區|永康|安平/.test(text)) return '台南';
  if (/台中|南屯|西屯|精誠/.test(text)) return '台中';
  if (/台北|新北|大安|士林|中正|信義/.test(text)) return '台北';
  return '高雄';
}

function parseGoogleMapsInput(raw) {
  const input = raw.trim();
  let name = '';
  let lat = null;
  let lng = null;

  // Extract exact pin coords (!3dLAT!4dLNG) first, else viewport (@LAT,LNG)
  const pinMatch = input.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  const atMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (pinMatch) {
    lat = Number(pinMatch[1]);
    lng = Number(pinMatch[2]);
  } else if (atMatch) {
    lat = Number(atMatch[1]);
    lng = Number(atMatch[2]);
  }

  // Extract place name from /maps/place/<NAME>/ or ?q=<QUERY> or /maps/search/<QUERY>
  const placeMatch = input.match(/\/maps\/place\/([^/?#]+)/);
  const searchMatch = input.match(/\/maps\/search\/([^/?#]+)/);
  const queryParamMatch = input.match(/[?&](?:q|query)=([^&#]+)/);

  if (placeMatch) {
    name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
  } else if (queryParamMatch) {
    name = decodeURIComponent(queryParamMatch[1].replace(/\+/g, ' '));
  } else if (searchMatch && searchMatch[1] !== '') {
    name = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
  } else if (!/^https?:\/\//i.test(input)) {
    name = input;
  }

  return { name: name.trim(), lat, lng, isShortUrl: /maps\.app\.goo\.gl|goo\.gl\/maps/i.test(input) };
}

export default function StoreFormModal({ isOpen, onClose, editingStore, onSave, onDelete }) {
  const [smartLink, setSmartLink] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseMsg, setParseMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    region: '高雄',
    district: '左營區',
    category: '寵物美容',
    address: '',
    status: '待聯絡',
    ratingTag: '',
    collabModel: '櫃檯隨手包寄賣（35% 店方分潤）',
    recommendedSku: '海味珠貝凍乾・東港櫻花蝦肉條',
    highlight: '',
    note: '',
    photoUrl: '',
    lat: '',
    lng: '',
  });

  useEffect(() => {
    setSmartLink('');
    setParseMsg('');
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
        photoUrl: editingStore.photoUrl || '',
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
        ratingTag: '潛力合作門市',
        collabModel: '櫃檯隨手包寄賣＋試吃小包',
        recommendedSku: '海味珠貝凍乾・猴頭菇養生脆片',
        highlight: '手動新增之潛力合作門市，可隨時開啟 Google Maps 實景導航與追蹤洽談進度。',
        note: '',
        photoUrl: '',
        lat: '',
        lng: '',
      });
    }
  }, [editingStore, isOpen]);

  if (!isOpen) return null;

  const handleAutoParse = async () => {
    if (!smartLink.trim()) return;
    setParsing(true);
    setParseMsg('');

    const parsed = parseGoogleMapsInput(smartLink);
    if (parsed.isShortUrl) {
      setParsing(false);
      setParseMsg(
        '💡 偵測到 Google 短網址（maps.app.goo.gl）：瀏覽器因安全限制無法直接解開短網址，請先點開短網址複製上方完整「google.com/maps/place/...」網址貼上，或直接把短網址傳到對話框由我自動幫您匯入（連同店面實拍照）！'
      );
      return;
    }

    let nextLat = parsed.lat;
    let nextLng = parsed.lng;
    let nextAddress = '';
    let nextDistrict = '';
    let nextRegion = detectRegionFromText(parsed.name || smartLink);

    try {
      if (nextLat && nextLng) {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${nextLat}&lon=${nextLng}&accept-language=zh-TW`
        );
        if (resp.ok) {
          const data = await resp.json();
          const addr = data.address || {};
          const city = addr.city || addr.county || '';
          nextRegion = detectRegionFromText(city || data.display_name || '');
          nextDistrict = addr.suburb || addr.town || addr.city_district || addr.village || '';
          const road = addr.road || '';
          const house = addr.house_number ? `${addr.house_number}號` : '';
          nextAddress = `${city}${nextDistrict}${road}${house}` || data.display_name || '';
        }
      } else if (parsed.name) {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            parsed.name
          )}&countrycodes=tw&limit=1&addressdetails=1&accept-language=zh-TW`
        );
        if (resp.ok) {
          const arr = await resp.json();
          if (arr && arr[0]) {
            nextLat = Number(arr[0].lat);
            nextLng = Number(arr[0].lon);
            const addr = arr[0].address || {};
            const city = addr.city || addr.county || '';
            nextRegion = detectRegionFromText(city || arr[0].display_name || '');
            nextDistrict = addr.suburb || addr.town || addr.city_district || '';
            const road = addr.road || '';
            const house = addr.house_number ? `${addr.house_number}號` : '';
            nextAddress = `${city}${nextDistrict}${road}${house}` || arr[0].display_name || '';
          }
        }
      }
    } catch {
      // ignore network error and keep parsed URL values
    }

    const cleanName = parsed.name.split(/\s+/)[0] || form.name;
    const guessed = guessCategoryAndCollab(parsed.name || smartLink);

    setForm((prev) => ({
      ...prev,
      name: cleanName || prev.name,
      region: nextRegion || prev.region,
      district: nextDistrict || prev.district,
      category: guessed.category,
      collabModel: guessed.collabModel,
      recommendedSku: guessed.recommendedSku,
      address: nextAddress || prev.address,
      lat: nextLat ?? prev.lat,
      lng: nextLng ?? prev.lng,
      highlight: `${nextRegion}${nextDistrict}潛力${guessed.category}通路，適合切入「${guessed.collabModel}」。`,
    }));

    setParsing(false);
    setParseMsg('✓ 已從連結自動帶入店家名稱、座標、行政區與推薦方案！確認無誤按右下角「儲存店家」即可。');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const fallback = REGION_DEFAULT_COORDS[form.region] || REGION_DEFAULT_COORDS['高雄'];
    const jitter = () => (Math.random() - 0.5) * 0.014;
    const parsedLat =
      form.lat !== '' && !Number.isNaN(Number(form.lat))
        ? Number(form.lat)
        : fallback.lat + jitter();
    const parsedLng =
      form.lng !== '' && !Number.isNaN(Number(form.lng))
        ? Number(form.lng)
        : fallback.lng + jitter();

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
          <h3 className="mt-modal-title">
            {editingStore ? '編輯合作店家資訊' : '+ 新增潛力合作店家'}
          </h3>
        </div>

        <div className="mt-modal-body">
          {/* ONE-CLICK GOOGLE MAPS URL AUTO-IMPORTER */}
          {!editingStore && (
            <div
              style={{
                background: '#FAF6EE',
                border: '1px solid #E5DCC5',
                borderRadius: 16,
                padding: '13px 15px',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#141312',
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Sparkles size={14} color="#D97706" />
                懶人一鍵帶入：貼上 Google Maps 店家網址（免手填表單）
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#FCFBF9',
                    border: '1px solid #DCD7CE',
                    borderRadius: 999,
                    padding: '0 12px',
                    minWidth: 0,
                  }}
                >
                  <Link2 size={14} color="#78716C" />
                  <input
                    type="text"
                    placeholder="貼上 google.com/maps/place/... 網址或「店名 地址」"
                    value={smartLink}
                    onChange={(e) => setSmartLink(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: 'none',
                      background: 'transparent',
                      padding: '8px 0',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="mt-black-cta"
                  style={{ height: 36, padding: '0 14px', fontSize: 12.5, flexShrink: 0 }}
                  onClick={handleAutoParse}
                  disabled={parsing}
                >
                  {parsing ? <Loader2 size={14} /> : '自動帶入'}
                </button>
              </div>
              {parseMsg && (
                <div
                  style={{
                    fontSize: 12,
                    marginTop: 7,
                    color: parseMsg.startsWith('✓') ? '#166534' : '#92400E',
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  {parseMsg}
                </div>
              )}
            </div>
          )}

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

            <div className="mt-field full">
              <label>店面實拍照片網址（選填，貼上圖片連結即可直接作為卡片封面）</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.photoUrl}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
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
