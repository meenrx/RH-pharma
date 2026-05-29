// =====================================================
// RH Pharma — Facebook Auto-Post Content Script (v0.10.0)
// =====================================================
// Inject ในหน้า business.facebook.com (Page composer)
// ทำหน้าที่:
//   1. รอ side panel ส่ง message มา (postToFacebook)
//   2. fill caption + upload image/video
//   3. รอ user approve (default ON) แล้วกด post
// บริบทสื่อสุขภาพ: รพ. โพสต์ของตัวเองลงเพจตัวเอง — ไม่ใช่ spam
// =====================================================

(function() {
  'use strict';
  console.log('[RH Pharma FB] content script loaded');

  // ===== Helpers (inline เพื่อไม่ต้อง depend HumanizeDelay) =====
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function waitFor(selector, timeout = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await sleep(250);
    }
    throw new Error(`รอ "${selector}" timeout`);
  }

  async function waitForAny(selectors, timeout = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      for (const s of selectors) {
        const el = document.querySelector(s);
        if (el) return { el, selector: s };
      }
      await sleep(250);
    }
    throw new Error('รอ element ใด ๆ ไม่พบ');
  }

  async function typeIntoComposer(el, text) {
    el.focus();
    await sleep(rand(200, 400));
    // FB composer ใช้ contenteditable lexical editor
    // วิธีที่ใช้ได้คือ dispatch InputEvent + execCommand
    el.click();
    await sleep(150);
    try {
      document.execCommand('insertText', false, text);
    } catch (e) {
      // fallback
      el.textContent = text;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
    }
    await sleep(rand(400, 800));
  }

  async function uploadFile(blob, filename) {
    // หา input file ของ composer
    const fileInputCandidates = [
      'input[type="file"][accept*="image"]',
      'input[type="file"][accept*="video"]',
      'input[type="file"]'
    ];
    let input = null;
    for (const sel of fileInputCandidates) {
      input = document.querySelector(sel);
      if (input) break;
    }
    if (!input) {
      // ลองคลิกปุ่ม "Photo/Video" ก่อน
      const photoBtns = Array.from(document.querySelectorAll('[role="button"], [aria-label]'))
        .filter(b => /photo|video|รูป|วิดีโอ|gambar/i.test(b.getAttribute('aria-label') || b.textContent || ''));
      if (photoBtns[0]) {
        photoBtns[0].click();
        await sleep(800);
        for (const sel of fileInputCandidates) {
          input = document.querySelector(sel);
          if (input) break;
        }
      }
    }
    if (!input) throw new Error('ไม่พบ input ของ Facebook composer');

    const file = new File([blob], filename, { type: blob.type });
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(rand(2000, 3500));
  }

  function showApprovalDialog(caption) {
    return new Promise((resolve) => {
      // สร้าง overlay สำหรับให้ user confirm
      const wrap = document.createElement('div');
      wrap.id = 'rh-pharma-approve-modal';
      wrap.style.cssText = `
        position:fixed;top:0;left:0;right:0;bottom:0;
        background:rgba(15,27,45,.65);z-index:2147483647;
        display:flex;align-items:center;justify-content:center;
        font-family:'Sarabun','Segoe UI',sans-serif;
      `;
      wrap.innerHTML = `
        <div style="background:#fff;border-radius:14px;padding:24px;max-width:540px;width:92vw;box-shadow:0 8px 32px rgba(0,0,0,.3);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <span style="font-size:24px;">⚕️</span>
            <h3 style="margin:0;font-size:18px;color:#2E6E92;">RH Pharma — ยืนยันก่อนโพสต์</h3>
          </div>
          <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.5;">
            ตรวจสอบเนื้อหา + รูป/วิดีโอ ก่อนกดยืนยัน — เภสัชกรเป็นผู้รับผิดชอบเนื้อหา
          </p>
          <pre id="rh-cap-preview" style="background:#F1F5F9;padding:12px;border-radius:8px;max-height:240px;overflow:auto;font-size:13px;white-space:pre-wrap;color:#1E293B;font-family:inherit;"></pre>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">
            <button id="rh-cancel" style="padding:10px 18px;border-radius:8px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;font-size:14px;color:#475569;">ยกเลิก</button>
            <button id="rh-confirm" style="padding:10px 18px;border-radius:8px;border:none;background:#4A8FB5;color:#fff;cursor:pointer;font-size:14px;font-weight:600;">✓ ยืนยันโพสต์</button>
          </div>
        </div>
      `;
      document.body.appendChild(wrap);
      wrap.querySelector('#rh-cap-preview').textContent = caption;
      wrap.querySelector('#rh-confirm').onclick = () => { wrap.remove(); resolve(true); };
      wrap.querySelector('#rh-cancel').onclick = () => { wrap.remove(); resolve(false); };
    });
  }

  async function clickPostButton() {
    // FB ปุ่ม post มีหลายภาษา
    const labels = ['Post', 'โพสต์', 'Hantar', 'Publish', 'แชร์', 'Share now'];
    const start = Date.now();
    while (Date.now() - start < 15000) {
      const candidates = Array.from(document.querySelectorAll('[role="button"]'));
      const btn = candidates.find(b => {
        const txt = (b.textContent || '').trim();
        const aria = (b.getAttribute('aria-label') || '').trim();
        return labels.some(l => txt === l || aria === l);
      });
      if (btn && !btn.getAttribute('aria-disabled')) {
        btn.click();
        return true;
      }
      await sleep(400);
    }
    throw new Error('ไม่พบปุ่ม Post');
  }

  // ===== Listener =====
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action !== 'postToFacebook') return;
    (async () => {
      try {
        const { blob, mimeType, filename, caption, requireApproval } = message;

        // 1. รอ composer พร้อม
        const composer = await waitForAny([
          'div[contenteditable="true"][role="textbox"]',
          'div[contenteditable="true"][data-lexical-editor]',
          'div[role="textbox"][contenteditable="true"]'
        ], 20000);
        await sleep(rand(800, 1500));

        // 2. fill caption
        await typeIntoComposer(composer.el, caption || '');

        // 3. upload media (ถ้ามี)
        if (blob) {
          const fileBlob = new Blob([blob], { type: mimeType });
          await uploadFile(fileBlob, filename || 'rh-pharma.png');
        }

        // 4. ขอ approval (default: ON)
        if (requireApproval !== false) {
          const ok = await showApprovalDialog(caption || '');
          if (!ok) {
            sendResponse({ success: false, canceled: true });
            return;
          }
        }

        // 5. กด Post
        await sleep(rand(800, 1400));
        await clickPostButton();

        // 6. รอผล
        await sleep(rand(2500, 4500));
        sendResponse({ success: true });
      } catch (err) {
        console.error('[RH Pharma FB] error', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // async response
  });
})();
