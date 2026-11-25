import React, { useState } from 'react';
import { X, Camera, KeyRound, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function StreetViewKeyModal({
  isOpen,
  onClose,
  googleApiKey,
  onSaveKey,
}) {
  const [draftKey, setDraftKey] = useState(googleApiKey || '');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKey(draftKey.trim());
    onClose();
  };

  return (
    <div className="mt-modal-backdrop" onClick={onClose}>
      <form className="mt-modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
        <div className="mt-modal-header">
          <button type="button" className="mt-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
          <h3 className="mt-modal-title">📸 自動抓取真實門牌街景照片設定</h3>
        </div>

        <div className="mt-modal-body">
          <div
            style={{
              background: '#FAF6EE',
              border: '1px solid #E6DEC8',
              borderRadius: 16,
              padding: '14px 16px',
              marginBottom: 18,
              fontSize: 13.5,
              lineHeight: 1.6,
              color: '#44403C',
            }}
          >
            <strong style={{ color: '#141312', display: 'block', marginBottom: 4 }}>
              為什麼預設卡片是「真實街廓定位圖」而不是店面照片？
            </strong>
            Google 官方規定：網頁若要<strong>自動批次下載 50 個門牌的真實鐵捲門／招牌街景圖片檔（Street View Static API）</strong>，必須附上 Google Maps API 金鑰，否則 Google 伺服器會直接阻擋圖片。
            <br />
            <span style={{ color: '#166534', fontWeight: 700 }}>
              ✓ 免金鑰替代方案：您現在直接點任一卡片右下角的「街景 ↗」，就能免費打開該地址真實 360° 店門口街景！
            </span>
          </div>

          <div className="mt-field full" style={{ marginBottom: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <KeyRound size={14} />
              貼上 Google Maps API Key（啟用 Street View Static API 後全站卡片自動變真實店門照）
            </label>
            <input
              type="text"
              placeholder="AIzaSy..."
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          {draftKey.trim().startsWith('AIza') && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#57534E', marginBottom: 6 }}>
                即時預覽測試（高雄市三民區明哲路33號）：
              </div>
              <div
                style={{
                  height: 150,
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '1px solid #DCD7CE',
                  background: '#EFECE6',
                }}
              >
                <img
                  src={`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${encodeURIComponent(
                    '高雄市三民區明哲路33號'
                  )}&fov=80&pitch=5&key=${encodeURIComponent(draftKey.trim())}`}
                  alt="Street View 測試預覽"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}

          <div style={{ fontSize: 12.5, color: '#78716C', lineHeight: 1.6 }}>
            💡 Google Cloud 每月提供免費額度（約可免費載入上萬次街景圖），只需於{' '}
            <a
              href="https://console.cloud.google.com/apis/library/street-view-image-backend.googleapis.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#141312', fontWeight: 700 }}
            >
              Google Cloud 啟用 Street View Static API <ExternalLink size={11} />
            </a>{' '}
            即可使用；您也可以在「編輯店家」單獨貼上某家店的 IG／官網門面照片網址。
          </div>
        </div>

        <div className="mt-modal-footer">
          {googleApiKey ? (
            <button
              type="button"
              className="mt-text-btn"
              onClick={() => {
                setDraftKey('');
                onSaveKey('');
                onClose();
              }}
            >
              清除已儲存金鑰
            </button>
          ) : (
            <span style={{ fontSize: 12, color: '#78716C' }}>金鑰僅儲存於您的瀏覽器本機</span>
          )}

          <button type="submit" className="mt-black-cta">
            <CheckCircle2 size={15} />
            套用設定
          </button>
        </div>
      </form>
    </div>
  );
}
