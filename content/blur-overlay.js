// =====================================================
// RH Pharma - Privacy Blur Content Script
// =====================================================
// ฉีดเข้าหน้าเว็บปลายทาง (Facebook, TikTok, Flow.ai, Gemini)
// เพื่อ "เบลอ" ตอน Extension กำลังทำงาน — ป้องกันคนข้างๆ เห็นเนื้อหา
//
// ใช้ 2 เทคนิคผสม (ตามที่พี่เลือก):
//   1. CSS filter: blur(10px) บน <html>
//   2. Overlay <div> สีเทาทับหน้าจอ
// =====================================================

(function () {
  'use strict';

  // ป้องกันการโหลดซ้ำ
  if (window.__rhPharmaBlurLoaded) return;
  window.__rhPharmaBlurLoaded = true;

  // ===== ตรวจว่าเป็น AI site ที่ extension ใช้ทำงาน — ไม่ต้องเบลอ =====
  const HOSTNAME = window.location.hostname;
  const SKIP_BLUR_HOSTS = ['labs.google', 'flow.google', 'gemini.google.com'];
  const SHOULD_SKIP_BLUR = SKIP_BLUR_HOSTS.some(host => HOSTNAME.includes(host));

  if (SHOULD_SKIP_BLUR) {
    console.log('[RH Pharma Blur] ข้ามเบลอบน AI site:', HOSTNAME);
    // ยังต้องตอบ ping เพื่อบอกว่า script โหลดแล้ว
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.action === 'pingBlur') {
        sendResponse({ success: true, ready: true, skipped: true });
      }
      return false;
    });
    return; // หยุดที่นี่ — ไม่ inject style/overlay
  }

  console.log('[RH Pharma Blur] Content script loaded on:', window.location.hostname);

  const OVERLAY_ID = 'rh-pharma-blur-overlay';
  const STYLE_ID = 'rh-pharma-blur-style';

  // ===== CSS ของ overlay (ฉีดครั้งเดียว) =====
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* CSS filter ทั้งหน้า (เทคนิค 1) */
      html.rh-pharma-blurred body > *:not(#${OVERLAY_ID}) {
        filter: blur(12px) !important;
        pointer-events: none !important;
        user-select: none !important;
        transition: filter 0.3s ease !important;
      }

      /* Overlay (เทคนิค 2) */
      #${OVERLAY_ID} {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(15, 23, 42, 0.4) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: 'Sarabun', -apple-system, sans-serif !important;
        animation: rhPharmaFadeIn 0.25s ease-out !important;
      }

      @keyframes rhPharmaFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      #${OVERLAY_ID} .rh-blur-card {
        background: white !important;
        padding: 28px 36px !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4) !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 14px !important;
        max-width: 320px !important;
        text-align: center !important;
      }

      #${OVERLAY_ID} .rh-blur-logo {
        font-size: 32px !important;
        margin-bottom: 4px !important;
      }

      #${OVERLAY_ID} .rh-blur-spinner {
        width: 44px !important;
        height: 44px !important;
        border: 4px solid #E2E8F0 !important;
        border-top-color: #4A8FB5 !important;
        border-radius: 50% !important;
        animation: rhPharmaSpin 0.8s linear infinite !important;
      }

      @keyframes rhPharmaSpin {
        to { transform: rotate(360deg); }
      }

      #${OVERLAY_ID} .rh-blur-text {
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #1E293B !important;
        margin: 0 !important;
      }

      #${OVERLAY_ID} .rh-blur-hint {
        font-size: 13px !important;
        color: #64748B !important;
        margin: 0 !important;
      }

      #${OVERLAY_ID} .rh-blur-brand {
        margin-top: 8px !important;
        padding-top: 12px !important;
        border-top: 1px solid #E2E8F0 !important;
        font-size: 11px !important;
        color: #94A3B8 !important;
        font-weight: 600 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ===== สร้าง overlay =====
  function createOverlay(message = 'กำลังประมวลผล...') {
    if (document.getElementById(OVERLAY_ID)) return;

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
      <div class="rh-blur-card">
        <div class="rh-blur-logo">🏥💊</div>
        <div class="rh-blur-spinner"></div>
        <p class="rh-blur-text">${escapeHtml(message)}</p>
        <p class="rh-blur-hint">RH Pharma กำลังทำงาน • โปรดรอสักครู่</p>
        <div class="rh-blur-brand">โรงพยาบาลรือเสาะ · กลุ่มงานเภสัชกรรม</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ===== เริ่มเบลอ =====
  function startBlur(message) {
    injectStyle();
    document.documentElement.classList.add('rh-pharma-blurred');
    createOverlay(message || 'กำลังประมวลผล...');
    console.log('[RH Pharma Blur] เริ่มเบลอหน้าเว็บ');
  }

  // ===== ยกเลิกเบลอ =====
  function stopBlur() {
    document.documentElement.classList.remove('rh-pharma-blurred');
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.25s';
      setTimeout(() => overlay.remove(), 300);
    }
    console.log('[RH Pharma Blur] ยกเลิกเบลอแล้ว');
  }

  // ===== อัปเดตข้อความ (ตอนทำงานหลายขั้น) =====
  function updateMessage(message) {
    const textEl = document.querySelector(`#${OVERLAY_ID} .rh-blur-text`);
    if (textEl) textEl.textContent = message;
  }

  // ===== รับคำสั่งจาก Side Panel หรือ Service Worker =====
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log('[RH Pharma Blur] รับคำสั่ง:', msg.action);

    switch (msg.action) {
      case 'startBlur':
        startBlur(msg.message);
        sendResponse({ success: true });
        break;

      case 'stopBlur':
        stopBlur();
        sendResponse({ success: true });
        break;

      case 'updateBlurMessage':
        updateMessage(msg.message);
        sendResponse({ success: true });
        break;

      case 'pingBlur':
        sendResponse({ success: true, ready: true, url: window.location.href });
        break;

      default:
        // ปล่อยให้ listener อื่นจัดการ
        return false;
    }
    return true;
  });

  console.log('[RH Pharma Blur] พร้อมรับคำสั่งแล้ว');
})();
