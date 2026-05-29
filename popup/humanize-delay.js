// =====================================================
// RH Pharma — Humanize Delay (v0.10.0)
// =====================================================
// "Anti-detect แบบย่อม" — สำหรับ content script ตอน auto-post
// บริบทสื่อสุขภาพ: เราโพสต์ของ "รพ. เอง" ลงเพจของ รพ. เอง
//   - ไม่ใช่การ spam / abuse
//   - แค่ทำให้ Facebook/TikTok ไม่ตีว่าเป็น bot
//   - ไม่ต้อง fingerprint spoof, ไม่ต้องเปลี่ยน user agent
//   - เน้นแค่ "พิมพ์เหมือนคน + รอเหมือนคน"
// =====================================================

const HumanizeDelay = (() => {

  // ===== Random delay ระหว่าง min/max =====
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ===== Sleep ด้วย delay (ms) =====
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ===== รอแบบคน — short pause =====
  async function shortPause() {
    const settings = await getSettings();
    await sleep(rand(settings.delayMin || 600, settings.delayMax || 1200));
  }

  // ===== รอแบบคน — long pause (ก่อน submit/post) =====
  async function longPause() {
    const settings = await getSettings();
    const base = (settings.delayMax || 1500);
    await sleep(rand(base, base + 1500));
  }

  // ===== พิมพ์ข้อความแบบเหมือนคน =====
  // ใช้ใน content script ตอน fill caption
  async function typeHumanLike(element, text, opts = {}) {
    const settings = await getSettings();
    const minDelay = opts.minDelay || 30;
    const maxDelay = opts.maxDelay || 100;
    const mistakeRate = opts.mistakeRate ?? 0; // 0-1

    element.focus();
    await sleep(100);

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      // ส่ง keyboard event เสมือนพิมพ์
      element.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));

      // ใส่ตัวอักษร (ขึ้นกับ element type)
      if (element.isContentEditable) {
        document.execCommand('insertText', false, ch);
      } else if (typeof element.value === 'string') {
        element.value += ch;
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }

      element.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));

      // delay แบบสุ่ม
      await sleep(rand(minDelay, maxDelay));

      // mistakeRate: บางครั้งพิมพ์ผิดแล้วลบ (เหมือนคน)
      if (mistakeRate > 0 && Math.random() < mistakeRate) {
        const typo = String.fromCharCode(rand(97, 122));
        if (element.isContentEditable) {
          document.execCommand('insertText', false, typo);
          await sleep(rand(50, 200));
          document.execCommand('delete', false);
        } else {
          element.value += typo;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          await sleep(rand(50, 200));
          element.value = element.value.slice(0, -1);
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }
        await sleep(rand(100, 300));
      }
    }
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ===== คลิกแบบเหมือนคน (มี mouseover ก่อน) =====
  async function clickHumanLike(element) {
    if (!element) throw new Error('element not found');
    // เลื่อนเข้าวิว
    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(rand(300, 600));
    } catch {}

    // mousemove → hover → click
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y }));
    await sleep(rand(80, 200));
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }));
    await sleep(rand(40, 120));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y }));
    element.click();
    await sleep(rand(150, 350));
  }

  // ===== รอจน element โผล่ =====
  async function waitForElement(selector, opts = {}) {
    const timeout = opts.timeout || 15000;
    const interval = opts.interval || 250;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el && (opts.visible ? isVisible(el) : true)) return el;
      await sleep(interval);
    }
    throw new Error(`รอ element "${selector}" นานเกิน ${timeout}ms`);
  }

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 &&
           getComputedStyle(el).visibility !== 'hidden' &&
           getComputedStyle(el).display !== 'none';
  }

  // ===== โหลด settings =====
  async function getSettings() {
    try {
      const data = await chrome.storage.local.get(['rhPharmaSettings']);
      return data.rhPharmaSettings || {};
    } catch {
      return { delayMin: 600, delayMax: 1500 };
    }
  }

  return {
    rand,
    sleep,
    shortPause,
    longPause,
    typeHumanLike,
    clickHumanLike,
    waitForElement,
    isVisible
  };
})();

// Export ทั้ง window (สำหรับ sidepanel) และ globalThis (สำหรับ content script ที่ inject)
if (typeof window !== 'undefined') window.HumanizeDelay = HumanizeDelay;
if (typeof globalThis !== 'undefined') globalThis.HumanizeDelay = HumanizeDelay;
console.log('[HumanizeDelay] loaded');
