// =====================================================
// RH Pharma - Gemini Auto-Paste v3
// =====================================================
// แก้ปัญหา:
// - Submit ซ้ำๆ — ใช้ session flag กดครั้งเดียวเท่านั้น
// - รูปไม่อัปโหลด — ใช้ปุ่ม "+" → "Upload files" → file input
// - ลำดับ: chip → upload → paste → submit (เพื่อไม่ interrupt generate)
// =====================================================

(function () {
  'use strict';

  if (window.__rhPharmaGeminiLoaded) return;
  window.__rhPharmaGeminiLoaded = true;

  console.log('[RH Pharma Gemini] Content script v3 loaded');

  // =====================================================
  // Session-level state — กันทำซ้ำในแท็บเดียวกัน
  // =====================================================
  // ใช้ sessionStorage แทน module-level variable เพราะ content script
  // อาจ reload เมื่อ URL เปลี่ยน
  function isSubmitted() {
    return sessionStorage.getItem('rh-pharma-gemini-submitted') === 'true';
  }
  function markSubmitted() {
    sessionStorage.setItem('rh-pharma-gemini-submitted', 'true');
  }
  function clearSubmittedAfterDelay() {
    // หลัง 60 วินาที clear flag เพื่อให้สามารถใช้แท็บนี้ submit รอบใหม่ได้
    setTimeout(() => sessionStorage.removeItem('rh-pharma-gemini-submitted'), 60000);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // =====================================================
  // หา clickable element by text content
  // =====================================================
  function findClickable(targetText, options = {}) {
    const { exact = false } = options;
    const elements = document.querySelectorAll(
      'button, [role="button"], [role="menuitem"], [role="option"], a, div[tabindex]'
    );
    const target = targetText.toLowerCase();

    for (const el of elements) {
      if (el.offsetParent === null) continue;
      const text = el.textContent.trim().toLowerCase();
      const matches = exact ? (text === target) : text.includes(target);
      if (matches && text.length < 100) {
        return el;
      }
    }
    return null;
  }

  // =====================================================
  // Step 1: คลิก Create image/video chip
  // =====================================================
  async function selectCreateMode(mode) {
    const chipText = mode === 'video' ? 'create a video' : 'create image';
    let chip = findClickable(chipText);
    if (chip) {
      console.log(`[RH Pharma Gemini] คลิก chip: ${chipText}`);
      chip.click();
      await sleep(900);
      return true;
    }
    // Fallback: ผ่าน Tools menu
    const toolsBtn = findClickable('tools', { exact: true });
    if (toolsBtn) {
      toolsBtn.click();
      await sleep(600);
      const target = mode === 'video' ? 'create video' : 'create image';
      const menuItem = findClickable(target);
      if (menuItem) {
        menuItem.click();
        await sleep(800);
        return true;
      }
      document.body.click();
    }
    return false;
  }

  // =====================================================
  // Step 1.5: ข้าม "Pick a style for your image" screen
  // (เราจะกำหนด style ใน prompt เอง — ไม่กดเลือก preset)
  // =====================================================
  async function skipStyleSelection(maxWait = 4000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      // หา heading "Pick a style for your image"
      const headings = document.querySelectorAll('h1, h2, h3, [role="heading"]');
      let found = false;
      for (const h of headings) {
        const text = h.textContent.trim().toLowerCase();
        if (text.includes('pick a style') || text.includes('style for your image')) {
          found = true;
          break;
        }
      }

      // ถ้าเจอหน้า Pick a style → หา input "Describe your image" แทน
      // (input จะโผล่อยู่ด้านล่างพร้อมกับ style cards)
      // เราจะข้ามไป paste prompt ที่ input นี้เลย โดยไม่กด style card
      if (found) {
        console.log('[RH Pharma Gemini] เจอหน้า Pick a style — จะข้ามไปใส่ prompt เอง');
        return true; // ทำต่อได้เลย เพราะ findPromptInput จะหา input ให้
      }

      await sleep(300);
    }
    return false; // ไม่เจอหน้า style → ทำต่อปกติ
  }

  // =====================================================
  // เลือกโหมด "สร้างวิดีโอ" จาก Tools menu
  // (ใช้สำหรับ autopilot — บังคับเป็นโหมดวิดีโอเสมอ)
  // =====================================================
  async function selectVideoCreateMode() {
    // === วิธีที่ 1: คลิก chip "Create a video" บนหน้าหลัก (ถ้ามี) ===
    let chip = findClickable('สร้างวิดีโอ', { exact: false });
    if (!chip) chip = findClickable('create a video', { exact: false });
    if (!chip) chip = findClickable('create video', { exact: false });

    if (chip && chip.offsetWidth < 300) {
      console.log('[RH Pharma Gemini] คลิก chip สร้างวิดีโอ');
      chip.click();
      await sleep(900);
      return true;
    }

    // === วิธีที่ 2: ผ่านเมนู Tools (เครื่องมือ) ===
    let toolsBtn = findClickable('เครื่องมือ', { exact: true });
    if (!toolsBtn) toolsBtn = findClickable('tools', { exact: true });

    if (toolsBtn) {
      console.log('[RH Pharma Gemini] เปิดเมนู Tools');
      toolsBtn.click();
      await sleep(700);

      // หา menu item "สร้างวิดีโอ" หรือ "Create video"
      let videoOption = findClickable('สร้างวิดีโอ');
      if (!videoOption) videoOption = findClickable('create video');
      if (!videoOption) videoOption = findClickable('create a video');

      if (videoOption) {
        console.log('[RH Pharma Gemini] คลิก สร้างวิดีโอ ในเมนู');
        videoOption.click();
        await sleep(900);
        return true;
      }
      document.body.click(); // ปิดเมนู
    }

    console.warn('[RH Pharma Gemini] หา "สร้างวิดีโอ" ไม่เจอ');
    return false;
  }

  // =====================================================
  // รอ Veo สร้างวิดีโอเสร็จ — ตรวจจาก <video> element ที่โผล่ในหน้า
  // (รอจริงๆ — ช้าแต่ชัวร์ตามที่พี่เลือก)
  // =====================================================
  async function waitForVeoComplete(maxWait = 240000) { // 4 นาที
    const start = Date.now();
    let lastVideoCount = 0;

    // นับจำนวน video element ตอนเริ่มต้น (ก่อน Veo สร้างใหม่)
    const initialVideos = document.querySelectorAll('video').length;
    console.log(`[RH Pharma Gemini] รอ Veo สร้างเสร็จ — มี video เดิม ${initialVideos} ตัว`);

    while (Date.now() - start < maxWait) {
      const videos = document.querySelectorAll('video');
      const visibleVideos = Array.from(videos).filter(v => {
        if (v.offsetParent === null) return false;
        // video ต้องมีขนาดจริง + มี src แล้ว (ไม่ใช่ placeholder)
        return v.offsetWidth > 100 && v.offsetHeight > 100 && (v.src || v.querySelector('source'));
      });

      // มี video ใหม่เพิ่มขึ้น = Veo สร้างเสร็จ
      if (visibleVideos.length > initialVideos) {
        console.log(`[RH Pharma Gemini] เจอ video ใหม่ — Veo สร้างเสร็จ! (${visibleVideos.length} ตัว)`);
        // รออีก 2 วิ ให้ video render เสร็จสมบูรณ์
        await sleep(2000);
        return true;
      }

      // เช็คทุก 3 วิ
      if (Math.floor((Date.now() - start) / 3000) !== lastVideoCount) {
        lastVideoCount = Math.floor((Date.now() - start) / 3000);
        const elapsed = Math.floor((Date.now() - start) / 1000);
        console.log(`[RH Pharma Gemini] รอ Veo... ${elapsed}s / ${maxWait/1000}s`);
      }

      await sleep(3000);
    }

    console.warn('[RH Pharma Gemini] timeout รอ Veo — ทำต่อไป');
    return false;
  }

  // =====================================================
  // เคลียร์ context — เปิด chat ใหม่ก่อนเริ่ม scene ถัดไป
  // (ป้องกัน Gemini สับสนว่าเป็น turn ต่อเนื่องจาก scene ก่อน)
  // =====================================================
  async function startNewChat() {
    // หาปุ่ม "New chat" / "แชทใหม่" / "+"
    const newChatSelectors = [
      'button[aria-label*="แชทใหม่" i]',
      'button[aria-label*="new chat" i]',
      'a[aria-label*="แชทใหม่" i]',
      'a[aria-label*="new chat" i]',
      '[data-test-id="new-chat-button"]'
    ];

    for (const sel of newChatSelectors) {
      const btn = document.querySelector(sel);
      if (btn && btn.offsetParent !== null) {
        console.log('[RH Pharma Gemini] คลิก New Chat:', sel);
        btn.click();
        await sleep(1500);
        return true;
      }
    }

    // Fallback: หาปุ่มที่มีไอคอน edit/pencil ใน sidebar
    const editButtons = document.querySelectorAll('button, a');
    for (const btn of editButtons) {
      if (btn.offsetParent === null) continue;
      const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
      if (ariaLabel.includes('แชทใหม่') || ariaLabel.includes('new chat') ||
          ariaLabel.includes('start new')) {
        console.log('[RH Pharma Gemini] คลิก New Chat (fallback):', ariaLabel);
        btn.click();
        await sleep(1500);
        return true;
      }
    }

    console.warn('[RH Pharma Gemini] หา New Chat button ไม่เจอ');
    return false;
  }

  // =====================================================
  // AUTOPILOT: ทำงานทั้ง 4 scenes อัตโนมัติ
  // ลำดับ: clear context → video mode → upload → paste → submit → wait Veo → next
  // =====================================================
  async function runAutopilot(autopilotData) {
    const { characterLock, scenes, images } = autopilotData;
    const totalScenes = scenes.length;

    showGeminiToast(`🚀 เริ่ม Autopilot — ${totalScenes} scenes`, 'info');
    await sleep(2000);

    for (let i = 0; i < totalScenes; i++) {
      const sceneNum = i + 1;
      const sceneText = scenes[i];

      if (!sceneText) {
        console.warn(`[Autopilot] Scene ${sceneNum} ว่าง — skip`);
        continue;
      }

      showGeminiToast(`🎬 Scene ${sceneNum}/${totalScenes} — เริ่ม`, 'info');

      // === ขั้น 1: เคลียร์ context (ยกเว้น scene แรก ใช้แชทปัจจุบัน) ===
      if (i > 0) {
        showGeminiToast(`🔄 Scene ${sceneNum}/${totalScenes} — เปิดแชทใหม่`, 'info');
        await startNewChat();
        await sleep(2500); // รอแชทใหม่โหลด
      }

      // === ขั้น 2: เลือกโหมดสร้างวิดีโอ ===
      showGeminiToast(`📋 Scene ${sceneNum}/${totalScenes} — เลือกโหมดวิดีโอ`, 'info');
      await selectVideoCreateMode();
      await sleep(1200);

      // === ขั้น 3: ข้ามหน้า Pick a style ถ้ามี ===
      await skipStyleSelection(2000);

      // === ขั้น 4: อัปโหลดรูปนายแบบ (lock ตัวละคร) ===
      if (images && images.length > 0) {
        showGeminiToast(`📷 Scene ${sceneNum}/${totalScenes} — อัปโหลดรูปนายแบบ`, 'info');
        const uploadOk = await uploadImages(images);
        if (uploadOk) {
          await waitForImagePreview(images.length, 12000);
          await sleep(1500);
        }
      }

      // === ขั้น 5: ประกอบ prompt = CHARACTER LOCK + SCENE n + คำสั่งย้ำ ===
      const fullPrompt = `${characterLock}

Now create only this single 8-second clip:

${sceneText}

IMPORTANT: Generate ONLY this one 8-second scene. Maintain the exact character appearance from CHARACTER LOCK above. Use the reference image provided.`;

      // === ขั้น 6: Paste prompt ===
      showGeminiToast(`📝 Scene ${sceneNum}/${totalScenes} — ใส่ prompt`, 'info');
      let pasteOk = false;
      let attempts = 0;
      while (!pasteOk && attempts < 6) {
        attempts++;
        pasteOk = await pastePromptOnce(fullPrompt);
        if (!pasteOk) await sleep(800);
      }

      if (!pasteOk) {
        showGeminiToast(`❌ Scene ${sceneNum} — ใส่ prompt ไม่ได้`, 'error');
        continue;
      }
      await sleep(1500);

      // === ขั้น 7: Submit ===
      // เคลียร์ submitted flag เพื่อให้ submit รอบใหม่ได้
      sessionStorage.removeItem('rh-pharma-gemini-submitted');
      showGeminiToast(`🚀 Scene ${sceneNum}/${totalScenes} — ส่งให้ Veo`, 'info');
      const submitted = await clickSubmitOnce();

      if (!submitted) {
        showGeminiToast(`❌ Scene ${sceneNum} — ส่งไม่ได้`, 'error');
        continue;
      }

      // === ขั้น 8: รอ Veo สร้างเสร็จ ===
      showGeminiToast(`⏳ Scene ${sceneNum}/${totalScenes} — รอ Veo สร้าง (อาจใช้เวลา 1-3 นาที)`, 'info');
      const completed = await waitForVeoComplete(240000); // 4 นาที

      if (completed) {
        showGeminiToast(`✅ Scene ${sceneNum}/${totalScenes} — สร้างเสร็จ!`, 'success');
      } else {
        showGeminiToast(`⚠️ Scene ${sceneNum}/${totalScenes} — timeout (อาจยังไม่เสร็จ)`, 'info');
      }

      await sleep(2000); // breathing room
    }

    showGeminiToast(`🎉 เสร็จทุก ${totalScenes} scenes! ดาวน์โหลดได้ในแต่ละแชท`, 'success');
  }

  // =====================================================
  // Step 2: เลือก Thinking model
  // =====================================================
  async function selectThinkingModel() {
    // หาปุ่ม dropdown ของ model — อาจเป็น Fast / Pro / Thinking อยู่แล้ว
    const buttons = document.querySelectorAll('button');
    let dropdown = null;
    let currentModel = '';

    for (const btn of buttons) {
      if (btn.offsetParent === null) continue;
      const text = btn.textContent.trim();
      // ตรวจหา dropdown ของ model — ปุ่มสั้นๆ ที่มีคำว่า Fast/Pro/Thinking
      if ((text === 'Fast' || text === 'Pro' || text === 'Thinking') && text.length < 20) {
        dropdown = btn;
        currentModel = text;
        break;
      }
    }

    // ถ้าเป็น Thinking อยู่แล้ว → ไม่ต้องสลับ
    if (currentModel === 'Thinking') {
      console.log('[RH Pharma Gemini] เป็น Thinking อยู่แล้ว — skip');
      return true;
    }

    // ถ้าหา dropdown ไม่เจอ → อาจเป็น Thinking โดย default
    if (!dropdown) {
      console.log('[RH Pharma Gemini] หา model dropdown ไม่เจอ — สมมติเป็น Thinking');
      return true;
    }

    // สลับเป็น Thinking
    console.log(`[RH Pharma Gemini] สลับ ${currentModel} → Thinking`);
    dropdown.click();
    await sleep(500);
    const thinkingOption = findClickable('thinking');
    if (thinkingOption) {
      thinkingOption.click();
      await sleep(400);
      return true;
    }
    document.body.click();
    return false;
  }

  // =====================================================
  // Step 3: อัปโหลดรูปประกอบ — ผ่านปุ่ม "+"
  // =====================================================
  async function uploadImages(dataUrls) {
    if (!dataUrls || dataUrls.length === 0) return false;
    console.log(`[RH Pharma Gemini] อัปโหลด ${dataUrls.length} รูป`);

    // แปลง dataUrls → Blob
    const blobs = await Promise.all(
      dataUrls.map(async (dataUrl) => {
        const res = await fetch(dataUrl);
        return await res.blob();
      })
    );

    // === Strategy 1: paste ทีละรูป ผ่าน clipboard + file input ===
    // ต้องทำทีละรูปเพราะ Gemini รับ paste event ทีละครั้ง
    let successCount = 0;

    for (let i = 0; i < blobs.length; i++) {
      const blob = blobs[i];
      showGeminiToast(`📷 แนบรูป ${i + 1}/${blobs.length}...`, 'info');

      // หา file input ก่อน — inject ตรงเลย (เร็วสุด)
      const allFi = document.querySelectorAll('input[type="file"]');
      let injected = false;
      for (const fi of allFi) {
        try {
          const dt = new DataTransfer();
          const ext = (blob.type.split('/')[1] || 'png').split(';')[0];
          dt.items.add(new File([blob], `ref-${i}.${ext}`, { type: blob.type }));
          fi.files = dt.files;
          fi.dispatchEvent(new Event('change', { bubbles: true }));
          injected = true;
          successCount++;
          console.log(`[RH Pharma Gemini] inject file input รูป ${i+1} ✅`);
          break;
        } catch (e) { /* ลองต่อ */ }
      }

      if (!injected) {
        // clipboard paste fallback
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
          ]);
          await sleep(300);

          const inputEl = findPromptInput()
            || document.querySelector('[contenteditable="true"]')
            || document.querySelector('[role="textbox"]');

          if (inputEl) { inputEl.focus(); await sleep(200); }

          const dt2 = new DataTransfer();
          const ext2 = (blob.type.split('/')[1] || 'png').split(';')[0];
          dt2.items.add(new File([blob], `ref-${i}.${ext2}`, { type: blob.type }));

          const pasteEv = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: dt2
          });
          (inputEl || document.body).dispatchEvent(pasteEv);
          await sleep(300);
          document.execCommand('paste');

          successCount++;
          console.log(`[RH Pharma Gemini] clipboard paste รูป ${i+1} ✅`);
        } catch (err) {
          console.warn(`[RH Pharma Gemini] รูป ${i+1} ล้มเหลว:`, err.message);
          // เปิดเมนู + เพื่อให้ผู้ใช้แนบเอง
          await uploadViaMenu(blob, i);
        }
      }

      // รอให้ Gemini ประมวลผลก่อนรูปถัดไป
      if (i < blobs.length - 1) await sleep(1200);
    }

    console.log(`[RH Pharma Gemini] อัปโหลดสำเร็จ ${successCount}/${blobs.length} รูป`);
    return successCount > 0;
  }

  // Fallback: กด + → อัปโหลดไฟล์ → inject file input
  async function uploadViaMenu(blob, index) {
    const plusBtn = Array.from(document.querySelectorAll('button')).find(btn => {
      if (btn.offsetParent === null) return false;
      const txt = btn.textContent.trim();
      const label = (btn.getAttribute('aria-label') || '').toLowerCase();
      return txt === '+' || label.includes('plus') || label.includes('attach') || label.includes('add');
    });

    if (!plusBtn) return false;

    plusBtn.click();
    await sleep(700);

    // หา "อัปโหลดไฟล์" ทั้งไทยและอังกฤษ
    const keywords = ['อัปโหลดไฟล์', 'อัปโหลด', 'upload files', 'upload', 'ไฟล์'];
    let uploadBtn = null;
    for (const kw of keywords) {
      uploadBtn = findClickable(kw);
      if (uploadBtn) break;
    }

    if (!uploadBtn) { document.body.click(); return false; }

    // inject file ก่อนคลิก
    const fi = document.querySelector('input[type="file"]');
    if (fi) {
      try {
        const dt = new DataTransfer();
        const ext = (blob.type.split('/')[1] || 'png').split(';')[0];
        dt.items.add(new File([blob], `rh-pharma-ref-${index}.${ext}`, { type: blob.type }));
        fi.files = dt.files;
        fi.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[RH Pharma Gemini] upload via menu ✅');
        return true;
      } catch (e) { /* ล้มเหลว */ }
    }

    uploadBtn.click();
    await sleep(500);

    const fi2 = document.querySelector('input[type="file"]');
    if (fi2) {
      try {
        const dt = new DataTransfer();
        const ext = (blob.type.split('/')[1] || 'png').split(';')[0];
        dt.items.add(new File([blob], `rh-pharma-ref-${index}.${ext}`, { type: blob.type }));
        fi2.files = dt.files;
        fi2.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } catch (e) { return false; }
    }
    return false;
  }

  // =====================================================
  // ตรวจสอบว่ารูปอัปโหลดเสร็จแล้วหรือยัง (ดู preview)
  // =====================================================
  async function waitForImagePreview(expectedCount, maxWait = 15000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      // หา image preview elements
      const previews = document.querySelectorAll(
        'img[src^="blob:"], img[src^="data:"], [aria-label*="thumbnail" i], [aria-label*="preview" i]'
      );
      // กรอง images ที่อยู่ใน prompt area (ไม่ใช่ avatar/logo)
      const visiblePreviews = Array.from(previews).filter(img => {
        if (img.offsetParent === null) return false;
        // skip avatar/logo (มัก < 50px)
        return img.offsetWidth > 50 && img.offsetHeight > 50;
      });

      if (visiblePreviews.length >= expectedCount) {
        console.log(`[RH Pharma Gemini] เจอ image preview ${visiblePreviews.length} รูป`);
        return true;
      }
      await sleep(500);
    }
    console.warn('[RH Pharma Gemini] รอ image preview ไม่เจอ — ทำต่อไป');
    return false;
  }

  // =====================================================
  // Step 4: หา + paste prompt (ครั้งเดียว!)
  // =====================================================
  function findPromptInput() {
    const selectors = [
      'rich-textarea div[contenteditable="true"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"][aria-label*="Ask" i]',
      'div[contenteditable="true"][aria-label*="prompt" i]',
      'textarea[placeholder*="Ask" i]',
      'textarea[aria-label*="prompt" i]',
      'div[contenteditable="true"]'
    ];
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        if (el.offsetParent !== null && el.offsetWidth > 100) {
          return el;
        }
      }
    }
    return null;
  }

  async function pastePromptOnce(text) {
    const input = findPromptInput();
    if (!input) return false;

    // เช็คว่ามี prompt อยู่แล้ว → skip
    const currentText = (input.value || input.textContent || '').trim();
    if (currentText.length > 50 && currentText.includes(text.slice(0, 30))) {
      console.log('[RH Pharma Gemini] prompt อยู่แล้ว — skip');
      return true;
    }

    input.focus();
    input.click();
    await sleep(200);

    if (input.tagName === 'TEXTAREA') {
      const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      valueSetter.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(50);
      valueSetter.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (input.contentEditable === 'true') {
      input.focus();
      // เคลียร์
      const range = document.createRange();
      range.selectNodeContents(input);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('delete', false);
      await sleep(50);

      const ok = document.execCommand('insertText', false, text);
      if (!ok) {
        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        input.dispatchEvent(new ClipboardEvent('paste', {
          bubbles: true, cancelable: true, clipboardData: dt
        }));
      }
    }

    await sleep(500);
    const result = (input.value || input.textContent || '');
    return result.includes(text.slice(0, 30));
  }

  // =====================================================
  // Step 5: คลิก Submit (ครั้งเดียวเท่านั้น!)
  // =====================================================
  async function clickSubmitOnce() {
    if (isSubmitted()) {
      console.log('[RH Pharma Gemini] Submit ไปแล้ว — skip');
      return false;
    }

    const input = findPromptInput();
    if (input) {
      let parent = input.parentElement;
      for (let i = 0; i < 8 && parent; i++) {
        const buttons = parent.querySelectorAll('button');
        for (const btn of buttons) {
          const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
          if ((ariaLabel.includes('submit') || ariaLabel.includes('send')) &&
              !btn.disabled && btn.offsetParent !== null) {
            console.log('[RH Pharma Gemini] คลิก Submit:', ariaLabel);
            btn.click();
            markSubmitted();
            clearSubmittedAfterDelay();
            return true;
          }
        }
        parent = parent.parentElement;
      }
    }

    const candidates = document.querySelectorAll(
      'button[aria-label*="submit" i], button[aria-label*="send" i], button[type="submit"]'
    );
    for (const btn of candidates) {
      if (!btn.disabled && btn.offsetParent !== null) {
        btn.click();
        markSubmitted();
        clearSubmittedAfterDelay();
        return true;
      }
    }

    console.warn('[RH Pharma Gemini] หาปุ่ม Submit ไม่เจอ');
    return false;
  }

  // =====================================================
  // Toast บนหน้า Gemini
  // =====================================================
  function showGeminiToast(message, type = 'info') {
    const existing = document.getElementById('rh-gemini-toast');
    if (existing) existing.remove();

    const colors = {
      success: '#10B981',
      error: '#EF4444',
      info: 'linear-gradient(135deg, #4A8FB5, #8B5CF6)'
    };

    const toast = document.createElement('div');
    toast.id = 'rh-gemini-toast';
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 18px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      font-family: 'Sarabun', -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 600;
      z-index: 2147483647;
      max-width: 320px;
    `;
    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size: 20px;">🩺</span>
        <div>
          <div>RH Pharma</div>
          <div style="font-weight:normal; font-size:11px; opacity:0.95; margin-top:2px;">${escapeHtml(message)}</div>
        </div>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s';
      toast.style.transform = 'translateX(400px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // =====================================================
  // กระบวนการหลัก — ลำดับสำคัญ!
  // 1. chip → 2. thinking → 3. UPLOAD → 4. รอ preview → 5. PASTE → 6. SUBMIT (ครั้งเดียว)
  // =====================================================
  let processing = false;

  async function processPending() {
    if (processing) {
      console.log('[RH Pharma Gemini] กำลังประมวลผลอยู่ — skip');
      return;
    }
    if (isSubmitted()) {
      console.log('[RH Pharma Gemini] submit ไปแล้วในแท็บนี้ — skip');
      return;
    }

    processing = true;

    try {
      const data = await chrome.storage.local.get(['rhPharmaGeminiPending']);
      const pending = data.rhPharmaGeminiPending;

      if (!pending || !pending.prompt) {
        console.log('[RH Pharma Gemini] ไม่มี pending data');
        return;
      }

      // ลบทันที — ป้องกันทำซ้ำ
      await chrome.storage.local.remove(['rhPharmaGeminiPending']);

      console.log('[RH Pharma Gemini] เริ่มประมวลผล:', {
        mode: pending.mode,
        promptLength: pending.prompt.length,
        images: pending.images?.length || 0
      });

      await sleep(2000); // รอ Gemini โหลดเสร็จ

      showGeminiToast('🖼️ กำลังตั้งค่า สร้างรูปภาพ...', 'info');

      // === Step 1: กด "สร้างรูปภาพ" ===
      await selectCreateMode('image');
      await sleep(1200);

      // === Step 2: ข้าม "Pick a style" — ไม่ต้องกดอะไร ===
      await skipStyleSelection(2000);

      // === Step 3: อัปโหลดรูป (นายแบบ + ยา) ===
      if (pending.images && pending.images.length > 0) {
        showGeminiToast(`📷 อัปโหลด ${pending.images.length} รูป...`, 'info');
        const uploadOk = await uploadImages(pending.images);
        if (uploadOk) {
          showGeminiToast('⏳ รอรูปขึ้น preview...', 'info');
          await waitForImagePreview(pending.images.length, 15000);
          showGeminiToast('✅ รูปพร้อมแล้ว', 'success');
          await sleep(1500); // รอให้ Gemini ประมวลผลรูปทั้งหมดก่อน paste
        } else {
          showGeminiToast('⚠️ อัปโหลดไม่สำเร็จ — ทำต่อไป', 'info');
        }
      }

      // === Step 4: Paste prompt ===
      showGeminiToast('📝 ใส่ prompt...', 'info');
      let pasteOk = false;
      let attempts = 0;
      while (!pasteOk && attempts < 8) {
        attempts++;
        pasteOk = await pastePromptOnce(pending.prompt);
        if (!pasteOk) await sleep(700);
      }

      if (!pasteOk) {
        try {
          await navigator.clipboard.writeText(pending.prompt);
          showGeminiToast('📋 คัดลอก prompt แล้ว — กด Ctrl+V เอง', 'info');
        } catch (e) {
          showGeminiToast('❌ ใส่ prompt ไม่ได้', 'error');
        }
        return;
      }

      showGeminiToast('✅ ใส่ prompt แล้ว', 'success');
      await sleep(1000);

      // === Step 5: กดปุ่มจรวด Submit ===
      if (pending.autoSubmit !== false) {
        const submitted = await clickSubmitOnce();
        if (submitted) {
          showGeminiToast('🚀 ส่งแล้ว — รอ Gemini สร้างรูป!', 'success');
        } else {
          showGeminiToast('⚠️ พร้อมแล้ว — กดปุ่มจรวดเอง', 'info');
        }
      } else {
        showGeminiToast('✅ พร้อม — กดปุ่มจรวดเอง', 'success');
      }

    } catch (err) {
      console.error('[RH Pharma Gemini] error:', err);
      showGeminiToast('❌ ' + err.message, 'error');
    } finally {
      processing = false;
    }
  }

  // =====================================================
  // เริ่มทำงาน
  // =====================================================
  async function start() {
    await sleep(2000);

    // เช็ค autopilot data ก่อน — ถ้ามี ให้ทำงาน autopilot
    const data = await chrome.storage.local.get(['rhPharmaAutopilot']);
    if (data.rhPharmaAutopilot) {
      console.log('[RH Pharma Gemini] เจอ autopilot data — เริ่มทำงาน');
      await chrome.storage.local.remove(['rhPharmaAutopilot']);
      sessionStorage.removeItem('rh-pharma-gemini-submitted');
      await runAutopilot(data.rhPharmaAutopilot);
      return;
    }

    // ปกติ — ทำงานแบบ pending เดียว
    await processPending();
  }

  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start);
  }

  // ฟัง message จาก Side Panel
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'geminiProcessPending') {
      // เคลียร์ submitted flag เพื่อให้ submit รอบใหม่ได้
      sessionStorage.removeItem('rh-pharma-gemini-submitted');
      processPending().then(() => sendResponse({ success: true }));
      return true;
    }

    // === AUTOPILOT MODE — ทำงาน 4 scenes อัตโนมัติ ===
    if (msg.action === 'geminiAutopilot') {
      sessionStorage.removeItem('rh-pharma-gemini-submitted');

      chrome.storage.local.get(['rhPharmaAutopilot']).then(data => {
        const autopilotData = data.rhPharmaAutopilot;
        if (!autopilotData) {
          sendResponse({ success: false, error: 'ไม่มี autopilot data' });
          return;
        }
        // ลบทันทีเพื่อกัน trigger ซ้ำ
        chrome.storage.local.remove(['rhPharmaAutopilot']);
        runAutopilot(autopilotData)
          .then(() => sendResponse({ success: true }))
          .catch(err => sendResponse({ success: false, error: err.message }));
      });
      return true;
    }
  });

  console.log('[RH Pharma Gemini] พร้อมรับคำสั่ง v3');
})();
