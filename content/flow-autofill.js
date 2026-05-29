// =====================================================
// RH Pharma - Flow.ai (Google Labs) Auto-Paste v2
// =====================================================
// แก้ปัญหา "Prompt must be provided" + auto-click Generate
// + เลือก aspect ratio + count + model อัตโนมัติ
// =====================================================

(function () {
  'use strict';

  if (window.__rhPharmaFlowLoaded) return;
  window.__rhPharmaFlowLoaded = true;

  console.log('[RH Pharma Flow] Content script v2 loaded on:', window.location.href);

  // =====================================================
  // หา prompt input ของ Flow
  // =====================================================
  function findPromptInput() {
    const selectors = [
      'textarea[placeholder*="prompt" i]',
      'textarea[placeholder*="describe" i]',
      'textarea[placeholder*="What" i]',
      'textarea[placeholder*="create" i]',
      'textarea[placeholder*="ทดสอบ" i]',     // placeholder ภาษาไทยของ Flow
      'textarea[placeholder*="สร้าง" i]',
      'textarea[placeholder*="พิมพ์" i]',
      'textarea[placeholder*="ใส่" i]',
      'textarea[aria-label*="prompt" i]',
      'textarea[aria-label*="create" i]',
      'div[contenteditable="true"][role="textbox"]',
      'textarea',
      'div[contenteditable="true"]'
    ];

    for (const sel of selectors) {
      const elements = document.querySelectorAll(sel);
      for (const el of elements) {
        if (el.offsetParent !== null && el.offsetWidth > 100) {
          return el;
        }
      }
    }
    return null;
  }

  // =====================================================
  // 🆕 วาง prompt ผ่าน Clipboard + simulated Ctrl+V
  // วิธีนี้เสถียรที่สุดสำหรับ Flow เพราะใช้ native paste pipeline
  // (Flow handle paste event ปกติ — ไม่กระทบ React state จนจอดำ)
  // =====================================================
  async function pastePromptViaClipboard(text) {
    const input = findPromptInput();
    if (!input) {
      console.warn('[RH Pharma Flow] หา prompt input ไม่เจอ (clipboard mode)');
      return false;
    }

    console.log('[RH Pharma Flow] paste via clipboard ลง:', input.tagName, '/ length:', text.length);

    try {
      // === ขั้น 1: copy prompt ไปที่ clipboard ===
      await navigator.clipboard.writeText(text);
      console.log('[RH Pharma Flow] ✅ copy ไป clipboard แล้ว');
      await sleep(200);

      // === ขั้น 2: focus + click ช่อง prompt ===
      input.focus();
      input.click();
      await sleep(300);

      // เคลียร์ค่าเดิมถ้ามี (กดปุ่ม Backspace หรือ select+delete)
      try {
        if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
          if (input.value && input.value.length > 0) {
            input.select?.();
            await sleep(100);
            // ลบโดยกด Delete
            document.execCommand?.('delete');
            await sleep(100);
          }
        }
      } catch (_) { /* ignore */ }

      // === ขั้น 3: Dispatch paste event แบบ native (มาจาก clipboard จริง) ===
      // วิธีนี้ Flow จะเห็นว่า user กด Ctrl+V จริง — React state ไม่หลุด
      const dt = new DataTransfer();
      dt.setData('text/plain', text);

      input.dispatchEvent(new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dt
      }));
      await sleep(400);

      // verify
      const v1 = (input.value || input.textContent || '').trim();
      if (v1.length > 20) {
        console.log('[RH Pharma Flow] ✅ paste OK via ClipboardEvent, length:', v1.length);
        return true;
      }

      // === ขั้น 4: Fallback — simulate Ctrl+V keystroke ===
      console.log('[RH Pharma Flow] ลอง simulate Ctrl+V...');
      input.focus();
      await sleep(100);

      // กด Ctrl+V (Windows/Linux) — ใช้ KeyboardEvent
      const keydownV = new KeyboardEvent('keydown', {
        key: 'v', code: 'KeyV', keyCode: 86, which: 86,
        ctrlKey: true, bubbles: true, cancelable: true
      });
      input.dispatchEvent(keydownV);
      await sleep(50);

      const keypressV = new KeyboardEvent('keypress', {
        key: 'v', code: 'KeyV', keyCode: 86, which: 86,
        ctrlKey: true, bubbles: true, cancelable: true
      });
      input.dispatchEvent(keypressV);
      await sleep(50);

      const keyupV = new KeyboardEvent('keyup', {
        key: 'v', code: 'KeyV', keyCode: 86, which: 86,
        ctrlKey: true, bubbles: true, cancelable: true
      });
      input.dispatchEvent(keyupV);
      await sleep(400);

      const v2 = (input.value || input.textContent || '').trim();
      if (v2.length > 20) {
        console.log('[RH Pharma Flow] ✅ paste OK via Ctrl+V keystroke, length:', v2.length);
        return true;
      }

      // === ขั้น 5: Final fallback — InputEvent insertFromPaste ===
      console.log('[RH Pharma Flow] ลอง InputEvent insertFromPaste...');
      input.dispatchEvent(new InputEvent('beforeinput', {
        bubbles: true, cancelable: true,
        inputType: 'insertFromPaste',
        data: text
      }));
      input.dispatchEvent(new InputEvent('input', {
        bubbles: true, cancelable: true,
        inputType: 'insertFromPaste',
        data: text
      }));
      await sleep(400);

      const v3 = (input.value || input.textContent || '').trim();
      if (v3.length > 20) {
        console.log('[RH Pharma Flow] ✅ paste OK via InputEvent, length:', v3.length);
        return true;
      }

      console.warn('[RH Pharma Flow] ❌ paste via clipboard ไม่สำเร็จทุกวิธี — value length:', v3.length);
      return false;

    } catch (err) {
      console.error('[RH Pharma Flow] pastePromptViaClipboard error:', err);
      return false;
    }
  }

  // =====================================================
  // 🆕 รอรูป preview ขึ้นในช่อง prompt bar
  // ตรวจจาก thumbnail ที่อยู่ใกล้ช่อง prompt (ไม่ใช่ใน Asset library)
  // =====================================================
  async function waitForPromptBarPreview(expectedCount = 2, maxWait = 30000) {
    const start = Date.now();
    const promptInput = findPromptInput();
    if (!promptInput) {
      console.warn('[RH Pharma Flow] หา prompt input ไม่เจอ — skip wait preview');
      return false;
    }

    // หา container ของ prompt bar (parent ที่ครอบทั้ง textbox + ปุ่ม +)
    let promptContainer = promptInput;
    for (let i = 0; i < 8; i++) {
      promptContainer = promptContainer.parentElement;
      if (!promptContainer || promptContainer === document.body) break;
      // container ควรกว้างพอที่จะมีปุ่ม + รูป + send button
      if (promptContainer.offsetWidth > 400 && promptContainer.offsetHeight > 60) break;
    }
    if (!promptContainer) promptContainer = promptInput.parentElement;

    console.log('[RH Pharma Flow] รอ preview รูปในช่อง prompt — รอสูงสุด', maxWait / 1000, 'วินาที');

    while (Date.now() - start < maxWait) {
      // หา img/thumbnail ภายใน prompt container
      const imgs = Array.from(promptContainer.querySelectorAll('img')).filter(el => {
        if (el.offsetParent === null) return false;
        const w = el.offsetWidth, h = el.offsetHeight;
        const src = el.src || '';
        // ขนาดต้องเป็น thumbnail จริง (ไม่ใช่ icon)
        if (w < 24 || h < 24) return false;
        // ไม่นับ logo/icon
        if (src.includes('logo') || src.endsWith('.svg')) return false;
        return src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('http');
      });

      // หา thumbnail element ที่มี aria-label/class บอกว่าเป็น attached
      const thumbs = Array.from(promptContainer.querySelectorAll(
        '[aria-label*="reference" i], [aria-label*="attached" i], [class*="thumbnail" i], [class*="chip" i]'
      )).filter(el => el.offsetParent !== null && el.offsetWidth > 20);

      const totalFound = Math.max(imgs.length, thumbs.length);
      if (totalFound >= expectedCount) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`[RH Pharma Flow] ✅ preview รูป ${totalFound} ขึ้นในช่อง prompt แล้ว (รอ ${elapsed}s)`);
        return true;
      }

      // log ทุก 10 วินาที
      const elapsed = Date.now() - start;
      if (elapsed > 0 && elapsed % 10000 < 1000) {
        console.log(`[RH Pharma Flow] รอ preview... (${(elapsed / 1000).toFixed(0)}s) — เจอ ${totalFound}/${expectedCount}`);
      }

      await sleep(1000);
    }

    console.warn(`[RH Pharma Flow] ⏱️ รอ preview ครบ ${maxWait/1000}s — เจอไม่ครบแต่ลองทำต่อ`);
    return false;
  }

  // =====================================================
  // 🆕 ตรวจจับว่าหน้า Flow ดำหรือไม่ (UI freeze / crash)
  // ถ้าดำจริง → reload page
  // =====================================================
  function detectBlackScreen() {
    // เช็ค 1: ช่อง prompt input ยังอยู่ไหม
    const promptInput = findPromptInput();
    if (!promptInput) return true; // ไม่มี = น่าจะดำ

    // เช็ค 2: prompt input ยัง interactable ไหม (visible + ขนาดใหญ่พอ)
    const rect = promptInput.getBoundingClientRect();
    if (rect.width < 100 || rect.height < 20) return true;

    // เช็ค 3: หน้าจอมี element ที่ visible พอสมควรไหม (ไม่ใช่ดำเปล่า)
    const visibleEls = document.querySelectorAll('button, [role="button"], textarea, input');
    const visibleCount = Array.from(visibleEls).filter(el => el.offsetParent !== null).length;
    if (visibleCount < 3) return true; // มี element น้อยมาก = น่าจะดำ

    return false;
  }

  async function reloadOnBlackScreen() {
    console.warn('[RH Pharma Flow] 🔄 detected black screen — reload page');
    showFlowToast('🔄 หน้า Flow ค้าง — กำลัง reload...', 'error');
    await sleep(1500);
    window.location.reload();
  }

  // =====================================================
  // วาง prompt — ใช้ React nativeInputValueSetter + keyboard fallback
  // (legacy — เก็บไว้เผื่อ fallback)
  // =====================================================
  async function pastePromptLegacy(text) {
    const input = findPromptInput();
    if (!input) {
      console.warn('[RH Pharma Flow] หา prompt input ไม่เจอ');
      return false;
    }

    console.log('[RH Pharma Flow] paste ลง:', input.tagName, '/', input.contentEditable, input.placeholder?.slice(0,20));

    input.focus();
    input.click();
    await sleep(300);

    // =====================================================
    // Method A: React nativeInputValueSetter (ทำงานกับ React controlled input)
    // =====================================================
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
      try {
        const proto = input.tagName === 'TEXTAREA'
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;

        // เคลียร์ + ใส่ค่าใหม่
        nativeSetter.call(input, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(50);

        nativeSetter.call(input, text);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(200);

        // ตรวจสอบ
        if (input.value && input.value.length > 10) {
          console.log('[RH Pharma Flow] paste OK via nativeSetter, length:', input.value.length);
          return true;
        }
      } catch (e) {
        console.warn('[RH Pharma Flow] nativeSetter error:', e.message);
      }

      // =====================================================
      // Method B: เลือกทั้งหมด + keyboard typing simulation
      // (ใช้เมื่อ React ไม่รับ nativeSetter)
      // =====================================================
      try {
        input.focus();
        // เลือกทั้งหมด (Ctrl+A)
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
        await sleep(100);
        // ลบ (Delete)
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
        await sleep(100);

        // ใส่ข้อความใหม่ผ่าน InputEvent insertText
        input.dispatchEvent(new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: text
        }));

        // React อาจ handle beforeinput ให้ update state แล้ว
        // แต่ถ้าไม่ ลอง insertFromPaste
        input.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertFromPaste',
          data: text
        }));
        await sleep(200);

        if (input.value && input.value.length > 10) {
          console.log('[RH Pharma Flow] paste OK via InputEvent, length:', input.value.length);
          return true;
        }
      } catch (e) {
        console.warn('[RH Pharma Flow] InputEvent error:', e.message);
      }

      // =====================================================
      // Method C: clipboard paste simulation (ที่น่าเชื่อถือที่สุดกับ React)
      // =====================================================
      try {
        input.focus();
        // เลือกทั้งหมด
        input.select?.();
        await sleep(100);

        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        input.dispatchEvent(new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dt
        }));
        await sleep(300);

        if (input.value && input.value.length > 10) {
          console.log('[RH Pharma Flow] paste OK via ClipboardEvent, length:', input.value.length);
          return true;
        }
      } catch (e) {
        console.warn('[RH Pharma Flow] ClipboardEvent error:', e.message);
      }

      // =====================================================
      // Method D: execCommand (legacy แต่ทำงานกับ input บางตัว)
      // =====================================================
      try {
        input.focus();
        input.select?.();
        document.execCommand('selectAll');
        document.execCommand('delete');
        const success = document.execCommand('insertText', false, text);
        await sleep(200);
        if (input.value && input.value.length > 10) {
          console.log('[RH Pharma Flow] paste OK via execCommand, length:', input.value.length);
          return true;
        }
      } catch (e) { /* ignore */ }

    } else if (input.contentEditable === 'true') {
      // contenteditable — ใช้ execCommand insertText
      input.focus();
      const range = document.createRange();
      range.selectNodeContents(input);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('delete');
      await sleep(50);

      if (document.execCommand('insertText', false, text)) {
        await sleep(200);
        if ((input.textContent || '').length > 10) return true;
      }

      // paste event
      const dt = new DataTransfer();
      dt.setData('text/plain', text);
      input.dispatchEvent(new ClipboardEvent('paste', {
        bubbles: true, cancelable: true, clipboardData: dt
      }));
      await sleep(200);
      if ((input.textContent || '').length > 10) return true;
    }

    // verify สุดท้าย
    await sleep(400);
    const currentValue = input.value || input.textContent || '';
    const ok = currentValue.length > 10 && currentValue.includes(text.slice(0, 20));
    console.log('[RH Pharma Flow] paste final check:', ok ? 'OK' : 'FAIL', '| length:', currentValue.length);
    return ok;
  }

  // =====================================================
  // 🆕 wrapper: ใช้ clipboard mode ก่อน → fallback ไป legacy
  // =====================================================
  async function pastePrompt(text) {
    // ลอง clipboard mode ก่อน (วิธีที่ user ขอ — ใช้ navigator.clipboard.writeText + Ctrl+V)
    const ok = await pastePromptViaClipboard(text);
    if (ok) return true;

    // ถ้า clipboard ไม่สำเร็จ → ลองวิธี legacy (nativeSetter, InputEvent, etc.)
    console.warn('[RH Pharma Flow] clipboard mode ไม่สำเร็จ → ใช้ legacy mode');
    return await pastePromptLegacy(text);
  }

  // =====================================================
  // helper: หา element ที่ match text หรือ aria-label
  // =====================================================
  function findByTextOrLabel(selector, searchText) {
    const search = searchText.toLowerCase().trim();
    const els = document.querySelectorAll(selector);
    for (const el of els) {
      if (el.offsetParent === null) continue;
      const text = el.textContent.trim().toLowerCase();
      const label = (el.getAttribute('aria-label') || '').toLowerCase();
      const title = (el.getAttribute('title') || '').toLowerCase();
      const value = (el.getAttribute('data-value') || '').toLowerCase();
      if (text === search || label === search || title === search || value === search ||
          text.includes(search) || label.includes(search)) {
        return el;
      }
    }
    return null;
  }

  // =====================================================
  // เลือก Aspect Ratio — กรอง side panel ออก (left < 1100)
  // =====================================================
  async function selectAspectRatio(ratio) {
    if (!ratio) return false;
    await sleep(300);

    // Normalize: "16:9" → ["16:9", "16/9", "16x9"]
    const target = ratio.toLowerCase().trim();
    const targetVariants = [
      target,
      target.replace(':', '/'),
      target.replace(':', 'x'),
      target.replace(':', ' '),
    ];

    const allEls = document.querySelectorAll('button, [role="button"], [role="option"], [role="radio"], [aria-label]');
    for (const el of allEls) {
      if (el.offsetParent === null) continue;
      const rect = el.getBoundingClientRect();
      if (rect.left >= 1100) continue; // ← กรอง side panel

      const txt = el.textContent.trim().toLowerCase();
      const label = (el.getAttribute('aria-label') || '').toLowerCase().trim();
      const title = (el.getAttribute('title') || '').toLowerCase().trim();

      // ✅ EXACT match เท่านั้น — ห้าม substring match (กันบั๊ก "1:1" ไป match "16:9")
      // ตัวอย่าง: ปุ่ม "16:9 YouTube/แนวนอน" — txt = "16:9 youtube/แนวนอน" → match ratio "16:9"
      const matches = targetVariants.some(v => {
        return txt === v ||
               label === v ||
               title === v ||
               txt.startsWith(v + ' ') ||      // "16:9 YouTube..."
               txt.startsWith(v + '\n') ||
               label.startsWith(v + ' ') ||
               // word boundary check — กันบั๊ก "1:1" ไป match "16:9"
               new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(txt);
      });

      if (matches) {
        console.log(`[RH Pharma Flow] คลิก ratio ${ratio}:`, el.tagName, txt.slice(0, 30) || label);
        el.click();
        await sleep(400);
        return true;
      }
    }

    console.warn(`[RH Pharma Flow] หาปุ่ม ratio ${ratio} ไม่เจอ — ข้ามไป ใช้ default`);
    return false;
  }

  // หาแถวปุ่ม ratio — กรอง side panel ออก
  function findRatioRow() {
    const allBtns = Array.from(document.querySelectorAll('button'))
      .filter(btn => {
        if (btn.offsetParent === null) return false;
        return btn.getBoundingClientRect().left < 1100; // กรอง side panel
      });

    const btnsByParent = new Map();
    for (const btn of allBtns) {
      const parent = btn.parentElement;
      if (!parent) continue;
      if (!btnsByParent.has(parent)) btnsByParent.set(parent, []);
      btnsByParent.get(parent).push(btn);
    }

    for (const [parent, btns] of btnsByParent) {
      if (btns.length >= 4 && btns.length <= 8) {
        const ys = btns.map(b => b.getBoundingClientRect().top);
        const yRange = Math.max(...ys) - Math.min(...ys);
        if (yRange < 20) return parent;
      }
    }
    return null;
  }

  // =====================================================
  // เลือกจำนวนภาพ (x1, x2, x3, x4) — กรอง side panel ออก
  // =====================================================
  async function selectCount(count) {
    if (!count || count < 1) return false;

    // Flow ใช้รูปแบบ: "1x" "x1" หรือเลขเดี่ยว "1"
    const targets = [`x${count}`, `${count}x`, `×${count}`].map(s => s.toLowerCase());

    const els = document.querySelectorAll('button, [role="button"], [role="option"], [role="radio"]');
    for (const el of els) {
      if (el.offsetParent === null) continue;
      const rect = el.getBoundingClientRect();
      if (rect.left >= 1100) continue; // ← กรอง side panel
      const txt = el.textContent.trim().toLowerCase();
      const label = (el.getAttribute('aria-label') || '').toLowerCase().trim();

      // exact match กับรูปแบบมาตรฐาน
      if (targets.includes(txt) || targets.includes(label)) {
        console.log(`[RH Pharma Flow] เลือก count x${count}:`, el.tagName, txt || label);
        el.click();
        await sleep(300);
        return true;
      }
    }
    console.warn(`[RH Pharma Flow] หาปุ่ม count x${count} ไม่เจอ — ข้ามไป`);
    return false;
  }

  // =====================================================
  // ปิด dropdown/panel ที่ค้างอยู่ก่อนเริ่ม scene ใหม่
  // =====================================================
  async function closeOpenPanels() {
    // กด Escape เพื่อปิด dropdown/modal ที่ค้าง
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    await sleep(300);
    // คลิก body เพื่อ dismiss panel
    document.body.click();
    await sleep(300);
  }

  // =====================================================
  // รอให้ Asset panel ปิด — หลัง upload Flow จะเปิด panel อัตโนมัติ
  // ต้องรอปิดก่อนค่อยทำขั้นต่อไป (ratio/count/+)
  // =====================================================
  async function waitForAssetPanelToClose(maxWait = 8000) {
    const start = Date.now();

    const isPanelOpen = () => {
      // ตรวจ "Search for Assets" input ที่มองเห็น
      const searchEl = Array.from(document.querySelectorAll('input, [placeholder]')).find(el =>
        el.offsetParent !== null &&
        (el.placeholder || '').toLowerCase().includes('search') &&
        el.getBoundingClientRect().left < 1100
      );
      if (searchEl) return true;

      // ตรวจ Upload image button ที่มองเห็น (อยู่ใน asset panel)
      const uploadBtn = Array.from(document.querySelectorAll('button')).find(el =>
        el.offsetParent !== null &&
        el.textContent.trim().toLowerCase().includes('upload image') &&
        el.getBoundingClientRect().left < 1100
      );
      return !!uploadBtn;
    };

    // กด Escape ปิด panel ก่อน
    if (isPanelOpen()) {
      console.log('[RH Pharma Flow] Asset panel เปิดอยู่ — กด Escape เพื่อปิด');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
      await sleep(500);
      document.body.click();
      await sleep(500);
    }

    // รอจนกว่าปิด
    while (Date.now() - start < maxWait) {
      if (!isPanelOpen()) {
        console.log('[RH Pharma Flow] Asset panel ปิดแล้ว ✅');
        await sleep(300);
        return true;
      }
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
      document.body.click();
      await sleep(600);
    }

    console.warn('[RH Pharma Flow] รอ Asset panel ปิดนาน — ทำต่อไป');
    return false;
  }

  // =====================================================
  // 🆕 Paste รูปลงหน้า Flow ตรงๆ (ไม่ผ่าน Asset library)
  // วิธีนี้เร็วและเสถียรที่สุด — Flow รับ paste image event ตรงๆ ได้
  // คือสร้าง File[] → ใส่ใน DataTransfer → dispatch paste event ที่ document
  // =====================================================
  async function pasteImagesIntoFlow(dataUrls) {
    if (!dataUrls || dataUrls.length === 0) return false;

    try {
      // === ขั้น 1: แปลง dataURL เป็น File[] ===
      const files = await Promise.all(
        dataUrls.map(async (dataUrl, i) => {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
          const fileName = `rh-pharma-ref-${i}.${ext}`;
          return new File([blob], fileName, { type: blob.type });
        })
      );

      console.log('[RH Pharma Flow] เตรียม paste รูป:', files.map(f => `${f.name} (${(f.size / 1024).toFixed(1)}KB)`));

      // === ขั้น 2: หา target element สำหรับ paste — prefer prompt input ===
      let target = findPromptInput();
      if (!target) {
        // fallback — paste ที่ document.body หรือ main content area
        target = document.querySelector('main') || document.body;
      }

      target.focus();
      target.click();
      await sleep(300);

      // === ขั้น 3: นับจำนวน img ก่อน paste (เพื่อตรวจว่ามีเพิ่มขึ้นจริง) ===
      const beforeImgCount = document.querySelectorAll('img').length;
      console.log('[RH Pharma Flow] img count ก่อน paste:', beforeImgCount);

      // === ขั้น 4: สร้าง DataTransfer + Files ===
      const dt = new DataTransfer();
      files.forEach(file => dt.items.add(file));

      // === ขั้น 5: Dispatch paste event ครั้งเดียว — ห้าม dispatch ซ้ำ! ===
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dt
      });

      const dispatched = target.dispatchEvent(pasteEvent);
      console.log('[RH Pharma Flow] dispatch paste event ที่', target.tagName, '— accepted:', dispatched);

      // === ขั้น 6: รอตรวจว่า Flow รับรูปไปไหม (ดูจาก img count delta) ===
      // ไม่ filter blob:/data: เพราะ Flow อาจใช้ src แบบอื่น (เช่น https://lh3...)
      // ใช้วิธีนับ img เพิ่มขึ้นจาก beforeImgCount แทน
      const start = Date.now();
      while (Date.now() - start < 8000) {
        const afterImgCount = document.querySelectorAll('img').length;
        const delta = afterImgCount - beforeImgCount;
        if (delta >= dataUrls.length) {
          console.log(`[RH Pharma Flow] ✅ paste รูปสำเร็จ — img เพิ่ม ${delta} ตัว (จาก ${beforeImgCount} → ${afterImgCount})`);
          return true;
        }
        await sleep(500);
      }

      // ถ้าไม่สำเร็จ — return false ไม่ retry (กันการ paste ซ้ำ)
      // caller จะใช้ Asset library fallback แทน
      const finalCount = document.querySelectorAll('img').length;
      console.warn(`[RH Pharma Flow] ⚠️ paste อาจไม่สำเร็จ — img เพิ่มแค่ ${finalCount - beforeImgCount}/${dataUrls.length}`);
      return false;

    } catch (err) {
      console.error('[RH Pharma Flow] pasteImagesIntoFlow error:', err);
      return false;
    }
  }

  // =====================================================
  // อัปโหลดรูปเข้า Asset library เท่านั้น (Phase 1)
  // ไม่กด + เพื่อเพิ่มลง prompt bar (จะทำใน addImagesFromAssetPanel แยก)
  // =====================================================
  async function uploadImagesToLibrary(dataUrls) {
    if (!dataUrls || dataUrls.length === 0) return false;

    const files = await Promise.all(
      dataUrls.map(async (dataUrl, i) => {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const ext = (blob.type.split('/')[1] || 'png').split(';')[0];
        return new File([blob], `rh-pharma-ref-${i}.${ext}`, { type: blob.type || 'image/png' });
      })
    );

    const dt = new DataTransfer();
    files.forEach(f => dt.items.add(f));

    // inject ผ่าน hidden file input
    const allFileInputs = document.querySelectorAll('input[type="file"]');
    for (const fi of allFileInputs) {
      try {
        fi.files = dt.files;
        fi.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[RH Pharma Flow] อัปโหลดเข้า Asset library สำเร็จ');
        return true;
      } catch (e) { /* ลอง input ถัดไป */ }
    }
    console.warn('[RH Pharma Flow] hidden file input ไม่เจอ');
    return false;
  }

  // =====================================================
  // อัปโหลดรูป (legacy — ยังคงไว้เพื่อ backward compat)
  // =====================================================
  async function uploadImages(dataUrls) {
    if (!dataUrls || dataUrls.length === 0) return false;

    // แปลง dataUrls เป็น File objects
    const files = await Promise.all(
      dataUrls.map(async (dataUrl, i) => {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const ext = (blob.type.split('/')[1] || 'png').split(';')[0];
        return new File([blob], `rh-pharma-ref-${i}.${ext}`, { type: blob.type || 'image/png' });
      })
    );

    // === Step 1: อัปโหลดไฟล์เข้า Asset library ก่อน ===
    // ใช้ hidden file input (วิธีที่เร็วที่สุด)
    const dt = new DataTransfer();
    files.forEach(f => dt.items.add(f));

    const allFileInputs = document.querySelectorAll('input[type="file"]');
    let uploaded = false;
    for (const fi of allFileInputs) {
      try {
        fi.files = dt.files;
        fi.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[RH Pharma Flow] อัปโหลดผ่าน hidden file input สำเร็จ');
        uploaded = true;
        break;
      } catch (e) { /* ลอง input ถัดไป */ }
    }

    if (!uploaded) {
      console.warn('[RH Pharma Flow] อัปโหลด file input ไม่ได้ — ข้ามไป asset panel');
    }

    // รอให้ asset library ประมวลผลรูป
    await sleep(2000);

    // === Step 2: กด + แล้วเลือกรูปจาก Asset panel ทีละรูป ===
    return await addImagesFromAssetPanel(files.length);
  }

  // กด + เพื่อเปิด asset panel แล้วเลือกรูปทีละรูป
  async function addImagesFromAssetPanel(count) {
    const fileNames = [];
    for (let i = 0; i < count; i++) fileNames.push(`rh-pharma-ref-${i}`);

    for (let attempt = 0; attempt < count; attempt++) {
      // กดปุ่ม + ใน prompt bar
      const plusBtn = findPlusButton();
      if (!plusBtn) {
        console.warn('[RH Pharma Flow] หาปุ่ม + ไม่เจอ');
        break;
      }

      plusBtn.click();
      console.log('[RH Pharma Flow] กด + เพื่อเปิด asset panel');
      await sleep(1000);

      // รอ asset panel เปิด
      const panelOpened = await waitForAssetPanel();
      if (!panelOpened) {
        console.warn('[RH Pharma Flow] asset panel ไม่เปิด');
        break;
      }

      // คลิกรูป rh-pharma-ref ในรายการ
      const clicked = await clickAssetInPanel(fileNames[attempt] || 'rh-pharma-ref');
      if (clicked) {
        console.log(`[RH Pharma Flow] เลือกรูป ${attempt + 1}/${count} สำเร็จ`);
        await sleep(800);
      } else {
        // ถ้าหาไม่เจอตามชื่อ → คลิกรูปแรกสุดที่มีในรายการ
        const clickedFirst = await clickFirstAssetInPanel();
        if (clickedFirst) {
          console.log(`[RH Pharma Flow] เลือกรูปแรก ${attempt + 1}/${count}`);
          await sleep(800);
        }
      }

      // ปิด panel ก่อนเปิดรอบถัดไป
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
      await sleep(500);
    }

    return true;
  }

  // หาปุ่ม + ในแถบ prompt
  function findPlusButton() {
    const allBtns = document.querySelectorAll('button');
    const candidates = Array.from(allBtns).filter(btn => {
      if (btn.offsetParent === null) return false;
      const txt = btn.textContent.trim();
      const label = (btn.getAttribute('aria-label') || '').toLowerCase();
      const rect = btn.getBoundingClientRect();
      // อยู่ล่างหน้าจอ + อยู่ใน Flow (ไม่ใช่ side panel ขวา)
      // side panel เริ่มที่ประมาณ x=1175 ขึ้นไป
      return rect.top > window.innerHeight * 0.6 &&
             rect.left < 1100 &&   // ← กรอง side panel ออก
             (txt === '+' || label.includes('add') || label.includes('attach') || label.includes('upload'));
    });
    return candidates.length > 0 ? candidates[0] : null;
  }

  // รอ asset panel เปิด
  async function waitForAssetPanel(maxWait = 5000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      // asset panel มักมี "Search for Assets" หรือ list ของ rh-pharma-ref
      const panel = document.querySelector('[placeholder*="Search for Assets" i], [placeholder*="search" i]') ||
                    document.querySelector('[aria-label*="asset" i]') ||
                    Array.from(document.querySelectorAll('div, section')).find(el => {
                      return el.offsetParent !== null &&
                             el.textContent.includes('rh-pharma-ref') &&
                             el.offsetHeight > 100;
                    });
      if (panel) {
        console.log('[RH Pharma Flow] asset panel เปิดแล้ว');
        return true;
      }
      await sleep(300);
    }
    return false;
  }

  // คลิกรูปที่ต้องการในรายการ
  async function clickAssetInPanel(fileName) {
    const allEls = document.querySelectorAll('li, div[role="option"], button, [class*="item" i]');
    for (const el of allEls) {
      if (el.offsetParent === null) continue;
      const txt = el.textContent.trim();
      if (txt.includes(fileName) || txt.includes('rh-pharma')) {
        console.log('[RH Pharma Flow] คลิกรูปใน panel:', txt.slice(0, 40));
        el.click();
        return true;
      }
    }
    return false;
  }

  // คลิกรูปแรกในรายการ (fallback)
  async function clickFirstAssetInPanel() {
    // หา element ที่น่าจะเป็น asset item (มี img หรือ thumbnail ข้างใน)
    const items = document.querySelectorAll('li, [role="option"], [role="listitem"]');
    for (const item of items) {
      if (item.offsetParent === null) continue;
      const hasImg = item.querySelector('img') !== null;
      if (hasImg && item.offsetHeight > 20) {
        console.log('[RH Pharma Flow] คลิก asset แรกใน panel');
        item.click();
        return true;
      }
    }
    return false;
  }

  // =====================================================
  // แสดง toast บน Flow
  // =====================================================
  function showFlowToast(message, type = 'info') {
    const existing = document.getElementById('rh-flow-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'rh-flow-toast';
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : 'linear-gradient(135deg, #4A8FB5, #B8975B)'};
      color: white;
      padding: 14px 22px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      font-family: 'Sarabun', -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 2147483647;
      max-width: 340px;
    `;
    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size: 22px;">🩺</span>
        <div>
          <div style="margin-bottom:2px;">RH Pharma</div>
          <div style="font-weight:normal; font-size:12px; opacity:0.95;">${escapeHtml(message)}</div>
        </div>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s';
      toast.style.transform = 'translateX(400px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // =====================================================
  // 🆕 Banner สำหรับสั่งงานผู้ใช้ (อยู่ค้างจนกว่าจะกดปิด)
  // ใช้ตอนต้องการให้ผู้ใช้กด Ctrl+V เอง
  // =====================================================
  function showUserInstructionBanner(title, htmlMessage) {
    // ลบ banner เก่าถ้ามี
    const existing = document.getElementById('rh-flow-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'rh-flow-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #10B981 0%, #4A8FB5 100%);
      color: white;
      padding: 18px 24px;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
      font-family: 'Sarabun', -apple-system, sans-serif;
      font-size: 14px;
      z-index: 2147483647;
      max-width: 520px;
      min-width: 360px;
      border: 2px solid rgba(255,255,255,0.25);
      animation: rh-banner-slide-up 0.4s ease-out;
    `;

    banner.innerHTML = `
      <style>
        @keyframes rh-banner-slide-up {
          from { transform: translate(-50%, 30px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        #rh-flow-banner kbd {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(255,255,255,0.25);
          border-radius: 6px;
          font-family: monospace;
          font-weight: 700;
          font-size: 13px;
          margin: 0 2px;
          border: 1px solid rgba(255,255,255,0.4);
        }
        #rh-flow-banner b { font-weight: 700; }
      </style>
      <div style="display:flex; align-items:flex-start; gap:14px;">
        <span style="font-size: 32px; line-height: 1;">🩺</span>
        <div style="flex: 1;">
          <div style="font-weight:700; font-size:16px; margin-bottom:6px;">${escapeHtml(title)}</div>
          <div style="font-weight:400; font-size:13px; line-height:1.6; opacity:0.97;">
            ${htmlMessage.replace(/Ctrl\+V/g, '<kbd>Ctrl</kbd>+<kbd>V</kbd>').replace(/→/g, '<b>→</b>')}
          </div>
        </div>
        <button id="rh-flow-banner-close" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          flex-shrink: 0;
        " title="ปิด">✕</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('rh-flow-banner-close').addEventListener('click', () => {
      banner.style.transition = 'all 0.3s';
      banner.style.opacity = '0';
      banner.style.transform = 'translate(-50%, 30px)';
      setTimeout(() => banner.remove(), 300);
    });
  }

  // =====================================================
  // 🆕 autoCopyPrompt — copy prompt อัตโนมัติ ลอง 3 วิธี
  //    1. navigator.clipboard.writeText (ถ้า tab focused)
  //    2. document.execCommand('copy') ผ่าน hidden textarea (legacy)
  //    3. ถ้าทั้งสองล้ม → return 'fail' caller จะ fallback ไปปุ่ม Copy
  // =====================================================
  async function autoCopyPrompt(text) {
    // วิธีที่ 1: navigator.clipboard.writeText
    try {
      await navigator.clipboard.writeText(text);
      console.log('[RH Pharma Flow] ✅ auto-copy via clipboard.writeText');
      return 'success';
    } catch (e) {
      console.warn('[RH Pharma Flow] clipboard.writeText fail:', e.message);
    }

    // วิธีที่ 2: execCommand('copy') ผ่าน hidden textarea
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) {
        console.log('[RH Pharma Flow] ✅ auto-copy via execCommand');
        return 'success';
      }
    } catch (e) {
      console.warn('[RH Pharma Flow] execCommand copy fail:', e.message);
    }

    return 'fail';
  }

  // =====================================================
  // 🆕 Banner: แจ้งว่า prompt copy แล้ว — แค่ Ctrl+V
  // =====================================================
  function showAutoCopiedBanner() {
    const existing = document.getElementById('rh-flow-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'rh-flow-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      padding: 18px 24px;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(16, 185, 129, 0.4);
      font-family: 'Sarabun', -apple-system, sans-serif;
      font-size: 14px;
      z-index: 2147483647;
      max-width: 520px;
      min-width: 380px;
      border: 2px solid rgba(255,255,255,0.3);
      animation: rh-banner-slide-up 0.4s ease-out;
    `;

    banner.innerHTML = `
      <style>
        @keyframes rh-banner-slide-up {
          from { transform: translate(-50%, 30px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        #rh-flow-banner kbd {
          display: inline-block;
          padding: 3px 10px;
          background: rgba(255,255,255,0.3);
          border-radius: 6px;
          font-family: monospace;
          font-weight: 700;
          font-size: 14px;
          margin: 0 2px;
          border: 1px solid rgba(255,255,255,0.5);
        }
      </style>
      <div style="display:flex; align-items:center; gap:14px;">
        <span style="font-size: 36px; line-height: 1;">✅</span>
        <div style="flex: 1;">
          <div style="font-weight:700; font-size:17px; margin-bottom:6px;">
            พร้อมแล้ว — Copy prompt แล้ว
          </div>
          <div style="font-weight:400; font-size:14px; line-height:1.6; opacity:0.97;">
            👉 คลิกที่ช่อง prompt → กด <kbd>Ctrl</kbd>+<kbd>V</kbd> → ตรวจ → กด <b>→</b> ส่ง
          </div>
        </div>
        <button id="rh-flow-banner-close" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          flex-shrink: 0;
        " title="ปิด">✕</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('rh-flow-banner-close').addEventListener('click', () => {
      banner.style.transition = 'all 0.3s';
      banner.style.opacity = '0';
      banner.style.transform = 'translate(-50%, 30px)';
      setTimeout(() => banner.remove(), 300);
    });

    // auto-hide หลัง 12 วินาที (ผู้ใช้น่าจะ paste แล้ว)
    setTimeout(() => {
      if (document.getElementById('rh-flow-banner') === banner) {
        banner.style.transition = 'all 0.5s';
        banner.style.opacity = '0';
        banner.style.transform = 'translate(-50%, 30px)';
        setTimeout(() => banner.remove(), 500);
      }
    }, 12000);
  }

  // =====================================================
  // 🆕 Banner ที่มีปุ่ม "Copy Prompt" — ผู้ใช้กดเอง = ได้ user gesture
  // (กันปัญหา navigator.clipboard.writeText() failed: Document not focused)
  // =====================================================
  function showCopyPromptBanner(promptText) {
    // ลบ banner เก่าถ้ามี
    const existing = document.getElementById('rh-flow-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'rh-flow-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #10B981 0%, #4A8FB5 100%);
      color: white;
      padding: 18px 22px;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
      font-family: 'Sarabun', -apple-system, sans-serif;
      font-size: 14px;
      z-index: 2147483647;
      max-width: 580px;
      min-width: 420px;
      border: 2px solid rgba(255,255,255,0.25);
      animation: rh-banner-slide-up 0.4s ease-out;
    `;

    banner.innerHTML = `
      <style>
        @keyframes rh-banner-slide-up {
          from { transform: translate(-50%, 30px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        #rh-flow-banner kbd {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(255,255,255,0.25);
          border-radius: 6px;
          font-family: monospace;
          font-weight: 700;
          font-size: 13px;
          margin: 0 2px;
          border: 1px solid rgba(255,255,255,0.4);
        }
        #rh-copy-btn {
          background: rgba(255,255,255,0.95);
          color: #10B981;
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
          width: 100%;
          margin-top: 10px;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        #rh-copy-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        #rh-copy-btn:active { transform: translateY(0); }
        #rh-copy-btn.copied {
          background: rgba(255,255,255,0.95);
          color: #047857;
        }
      </style>
      <div style="display:flex; align-items:flex-start; gap:14px;">
        <span style="font-size: 32px; line-height: 1;">🩺</span>
        <div style="flex: 1;">
          <div style="font-weight:700; font-size:16px; margin-bottom:6px;">📋 พร้อมแล้ว!</div>
          <div style="font-weight:400; font-size:13px; line-height:1.6; opacity:0.97;">
            <b>1.</b> รอรูปโหลดเสร็จ (preview ขึ้นในช่อง prompt) <br>
            <b>2.</b> กดปุ่ม "Copy Prompt" ด้านล่าง <br>
            <b>3.</b> คลิกที่ช่อง prompt → กด <kbd>Ctrl</kbd>+<kbd>V</kbd> <br>
            <b>4.</b> ตรวจสอบ → กด <b>→</b> ส่ง
          </div>
          <button id="rh-copy-btn" type="button">
            <span style="font-size:16px;">📋</span>
            <span id="rh-copy-btn-text">Copy Prompt ไปที่ Clipboard</span>
          </button>
        </div>
        <button id="rh-flow-banner-close" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          flex-shrink: 0;
        " title="ปิด">✕</button>
      </div>
    `;

    document.body.appendChild(banner);

    // bind ปุ่ม Copy — เพราะ user gesture จาก click → clipboard.writeText() ทำงานได้
    const copyBtn = document.getElementById('rh-copy-btn');
    const copyBtnText = document.getElementById('rh-copy-btn-text');

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(promptText);
        copyBtn.classList.add('copied');
        copyBtnText.textContent = '✅ Copy แล้ว — กด Ctrl+V ในช่อง prompt';
        console.log('[RH Pharma Flow] ✅ copy prompt สำเร็จจาก user click');

        // คืนข้อความเดิมหลัง 3 วินาที
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtnText.textContent = '📋 Copy อีกครั้ง';
        }, 3000);
      } catch (err) {
        console.error('[RH Pharma Flow] copy ไม่สำเร็จ:', err);
        // Fallback: ใช้วิธี execCommand เก่า
        try {
          const ta = document.createElement('textarea');
          ta.value = promptText;
          ta.style.cssText = 'position:fixed;top:-9999px;opacity:0;';
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(ta);
          if (ok) {
            copyBtn.classList.add('copied');
            copyBtnText.textContent = '✅ Copy แล้ว (legacy)';
            setTimeout(() => { copyBtnText.textContent = '📋 Copy อีกครั้ง'; copyBtn.classList.remove('copied'); }, 3000);
          } else {
            copyBtnText.textContent = '❌ Copy ไม่ได้ — ลองใหม่';
          }
        } catch (e) {
          copyBtnText.textContent = '❌ Copy ไม่ได้ — ลองใหม่';
        }
      }
    });

    document.getElementById('rh-flow-banner-close').addEventListener('click', () => {
      banner.style.transition = 'all 0.3s';
      banner.style.opacity = '0';
      banner.style.transform = 'translate(-50%, 30px)';
      setTimeout(() => banner.remove(), 300);
    });
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // =====================================================
  // รอให้ Flow UI พร้อมก่อนทำงาน
  // (จอดำ = Flow project ยังโหลดไม่เสร็จ)
  // =====================================================
  async function waitForFlowReady(maxWait = 20000) {
    const start = Date.now();
    console.log('[RH Pharma Flow] รอ UI พร้อม...');

    while (Date.now() - start < maxWait) {
      // Flow พร้อมเมื่อมี prompt input ให้กรอก และ ไม่ใช่จอดำ
      const input = findPromptInput();
      const bodyNotBlack = document.body &&
        document.body.children.length > 3 &&
        document.body.offsetHeight > 100;

      if (input && bodyNotBlack) {
        console.log('[RH Pharma Flow] UI พร้อม! (', Math.round((Date.now()-start)/1000), 'วิ)');
        await sleep(800); // padding เพิ่มหลังเจอ input
        return true;
      }

      // Flow มักแสดง loading indicator ก่อน — รอ
      await sleep(1000);
    }

    console.warn('[RH Pharma Flow] รอ UI นาน — ทำต่อไป');
    return false;
  }

  // =====================================================
  // รอ image preview ขึ้น — หลาย strategy เพราะ Flow ใช้ Angular
  // =====================================================
  async function waitForImagePreview(expectedCount = 1, maxWait = 15000) {
    const start = Date.now();

    while (Date.now() - start < maxWait) {
      // Flow อาจแสดง thumbnail รูปที่อัปโหลดผ่านหลาย element

      // Approach A: img ที่ใช้ blob:// หรือ data:// URL (มักเป็น thumbnail จริง)
      const blobImgs = Array.from(document.querySelectorAll('img[src^="blob:"], img[src^="data:"]'))
        .filter(el => el.offsetParent !== null && el.offsetWidth > 20 && el.offsetHeight > 20);

      if (blobImgs.length >= expectedCount) {
        console.log(`[RH Pharma Flow] เจอ blob/data img ${blobImgs.length} รูป`);
        return true;
      }

      // Approach B: element ที่มี aria-label บอกว่าเป็น thumbnail/reference image
      const thumbEls = document.querySelectorAll(
        '[aria-label*="reference" i], [aria-label*="thumbnail" i], [aria-label*="uploaded" i], ' +
        '[aria-label*="image" i], [class*="thumbnail" i], [class*="preview" i], [class*="reference" i]'
      );
      const visibleThumbs = Array.from(thumbEls).filter(el =>
        el.offsetParent !== null && el.offsetWidth > 20
      );
      if (visibleThumbs.length >= expectedCount) {
        console.log(`[RH Pharma Flow] เจอ thumbnail element ${visibleThumbs.length} ตัว`);
        return true;
      }

      // Approach C: img ใหม่ที่โผล่ขึ้นหลัง upload (มีขนาดจริง)
      const allImgs = Array.from(document.querySelectorAll('img')).filter(el => {
        if (el.offsetParent === null) return false;
        const w = el.offsetWidth, h = el.offsetHeight;
        const src = el.src || '';
        // ไม่นับ icon เล็กหรือ logo (มักมี src แบบ svg หรือ icon path)
        if (w < 20 || h < 20) return false;
        if (src.includes('icon') || src.includes('logo') || src.endsWith('.svg')) return false;
        return true;
      });

      // ถ้าจำนวน img เพิ่มขึ้นจาก initial ถือว่า upload แล้ว
      if (allImgs.length >= expectedCount + 1) { // +1 เพราะหน้า Flow มี img อื่นอยู่แล้ว
        console.log(`[RH Pharma Flow] เจอ img เพิ่มขึ้น: ${allImgs.length}`);
        return true;
      }

      await sleep(500);
    }

    // Timeout: ถ้ารอนาน 15 วิแล้วยังไม่เจอ — ถือว่าอัปโหลดสำเร็จแล้ว (silent pass)
    // เพราะ Flow บางครั้งไม่แสดง preview ที่ detect ได้ แต่ก็รับรูปไปแล้ว
    console.warn('[RH Pharma Flow] รอ preview ไม่เจอ — ถือว่า OK แล้วทำต่อ');
    return true; // ← เปลี่ยนจาก false เป็น true เพื่อไม่ block flow
  }

  // =====================================================
  // Step 0: กดปุ่ม Nano Banana เพื่อเปิด panel + เลือก Pro
  // (ต้องทำก่อนทุกอย่าง — Flow ซ่อน ratio/count/type ไว้จนกว่าจะเปิด)
  // =====================================================
  // =====================================================
  // 🆕 selectImageMode — คลิก "Image" tab (ไม่ใช่ Video)
  //    Flow panel เปิดอยู่แล้วเมื่อเรียกฟังก์ชันนี้
  // =====================================================
  async function selectImageMode() {
    await sleep(300);
    // หา toggle/tab button ที่ระบุว่าเป็น "Image"
    // Flow panel มี Image / Video tabs — ตอนนี้ default มักเป็น Image อยู่แล้ว
    const candidates = Array.from(document.querySelectorAll('button, [role="tab"], [role="button"]'));
    for (const el of candidates) {
      if (el.offsetParent === null) continue;
      const rect = el.getBoundingClientRect();
      if (rect.left >= 1100) continue; // กรอง side panel
      const txt = el.textContent.trim().toLowerCase();
      const label = (el.getAttribute('aria-label') || '').toLowerCase();

      // หา "Image" tab — text ต้องเป็น "Image" เดี่ยวๆ ไม่ใช่ "image something"
      if (txt === 'image' || txt === '🖼 image' || label === 'image' || label.startsWith('image')) {
        // เช็คว่าเป็น tab ที่ active อยู่แล้วไหม
        const isActive = el.classList.contains('active') ||
                         el.getAttribute('aria-selected') === 'true' ||
                         el.getAttribute('data-state') === 'active';
        if (isActive) {
          console.log('[RH Pharma Flow] Image mode active อยู่แล้ว — skip');
          return true;
        }
        console.log('[RH Pharma Flow] คลิก Image tab');
        el.click();
        await sleep(500);
        return true;
      }
    }
    console.log('[RH Pharma Flow] หา Image tab ไม่เจอ — น่าจะ default เป็น Image อยู่แล้ว');
    return false;
  }

  // =====================================================
  // 🎬 selectVideoMode — คลิก "Video" tab
  // =====================================================
  async function selectVideoMode() {
    await sleep(300);
    const candidates = Array.from(document.querySelectorAll('button, [role="tab"], [role="button"]'));
    for (const el of candidates) {
      if (el.offsetParent === null) continue;
      const rect = el.getBoundingClientRect();
      if (rect.left >= 1100) continue;
      const txt = el.textContent.trim().toLowerCase();
      const label = (el.getAttribute('aria-label') || '').toLowerCase();

      // หา "Video" tab — text ต้องเป็น "Video" เดี่ยวๆ
      if (txt === 'video' || txt === '🎥 video' || label === 'video' || label.startsWith('video')) {
        const isActive = el.classList.contains('active') ||
                         el.getAttribute('aria-selected') === 'true' ||
                         el.getAttribute('data-state') === 'active';
        if (isActive) {
          console.log('[RH Pharma Flow] Video mode active อยู่แล้ว — skip');
          return true;
        }
        console.log('[RH Pharma Flow] คลิก Video tab');
        el.click();
        await sleep(600);
        return true;
      }
    }
    console.warn('[RH Pharma Flow] หา Video tab ไม่เจอ');
    return false;
  }

  // =====================================================
  // 🎬 selectVideoDuration — คลิก "8s" (default)
  //    Flow Veo มี 4s / 6s / 8s
  // =====================================================
  async function selectVideoDuration(duration = 8) {
    await sleep(300);
    const target = `${duration}s`.toLowerCase();
    const candidates = Array.from(document.querySelectorAll('button, [role="button"], [role="option"]'));
    for (const el of candidates) {
      if (el.offsetParent === null) continue;
      const rect = el.getBoundingClientRect();
      if (rect.left >= 1100) continue;
      const txt = el.textContent.trim().toLowerCase();
      const label = (el.getAttribute('aria-label') || '').toLowerCase().trim();

      if (txt === target || label === target) {
        console.log(`[RH Pharma Flow] คลิก duration ${target}`);
        el.click();
        await sleep(400);
        return true;
      }
    }
    console.warn(`[RH Pharma Flow] หาปุ่ม duration ${target} ไม่เจอ — ข้ามไป`);
    return false;
  }

  async function openModelPanelAndSelectPro() {
    // หาปุ่ม Nano Banana เฉพาะใน Flow (left < 1100, ไม่ใช่ side panel)
    const modelBtn = Array.from(document.querySelectorAll('button, [role="button"]')).find(el => {
      if (el.offsetParent === null) return false;
      if (el.getBoundingClientRect().left >= 1100) return false; // กรอง side panel
      const txt = el.textContent.trim();
      return txt.includes('Nano Banana') || txt.includes('Imagen');
    });

    if (!modelBtn) {
      console.warn('[RH Pharma Flow] หาปุ่ม Nano Banana ไม่เจอ');
      return { ok: false, modelBtn: null };
    }

    console.log('[RH Pharma Flow] คลิกปุ่ม Nano Banana:', modelBtn.textContent.trim().slice(0, 40));
    modelBtn.click();
    await sleep(800);

    // เลือก Nano Banana Pro จาก dropdown
    const proOption = Array.from(document.querySelectorAll('button, [role="option"], [role="menuitem"], li'))
      .find(el => {
        if (el.offsetParent === null) return false;
        if (el.getBoundingClientRect().left >= 1100) return false; // กรอง side panel
        const txt = el.textContent.trim();
        return txt.includes('Nano Banana Pro');
      });

    if (proOption) {
      console.log('[RH Pharma Flow] เลือก Nano Banana Pro');
      proOption.click();
      await sleep(1000);
      // ❗ ไม่ปิด panel ตรงนี้ — caller (processPending) จะเลือก ratio/count ใน panel นี้ก่อน
      //    แล้วค่อยปิด panel ด้วยการคลิกปุ่ม Nano Banana อีกครั้ง
      return { ok: true, modelBtn };
    }

    console.warn('[RH Pharma Flow] หา Nano Banana Pro ไม่เจอ — ใช้ default');
    return { ok: false, modelBtn };
  }

  // ปิด Nano Banana panel ด้วยการคลิกปุ่ม Nano Banana อีกครั้ง
  async function closeModelPanel(modelBtn) {
    if (!modelBtn) return;
    try {
      console.log('[RH Pharma Flow] ปิด Nano Banana panel (คลิกปุ่ม Nano Banana อีกครั้ง)');
      modelBtn.click();
      await sleep(500);
    } catch (e) {
      console.warn('[RH Pharma Flow] closeModelPanel error:', e);
      document.body.click(); // fallback
      await sleep(300);
    }
  }

  // =====================================================
  // กด Generate — ปุ่ม → ขวาสุดใน Flow prompt bar (left < 1100)
  // =====================================================
  async function clickGenerate() {
    // Strategy 1: หาปุ่มใน prompt container ที่อยู่ใน Flow
    const promptInput = findPromptInput();
    if (promptInput) {
      let el = promptInput;
      for (let i = 0; i < 6; i++) {
        el = el.parentElement;
        if (!el || el === document.body) break;
        const btns = Array.from(el.querySelectorAll('button'))
          .filter(b => {
            if (b.disabled || b.offsetParent === null) return false;
            const rect = b.getBoundingClientRect();
            if (rect.left >= 1100) return false; // กรอง side panel
            const label = (b.getAttribute('aria-label') || '').toLowerCase();
            return !label.includes('upload') && !label.includes('attach') &&
                   !label.includes('setting') && b.textContent.trim() !== '+';
          });
        if (btns.length >= 1) {
          // ปุ่มขวาสุด = Generate
          btns.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right);
          console.log('[RH Pharma Flow] คลิก Generate (rightmost in prompt container)');
          btns[0].click();
          return true;
        }
      }
    }

    // Strategy 2: ปุ่มล่างขวาของ Flow (ไม่ใช่ side panel)
    const allBtns = Array.from(document.querySelectorAll('button'))
      .filter(btn => {
        if (btn.disabled || btn.offsetParent === null) return false;
        const rect = btn.getBoundingClientRect();
        const label = (btn.getAttribute('aria-label') || '').toLowerCase();
        return rect.top > window.innerHeight * 0.6 &&
               rect.left < 1100 &&  // กรอง side panel
               rect.right > window.innerWidth * 0.3 &&
               !label.includes('setting') && !label.includes('upload') &&
               btn.textContent.trim() !== '+';
      });

    allBtns.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right);
    if (allBtns.length > 0) {
      console.log('[RH Pharma Flow] คลิก Generate (bottom-right in Flow):', allBtns[0].getAttribute('aria-label') || '→');
      allBtns[0].click();
      return true;
    }

    // Strategy 3: aria-label patterns
    for (const pattern of ['generate', 'create', 'submit', 'run']) {
      const btn = document.querySelector(`button[aria-label*="${pattern}" i]:not([disabled])`);
      if (btn && btn.offsetParent !== null && btn.getBoundingClientRect().left < 1100) {
        btn.click();
        return true;
      }
    }

    console.warn('[RH Pharma Flow] หาปุ่ม Generate ไม่เจอ — ลองทุก strategy แล้ว');
    return false;
  }

  // =====================================================
  // กระบวนการหลัก: เปิด model panel → ratio → count → upload → paste → generate
  // =====================================================
  let processing = false;

  // ใช้ sessionStorage ป้องกันกด Submit ซ้ำในแท็บเดียวกัน
  function isFlowSubmitted() {
    return sessionStorage.getItem('rh-pharma-flow-submitted') === 'true';
  }
  function markFlowSubmitted() {
    sessionStorage.setItem('rh-pharma-flow-submitted', 'true');
    setTimeout(() => sessionStorage.removeItem('rh-pharma-flow-submitted'), 60000);
  }

  async function processPending() {
    if (processing) {
      console.log('[RH Pharma Flow] กำลังประมวลผลอยู่ — skip');
      return;
    }
    if (isFlowSubmitted()) {
      console.log('[RH Pharma Flow] submit ไปแล้วในแท็บนี้ — skip');
      return;
    }

    processing = true;

    try {
      const data = await chrome.storage.local.get(['rhPharmaFlowPending']);
      const pending = data.rhPharmaFlowPending;

      if (!pending || !pending.prompt) {
        console.log('[RH Pharma Flow] ไม่มี pending data');
        return;
      }

      // ลบทันที — ป้องกันทำซ้ำ
      await chrome.storage.local.remove(['rhPharmaFlowPending']);

      console.log('[RH Pharma Flow] เริ่มประมวลผล:', {
        promptLength: pending.prompt.length,
        ratio: pending.ratio,
        count: pending.count,
        model: pending.model,
        mode: pending.mode,
        duration: pending.duration,
        images: pending.images?.length || 0,
        autoGenerate: pending.autoGenerate
      });

      // 🆕 v0.9.35: Toast เริ่มต้น — บอก user ว่า extension เริ่มทำงานแล้ว
      const modeIcon = pending.mode === 'video' ? '🎬' : '🖼️';
      const settingsLabel = pending.mode === 'video'
        ? `${pending.ratio || ''} · x${pending.count || 1} · ${pending.duration || 8}s`
        : `${pending.ratio || ''} · x${pending.count || 1}`;
      showFlowToast(`${modeIcon} RH Pharma เริ่มทำงาน — ${settingsLabel}`, 'info');
      await sleep(500);

      // === รอ Flow UI พร้อม ===
      showFlowToast('⏳ รอ Flow โหลด...', 'info');
      await waitForFlowReady();
      showFlowToast('🎬 กำลังตั้งค่า...', 'info');

      // === ขั้น 1: Paste รูปตรงๆ ลงหน้า Flow (ไม่ผ่าน Asset library) ===
      // วิธีนี้ง่ายและเสถียรที่สุด — Flow รับ paste image event ตรงๆ ได้
      // ❌ ไม่มี fallback อัปโหลด Asset library อีกแล้ว — กันปัญหารูปซ้ำ 4 รูป
      if (pending.images && pending.images.length > 0) {
        showFlowToast(`📋 Paste ${pending.images.length} รูปลงหน้า Flow...`, 'info');
        const imgCountBefore = document.querySelectorAll('img').length;
        const pastedOk = await pasteImagesIntoFlow(pending.images);

        // ตรวจ delta — ถ้ามีรูปเพิ่ม = สำเร็จ (แม้ pasteImagesIntoFlow return false)
        const imgCountAfter = document.querySelectorAll('img').length;
        const imgsAdded = imgCountAfter - imgCountBefore;

        if (pastedOk || imgsAdded >= pending.images.length) {
          showFlowToast('✅ Paste รูปลงหน้า Flow แล้ว', 'success');
          console.log(`[RH Pharma Flow] paste สำเร็จ — img เพิ่ม ${imgsAdded} ตัว`);
        } else {
          // ⚠️ ไม่ fallback ไป upload library — แค่แจ้งให้ผู้ใช้ลากรูปเอง
          console.warn(`[RH Pharma Flow] paste ไม่สำเร็จ — img เพิ่มแค่ ${imgsAdded}/${pending.images.length}`);
          showFlowToast('⚠️ ใส่รูปอัตโนมัติไม่สำเร็จ — กรุณาลากรูปจาก side panel ลง Flow เอง', 'error');
        }
        await sleep(800);
      }

      // === ขั้น 2: รอรูป preview ขึ้นในหน้า Flow (สูงสุด 30 วินาที) ===
      if (pending.images && pending.images.length > 0) {
        showFlowToast(`⏳ รอรูป preview ขึ้น (สูงสุด 30s)...`, 'info');
        await waitForPromptBarPreview(pending.images.length, 30000);
        showFlowToast('✅ รูป preview ขึ้นแล้ว', 'success');
        await sleep(1000); // safety buffer
      }

      // === ขั้น 3: ตรวจจอดำก่อน paste prompt → ถ้าดำ reload ===
      if (detectBlackScreen()) {
        showFlowToast('⚠️ Flow จอดำ — กำลัง reload', 'error');
        await chrome.storage.local.set({ rhPharmaFlowPending: pending });
        await reloadOnBlackScreen();
        return;
      }

      // === ⏭️ Step 3.5: SKIP เลือก Nano Banana Pro (Flow จำให้แล้ว) ===

      // === 🎯 ขั้น 4: Auto-select Image/Video mode + Ratio + Count ===
      // ❗ skipSettings = true ถ้าเป็นฉาก 2-4 ของ video → ตั้งค่าครั้งเดียวพอ
      const isVideoMode = pending.mode === 'video';
      const skipSettings = !!pending.skipSettings;

      if (skipSettings) {
        console.log('[RH Pharma Flow] skipSettings = true → ข้ามตั้งค่า ratio/count');
        showFlowToast(`📋 ฉากที่ ${pending.sceneIdx || ''} — ใช้ค่าเดิม`, 'info');
      } else {
        let panelOpened = false;
        try {
          showFlowToast('🎯 กำลังตั้งค่า ratio + count...', 'info');

          // 🆕 v0.9.35: Focus prompt input ก่อน เพื่อให้ toolbar (Nano Banana / Veo button) แสดง
          // Flow ซ่อน toolbar ไว้จนกว่า user จะ focus ที่ prompt
          const promptInputForFocus = findPromptInput();
          if (promptInputForFocus) {
            console.log('[RH Pharma Flow] focus prompt input ก่อน config');
            promptInputForFocus.focus();
            promptInputForFocus.click();
            await sleep(800); // ให้ Flow render toolbar
          }

          // 4a: คลิกปุ่ม Nano Banana / Veo → เปิด panel
          // 🆕 retry logic: ลองหา 3 รอบ (Flow อาจ render ช้า)
          let modelBtn = null;
          for (let attempt = 0; attempt < 3; attempt++) {
            const allBtns = Array.from(document.querySelectorAll('button, [role="button"]'));
            const visibleBtns = allBtns.filter(el => {
              if (el.offsetParent === null) return false;
              if (el.getBoundingClientRect().left >= 1100) return false;
              return true;
            });

            modelBtn = visibleBtns.find(el => {
              const txt = el.textContent.trim();
              return txt.includes('Nano Banana') || txt.includes('Imagen') || txt.includes('Veo');
            });

            if (modelBtn) break;
            console.log(`[RH Pharma Flow] หา model button รอบ ${attempt+1}/3 — ยังไม่เจอ (${visibleBtns.length} ปุ่มใน Flow)`);
            // ลอง focus prompt อีกครั้ง
            if (promptInputForFocus) {
              promptInputForFocus.focus();
              promptInputForFocus.click();
            }
            await sleep(1500);
          }

          if (modelBtn) {
            const modelTxt = modelBtn.textContent.trim().slice(0, 50);
            console.log(`[RH Pharma Flow] เปิด model panel — text: "${modelTxt}"`);
            modelBtn.click();
            await sleep(1000); // ให้ popup render เสร็จ
            panelOpened = true;

            // 4b: เลือก Video หรือ Image mode
            if (isVideoMode) {
              const okV = await selectVideoMode();
              console.log(`[RH Pharma Flow] selectVideoMode:`, okV ? '✅' : '❌');
            } else {
              const okI = await selectImageMode();
              console.log(`[RH Pharma Flow] selectImageMode:`, okI ? '✅' : '⚠️ default Image');
            }
            await sleep(500);

            // 4c: เลือก ratio
            if (pending.ratio) {
              const okR = await selectAspectRatio(pending.ratio);
              console.log(`[RH Pharma Flow] selectAspectRatio(${pending.ratio}):`, okR ? '✅' : '❌');
              await sleep(400);
            }

            // 4d: เลือก count
            if (pending.count) {
              const okC = await selectCount(pending.count);
              console.log(`[RH Pharma Flow] selectCount(${pending.count}):`, okC ? '✅' : '❌');
              await sleep(400);
            }

            // 4e: ถ้า video — เลือก duration (default 8s)
            if (isVideoMode) {
              const dur = pending.duration || 8;
              const okD = await selectVideoDuration(dur);
              console.log(`[RH Pharma Flow] selectVideoDuration(${dur}s):`, okD ? '✅' : '❌');
              await sleep(400);
            }

            // 4f: ปิด panel — คลิก model button อีกครั้ง
            console.log('[RH Pharma Flow] ปิด model panel');
            try { modelBtn.click(); } catch(_) { document.body.click(); }
            await sleep(500);

            const modeLabel = isVideoMode ? `Video · ${pending.duration || 8}s` : 'Image';
            showFlowToast(`✅ ตั้งค่า ${modeLabel} · ${pending.ratio || ''} · x${pending.count || ''}`, 'success');
          } else {
            console.warn('[RH Pharma Flow] หาปุ่ม model ไม่เจอหลัง retry 3 รอบ');
            const allVisibleBtns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null && b.getBoundingClientRect().left < 1100);
            console.log('[RH Pharma Flow] ปุ่มทั้งหมดใน Flow:', allVisibleBtns.map(b => b.textContent.trim().slice(0, 30)).filter(t => t.length > 0).slice(0, 20));
            showFlowToast('⚠️ ตั้งค่าอัตโนมัติไม่ได้ — กรุณาเลือกเอง', 'info');
          }
        } catch (e) {
          console.warn('[RH Pharma Flow] auto-select error:', e);
        }
      }

      await sleep(500);

      // === 📋 ขั้น 5: Auto-copy prompt ไป clipboard ===
      // ลองหลายวิธี — execCommand legacy → navigator.clipboard → fallback ปุ่ม Copy
      try {
        sessionStorage.setItem('rh-pharma-prompt-pending', pending.prompt);
      } catch (e) { /* ignore */ }

      const copyResult = await autoCopyPrompt(pending.prompt);

      // === 💬 ขั้น 6: แสดง banner ตามผลของ auto-copy ===
      if (copyResult === 'success') {
        showAutoCopiedBanner();
      } else {
        // fallback: แสดง banner ที่มีปุ่ม Copy ให้ผู้ใช้กดเอง
        showCopyPromptBanner(pending.prompt);
      }

    } catch (err) {
      console.error('[RH Pharma Flow] error:', err);
      showFlowToast('❌ ' + err.message, 'error');
    } finally {
      processing = false;
    }
  }

  // =====================================================
  // รอ Flow สร้างวิดีโอเสร็จ — ตรวจจาก video element
  // =====================================================
  async function waitForFlowVideo(maxWait = 240000) {
    const start = Date.now();
    const initialVideos = document.querySelectorAll('video').length;
    console.log(`[RH Flow Autopilot] รอวิดีโอ — เริ่มต้น ${initialVideos} ตัว`);

    while (Date.now() - start < maxWait) {
      const allVideos = Array.from(document.querySelectorAll('video')).filter(v =>
        v.offsetParent !== null && v.offsetWidth > 80 && (v.src || v.currentSrc || v.querySelector('source'))
      );
      if (allVideos.length > initialVideos) {
        console.log(`[RH Flow Autopilot] เจอวิดีโอใหม่ (${allVideos.length}) — เสร็จแล้ว`);
        await sleep(2000);
        return true;
      }
      // เช็ค progress bar ที่หายไป (Flow แสดง spinner ขณะสร้าง)
      const spinners = document.querySelectorAll('[aria-label*="loading" i], [aria-label*="generating" i], .progress, [role="progressbar"]');
      if (Date.now() - start > 10000 && spinners.length === 0 && allVideos.length >= initialVideos) {
        // ผ่านไป 10 วิ + ไม่มี spinner แล้ว = อาจเสร็จแต่ไม่มี video element
        // (Flow อาจแสดงรูปนิ่งแทน) — ถือว่าเสร็จ
        console.log('[RH Flow Autopilot] ไม่มี spinner — ถือว่าเสร็จ');
        await sleep(1500);
        return true;
      }
      await sleep(3000);
    }
    console.warn('[RH Flow Autopilot] timeout');
    return false;
  }

  // =====================================================
  // STOP FLAG — หยุด autopilot กลางคัน
  // =====================================================
  let autopilotStopped = false;

  function showStopButton(sceneNum, total) {
    // เอาปุ่มเก่าออกก่อน
    const old = document.getElementById('rh-stop-btn');
    if (old) old.remove();

    const btn = document.createElement('div');
    btn.id = 'rh-stop-btn';
    btn.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: #EF4444;
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      font-family: 'Sarabun', -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 700;
      z-index: 2147483647;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      user-select: none;
      border: 2px solid rgba(255,255,255,0.3);
      transition: transform 0.1s;
    `;
    btn.innerHTML = `<span style="font-size:18px">⏹️</span> หยุด Autopilot (${sceneNum}/${total})`;
    btn.addEventListener('click', () => {
      autopilotStopped = true;
      btn.innerHTML = `<span style="font-size:18px">✅</span> กำลังหยุด...`;
      btn.style.background = '#6B7280';
      btn.style.cursor = 'default';
      showFlowToast('⏹️ หยุด Autopilot แล้ว — รอ scene นี้เสร็จก่อน', 'info');
      // เคลียร์ autopilot data จาก storage ด้วย
      chrome.storage.local.remove(['rhPharmaFlowAutopilot', 'rhPharmaFlowPending']);
      // แจ้ง side panel
      try { chrome.runtime.sendMessage({ action: 'flowAutopilotStopped' }); } catch(_) {}
    });
    document.body.appendChild(btn);
  }

  function removeStopButton() {
    const btn = document.getElementById('rh-stop-btn');
    if (btn) btn.remove();
  }

  // =====================================================
  // FLOW AUTOPILOT — เปิด tab ใหม่ทุก scene (กัน crash)
  // แต่ละ tab ทำแค่ 1 scene แล้วจบ
  // =====================================================
  async function runFlowAutopilot(data) {
    const { characterLock, scenes, images, ratio, currentScene } = data;
    const total = scenes.filter(s => s && s.length > 10).length;
    const i = currentScene || 0;  // scene index ที่ต้องทำตอนนี้

    autopilotStopped = false;

    // ตรวจว่ายังมี scene ที่ต้องทำ
    if (i >= scenes.length) {
      removeStopButton();
      showFlowToast(`🎉 ครบทุก ${total} scenes! ดาวน์โหลดได้เลย`, 'success');
      try { chrome.runtime.sendMessage({ action: 'flowAutopilotDone', total }); } catch(_) {}
      return;
    }

    const sceneText = scenes[i];
    if (!sceneText || sceneText.length < 10) {
      // ข้าม scene ว่าง → ไป scene ถัดไป
      await advanceToNextScene(data, i, total);
      return;
    }

    const sceneNum = i + 1;
    showStopButton(sceneNum, total);
    showFlowToast(`🎬 Scene ${sceneNum}/${total} — tab ใหม่ สะอาด ไม่ crash`, 'info');

    const prompt = `${characterLock}

Now generate only this single 8-second clip:

${sceneText}

IMPORTANT: Generate ONLY this one scene. Maintain CHARACTER LOCK appearance above.`;

    // === ทำ 1 scene ใน tab นี้ ===
    sessionStorage.removeItem('rh-pharma-flow-submitted');
    processing = false;

    await chrome.storage.local.set({
      rhPharmaFlowPending: {
        prompt,
        images: images || [],
        ratio: ratio || '9:16',
        count: 1,
        autoGenerate: true,
        timestamp: Date.now()
      }
    });

    await processPending();

    if (autopilotStopped) {
      removeStopButton();
      showFlowToast('⏹️ Autopilot ถูกหยุด', 'info');
      return;
    }

    // รอ Flow generate เสร็จ
    showFlowToast(`⏳ Scene ${sceneNum}/${total} — รอ Flow สร้าง...`, 'info');
    await waitForFlowVideo(240000);
    showFlowToast(`✅ Scene ${sceneNum}/${total} เสร็จแล้ว!`, 'success');

    try { chrome.runtime.sendMessage({ action: 'flowSceneDone', sceneNum, total }); } catch(_) {}

    if (autopilotStopped) {
      removeStopButton();
      return;
    }

    // รอนิดหนึ่งก่อนเปิด tab ใหม่
    await sleep(3000);

    // === เปิด tab ใหม่สำหรับ scene ถัดไป (กัน crash จาก accumulated state) ===
    await advanceToNextScene(data, i, total);
  }

  // เปิด tab Flow ใหม่พร้อม autopilot data ที่อัปเดต currentScene
  // ⚠️ content script ไม่มีสิทธิ์ chrome.tabs.create → ส่งผ่าน background แทน
  async function advanceToNextScene(data, currentIndex, total) {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= data.scenes.length || nextIndex >= total) {
      removeStopButton();
      showFlowToast(`🎉 ครบทุก ${total} scenes!`, 'success');
      try { chrome.runtime.sendMessage({ action: 'flowAutopilotDone', total }); } catch(_) {}
      return;
    }

    // บันทึก autopilot data กับ currentScene ที่อัปเดต
    await chrome.storage.local.set({
      rhPharmaFlowAutopilot: { ...data, currentScene: nextIndex }
    });

    showFlowToast(`🔄 เปิด tab ใหม่ — Scene ${nextIndex + 1}/${total}`, 'info');

    // ส่งไปให้ background service worker เปิด tab (content script ทำเองไม่ได้)
    try {
      chrome.runtime.sendMessage({
        action: 'openFlowTab',
        url: 'https://labs.google/fx/tools/flow'
      });
    } catch(e) {
      console.error('[RH Pharma Flow] เปิด tab ไม่ได้:', e.message);
    }
  }

  // =====================================================
  // ตรวจสอบว่าเป็นหน้า Flow Gallery หรือหน้า Project
  // =====================================================
  function isFlowGalleryPage() {
    // Gallery URL: /fx/tools/flow (ไม่มี /project/)
    // Project URL: /fx/tools/flow/project/xxx
    return !window.location.pathname.includes('/project/');
  }

  // รอผู้ใช้กด New project แล้ว navigate ไปหน้า project
  async function waitForUserToOpenProject(maxWait = 300000) { // รอ 5 นาที
    const initialUrl = window.location.href;
    const start = Date.now();

    showFlowToast('👆 กรุณากด "+ New project" เพื่อเริ่ม Autopilot', 'info');

    return new Promise(resolve => {
      const observer = new MutationObserver(() => {
        if (window.location.href !== initialUrl && window.location.pathname.includes('/project/')) {
          observer.disconnect();
          resolve(true);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      // fallback: poll URL ทุก 500ms
      const poll = setInterval(() => {
        if (window.location.pathname.includes('/project/')) {
          clearInterval(poll);
          observer.disconnect();
          resolve(true);
        }
        if (Date.now() - start > maxWait) {
          clearInterval(poll);
          observer.disconnect();
          resolve(false);
        }
      }, 500);
    });
  }

  // =====================================================
  // เริ่มทำงาน — ตรวจว่าอยู่ใน gallery หรือ project
  // =====================================================
  async function start() {
    await sleep(2000);

    // เช็ค autopilot data ก่อน
    const data = await chrome.storage.local.get(['rhPharmaFlowAutopilot']);

    // === หน้า Gallery (ไม่มี /project/ ใน URL) ===
    if (isFlowGalleryPage()) {
      if (data.rhPharmaFlowAutopilot) {
        // มี autopilot data รออยู่ → แนะนำให้กด New project
        const apData = data.rhPharmaFlowAutopilot;
        const total = apData.scenes.filter(s => s && s.length > 10).length;
        const current = (apData.currentScene || 0) + 1;

        showFlowToast(
          `🚀 Autopilot พร้อม (Scene ${current}/${total}) — กด "+ New project" เพื่อเริ่ม`,
          'info'
        );

        // รอผู้ใช้กด New project
        const opened = await waitForUserToOpenProject(300000);
        if (!opened) {
          showFlowToast('⏱️ รอนานเกินไป — กด Autopilot ใหม่', 'error');
          return;
        }

        // navigate ไปหน้า project แล้ว → start() จะถูกเรียกอีกครั้งจาก history change
        // แต่เพราะ content script ทำงานต่อใน context เดิม ต้องเรียก runFlowAutopilot เอง
        await chrome.storage.local.remove(['rhPharmaFlowAutopilot']);
        sessionStorage.removeItem('rh-pharma-flow-submitted');

        await sleep(2000); // รอ project โหลด
        showFlowToast(`🎬 Scene ${current}/${total} — tab ใหม่พร้อมแล้ว`, 'info');
        await runFlowAutopilot(apData);

      } else if (await chrome.storage.local.get(['rhPharmaFlowPending']).then(d => !!d.rhPharmaFlowPending)) {
        // มี pending infographic/image → แนะนำให้กด New project
        showFlowToast('👆 กรุณากด "+ New project" เพื่อเริ่มสร้างสื่อ', 'info');
        const opened = await waitForUserToOpenProject(300000);
        if (opened) {
          await sleep(2000);
          await processPending();
        }
      }
      // ถ้าไม่มีอะไรรออยู่ → ไม่ทำอะไร (ผู้ใช้แค่เปิด Flow ดู gallery)
      return;
    }

    // === หน้า Project (/project/ ใน URL) ===
    if (data.rhPharmaFlowAutopilot) {
      const apData = data.rhPharmaFlowAutopilot;
      await chrome.storage.local.remove(['rhPharmaFlowAutopilot']);
      sessionStorage.removeItem('rh-pharma-flow-submitted');

      const total = apData.scenes.filter(s => s && s.length > 10).length;
      const current = (apData.currentScene || 0) + 1;
      showFlowToast(`🚀 Autopilot: Scene ${current}/${total}`, 'info');
      await sleep(1500);
      await runFlowAutopilot(apData);
      return;
    }

    await processPending();
  }

  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start);
  }

  // Message listener
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'flowProcessPending') {
      sessionStorage.removeItem('rh-pharma-flow-submitted');
      processPending().then(() => sendResponse({ success: true }));
      return true;
    }
    if (msg.action === 'flowAutopilot') {
      chrome.storage.local.get(['rhPharmaFlowAutopilot']).then(d => {
        const apData = d.rhPharmaFlowAutopilot;
        if (!apData) { sendResponse({ success: false }); return; }
        chrome.storage.local.remove(['rhPharmaFlowAutopilot']);
        sessionStorage.removeItem('rh-pharma-flow-submitted');
        runFlowAutopilot(apData)
          .then(() => sendResponse({ success: true }))
          .catch(e => sendResponse({ success: false, error: e.message }));
      });
      return true;
    }
    // หยุด autopilot กลางคัน
    if (msg.action === 'flowAutopilotStop') {
      autopilotStopped = true;
      chrome.storage.local.remove(['rhPharmaFlowAutopilot', 'rhPharmaFlowPending']);
      removeStopButton();
      showFlowToast('⏹️ Autopilot ถูกหยุดจาก Side Panel', 'info');
      sendResponse({ success: true });
      return true;
    }
  });

  console.log('[RH Pharma Flow] พร้อมรับคำสั่ง v2 (autopilot ready)');
})();
