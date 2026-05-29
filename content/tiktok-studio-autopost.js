// =====================================================
// RH Pharma — TikTok Studio Auto-Post Content Script (v0.10.0)
// =====================================================
// Inject ในหน้า tiktok.com/tiktokstudio/upload
// ทำหน้าที่:
//   1. รับ message จาก side panel (postToTikTok)
//   2. upload วิดีโอ + fill caption + hashtag
//   3. รอ user approve ก่อนกด post
// บริบทสื่อสุขภาพ: เพจ TikTok ของ รพ. โพสต์ความรู้สุขภาพ
// =====================================================

(function() {
  'use strict';
  console.log('[RH Pharma TT] content script loaded');

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  async function waitFor(selector, timeout = 20000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await sleep(300);
    }
    throw new Error(`รอ "${selector}" timeout`);
  }

  async function uploadVideo(blob, filename = 'rh-pharma.mp4') {
    // หา input file ของ TikTok Studio upload
    const input = await waitFor('input[type="file"][accept*="video"], input[type="file"]', 15000);
    const file = new File([blob], filename, { type: blob.type || 'video/mp4' });
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    // รอ TikTok process
    await sleep(rand(8000, 12000));
  }

  async function fillCaption(text) {
    // TikTok Studio caption ใช้ contenteditable
    const candidates = [
      'div[contenteditable="true"][role="combobox"]',
      'div[contenteditable="true"][data-placeholder]',
      'div[contenteditable="true"]'
    ];
    let editor = null;
    const start = Date.now();
    while (Date.now() - start < 15000) {
      for (const sel of candidates) {
        editor = document.querySelector(sel);
        if (editor) break;
      }
      if (editor) break;
      await sleep(400);
    }
    if (!editor) throw new Error('ไม่พบ caption editor ใน TikTok Studio');

    editor.focus();
    await sleep(rand(300, 600));
    try {
      document.execCommand('insertText', false, text);
    } catch {
      editor.textContent = text;
    }
    editor.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
    await sleep(rand(500, 1000));
  }

  async function showApprovalDialog(caption) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:2147483647;
        display:flex;align-items:center;justify-content:center;
        font-family:'Sarabun','Segoe UI',sans-serif;
      `;
      wrap.innerHTML = `
        <div style="background:#fff;border-radius:14px;padding:24px;max-width:540px;width:92vw;box-shadow:0 8px 32px rgba(0,0,0,.4);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <span style="font-size:24px;">🎬</span>
            <h3 style="margin:0;font-size:18px;color:#2E6E92;">RH Pharma — ยืนยันโพสต์ TikTok</h3>
          </div>
          <p style="margin:0 0 12px;color:#475569;font-size:14px;">ตรวจสอบ caption + พรีวิววิดีโอใน TikTok ก่อนกดยืนยัน</p>
          <pre style="background:#F1F5F9;padding:12px;border-radius:8px;max-height:240px;overflow:auto;font-size:13px;white-space:pre-wrap;color:#1E293B;font-family:inherit;">${caption.replace(/</g, '&lt;')}</pre>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">
            <button id="rh-tt-cancel" style="padding:10px 18px;border-radius:8px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;font-size:14px;">ยกเลิก</button>
            <button id="rh-tt-confirm" style="padding:10px 18px;border-radius:8px;border:none;background:#4A8FB5;color:#fff;cursor:pointer;font-size:14px;font-weight:600;">✓ ยืนยันโพสต์</button>
          </div>
        </div>
      `;
      document.body.appendChild(wrap);
      wrap.querySelector('#rh-tt-confirm').onclick = () => { wrap.remove(); resolve(true); };
      wrap.querySelector('#rh-tt-cancel').onclick = () => { wrap.remove(); resolve(false); };
    });
  }

  async function clickPostButton() {
    const labels = ['Post', 'โพสต์', 'Hantar', 'Upload'];
    const start = Date.now();
    while (Date.now() - start < 15000) {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => {
        const txt = (b.textContent || '').trim();
        return labels.includes(txt) && !b.disabled;
      });
      if (btn) {
        btn.click();
        return true;
      }
      await sleep(400);
    }
    throw new Error('ไม่พบปุ่ม Post ใน TikTok Studio');
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action !== 'postToTikTok') return;
    (async () => {
      try {
        const { blob, mimeType, filename, caption, requireApproval } = message;
        if (!blob) throw new Error('TikTok ต้องมีวิดีโอ — ไม่มี blob');

        const fileBlob = new Blob([blob], { type: mimeType || 'video/mp4' });
        await uploadVideo(fileBlob, filename || 'rh-pharma.mp4');

        await sleep(rand(1500, 3000));
        await fillCaption(caption || '');

        if (requireApproval !== false) {
          const ok = await showApprovalDialog(caption || '');
          if (!ok) {
            sendResponse({ success: false, canceled: true });
            return;
          }
        }

        await sleep(rand(1000, 2000));
        await clickPostButton();
        await sleep(rand(3000, 5000));
        sendResponse({ success: true });
      } catch (err) {
        console.error('[RH Pharma TT] error', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  });
})();
