// =====================================================
// RH Pharma — Toolbox (v0.10.0)
// =====================================================
// Integration layer — รวมโมดูลใหม่เข้ากับ workflow โพสต์สื่อสุขภาพ
// ใช้จาก sidepanel.js หรือเรียกตรงจาก console:
//   RHToolbox.publishFlow({ blob, caption, ... })
//   RHToolbox.validateBeforePost(caption)
//   RHToolbox.injectStandardFooter(caption, category)
// =====================================================

const RHToolbox = (() => {

  async function getSettings() {
    const data = await chrome.storage.local.get(['rhPharmaSettings']);
    return data.rhPharmaSettings || {};
  }

  // ===== STEP 1: เตรียม caption ที่ "ปลอดภัยและถูกต้อง" =====
  // 1. ตรวจคำต้องห้าม
  // 2. ถ้ามี BLOCK → ขอ AI rewrite
  // 3. แทรก disclaimer + branding
  async function preparePost({ caption, category, language = 'th', allowAutoFix = true }) {
    const settings = await getSettings();
    const result = { ok: false, finalCaption: '', issues: [], rewrite: null };

    if (!caption || !caption.trim()) {
      throw new Error('ไม่มี caption');
    }

    // 1. validate
    let workingText = caption;
    if (settings.contentValidator !== false && window.ContentValidator) {
      const v = window.ContentValidator.validate(workingText);
      result.issues = v.issues;

      if (!v.canPost && allowAutoFix && window.RHAI) {
        // มี BLOCK — ขอ AI rewrite
        try {
          workingText = await window.ContentValidator.suggestRewrite(workingText, v.issues);
          result.rewrite = workingText;
          // recheck
          const v2 = window.ContentValidator.validate(workingText);
          if (!v2.canPost) {
            throw new Error('AI แก้ไขแล้วยังพบคำต้องห้าม: ' + v2.issues.map(i => i.word).join(', '));
          }
        } catch (err) {
          throw new Error('Validator block: ' + err.message);
        }
      } else if (!v.canPost) {
        throw new Error('พบคำต้องห้าม: ' + v.issues.filter(i => i.level === 'BLOCK').map(i => i.word).join(', '));
      }
    }

    // 2. detect category อัตโนมัติ ถ้าไม่ระบุ
    const cat = category
      || (window.DisclaimerInjector ? window.DisclaimerInjector.detectCategory(workingText) : 'general');

    // 3. แทรก disclaimer + branding
    if (window.DisclaimerInjector) {
      workingText = window.DisclaimerInjector.inject(workingText, {
        language,
        category: cat,
        settings,
        includeBranding: settings.autoBranding !== false,
        includeDisclaimer: settings.autoDisclaimer !== false
      });
    }

    result.ok = true;
    result.finalCaption = workingText;
    result.category = cat;
    return result;
  }

  // ===== STEP 2: บันทึกลงคลัง =====
  async function saveToWarehouse({ blob, caption, finalCaption, mediaType, audience, language, topicTitle, target, source, meta }) {
    if (!window.ClipWarehouse) throw new Error('ClipWarehouse not loaded');
    return window.ClipWarehouse.addItem({
      topicTitle: topicTitle || (caption || '').slice(0, 60),
      audience,
      language,
      mediaType,
      blob,
      caption: finalCaption || caption,
      target: target || 'manual',
      source: source || 'manual',
      status: 'waiting',
      meta: meta || {}
    });
  }

  // ===== STEP 3: ส่งโพสต์ผ่าน background → content script =====
  async function publishToFacebook(itemId, opts = {}) {
    if (!window.ClipWarehouse) throw new Error('ClipWarehouse not loaded');
    const item = await window.ClipWarehouse.getItem(itemId);
    if (!item) throw new Error('ไม่พบรายการ id=' + itemId);

    const blob = item.blob;
    const arrayBuf = await blob.arrayBuffer();
    const result = await chrome.runtime.sendMessage({
      action: 'postToFacebookViaTab',
      blob: arrayBuf,
      mimeType: item.mimeType,
      filename: `rh-pharma-${itemId}.${guessExt(item.mimeType)}`,
      caption: item.caption,
      requireApproval: opts.requireApproval ?? true
    });

    if (result?.success) {
      await window.ClipWarehouse.setStatus(itemId, 'posted');
    } else if (result?.canceled) {
      await window.ClipWarehouse.setStatus(itemId, 'approved');
    } else {
      await window.ClipWarehouse.setStatus(itemId, 'failed', { errorMessage: result?.error || 'unknown' });
    }
    return result;
  }

  async function publishToTikTok(itemId, opts = {}) {
    if (!window.ClipWarehouse) throw new Error('ClipWarehouse not loaded');
    const item = await window.ClipWarehouse.getItem(itemId);
    if (!item) throw new Error('ไม่พบรายการ id=' + itemId);
    if (item.mediaType !== 'video') throw new Error('TikTok รับเฉพาะวิดีโอ');

    const arrayBuf = await item.blob.arrayBuffer();
    const result = await chrome.runtime.sendMessage({
      action: 'postToTikTokViaTab',
      blob: arrayBuf,
      mimeType: item.mimeType,
      filename: `rh-pharma-${itemId}.mp4`,
      caption: item.caption,
      requireApproval: opts.requireApproval ?? true
    });
    if (result?.success) {
      await window.ClipWarehouse.setStatus(itemId, 'posted');
    } else if (!result?.canceled) {
      await window.ClipWarehouse.setStatus(itemId, 'failed', { errorMessage: result?.error || 'unknown' });
    }
    return result;
  }

  // ===== Full pipeline: validate → save → schedule (optional) =====
  async function publishFlow({ blob, caption, mediaType, audience, language, topicTitle, target = 'facebook', category, scheduleAt }) {
    // 1. prepare
    const prep = await preparePost({ caption, category, language });
    if (!prep.ok) throw new Error('prepare failed');

    // 2. save to warehouse
    const item = await saveToWarehouse({
      blob,
      caption,
      finalCaption: prep.finalCaption,
      mediaType,
      audience,
      language,
      topicTitle,
      target,
      source: 'pipeline'
    });

    // 3. schedule หรือ post ทันที
    if (scheduleAt) {
      if (!window.ScheduleQueue) throw new Error('ScheduleQueue not loaded');
      return window.ScheduleQueue.schedule({
        clipId: item.id,
        target,
        scheduledAt: scheduleAt,
        caption: prep.finalCaption
      });
    } else {
      // ทำ approval ทันที (default: ON)
      if (target === 'facebook') return publishToFacebook(item.id, { requireApproval: true });
      if (target === 'tiktok')   return publishToTikTok(item.id, { requireApproval: true });
      return item;
    }
  }

  // ===== Bulk publish series (ทยอยโพสต์ทุกวัน) =====
  async function publishSeriesAsCampaign({ series, startAt, intervalHours = 24, target = 'facebook' }) {
    if (!series || !series.episodes) throw new Error('ต้องระบุ series');
    if (!window.ClipWarehouse) throw new Error('ClipWarehouse not loaded');
    if (!window.ScheduleQueue) throw new Error('ScheduleQueue not loaded');

    const clipIds = [];
    const captions = [];

    for (let i = 0; i < series.episodes.length; i++) {
      const ep = series.episodes[i];
      // เนื้อหา ep.content เป็น JSON (cover_headline/body/takehome/next_tease)
      let captionText = '';
      try {
        const parsed = typeof ep.content === 'string' ? JSON.parse(ep.content) : ep.content;
        captionText = [
          parsed.cover_headline ? `🌟 ${parsed.cover_headline}` : '',
          parsed.body || '',
          parsed.takehome ? `\n💡 ${parsed.takehome}` : '',
          parsed.next_tease ? `\n👉 ${parsed.next_tease}` : ''
        ].filter(Boolean).join('\n');
      } catch {
        captionText = ep.content;
      }

      // prepare
      const prep = await preparePost({ caption: captionText, category: 'drug-knowledge', language: series.language || 'th' });

      // สร้าง placeholder blob (text-only post — ไม่มีรูป)
      const blob = new Blob([prep.finalCaption], { type: 'text/plain' });

      const item = await saveToWarehouse({
        blob,
        caption: captionText,
        finalCaption: prep.finalCaption,
        mediaType: 'text',
        audience: series.audience,
        language: series.language,
        topicTitle: `${series.title} — ตอน ${ep.day}`,
        target,
        source: 'series',
        meta: { seriesId: series.seriesId, episode: ep.day }
      });
      clipIds.push(item.id);
      captions.push(prep.finalCaption);
    }

    return window.ScheduleQueue.scheduleSeriesRecurring({
      clipIds,
      target,
      startAt,
      intervalHours,
      seriesId: series.seriesId,
      captionsPerEpisode: captions
    });
  }

  function guessExt(mimeType) {
    if (!mimeType) return 'bin';
    if (mimeType.startsWith('image/png')) return 'png';
    if (mimeType.startsWith('image/jpeg')) return 'jpg';
    if (mimeType.startsWith('image/webp')) return 'webp';
    if (mimeType.startsWith('video/mp4')) return 'mp4';
    if (mimeType.startsWith('video/webm')) return 'webm';
    if (mimeType.startsWith('audio/mpeg')) return 'mp3';
    if (mimeType.startsWith('audio/wav')) return 'wav';
    return 'bin';
  }

  // ===== Quick test สำหรับเภสัชกร =====
  async function quickTest() {
    console.group('🧪 RHToolbox quickTest');
    console.log('1. ClipWarehouse:', !!window.ClipWarehouse);
    console.log('2. ContentValidator:', !!window.ContentValidator);
    console.log('3. DisclaimerInjector:', !!window.DisclaimerInjector);
    console.log('4. PharmaPromptLibrary:', !!window.PharmaPromptLibrary);
    console.log('5. CoverTextStyles:', !!window.CoverTextStyles);
    console.log('6. StorySeries:', !!window.StorySeries);
    console.log('7. ScheduleQueue:', !!window.ScheduleQueue);
    console.log('8. PodcastGenerator:', !!window.PodcastGenerator);
    console.log('9. HumanizeDelay:', !!window.HumanizeDelay);
    if (window.ClipWarehouse) {
      const stats = await window.ClipWarehouse.getStats();
      console.log('Warehouse stats:', stats);
    }
    if (window.ContentValidator) {
      const test = window.ContentValidator.validate('ยานี้รักษาให้หายขาด ปลอดภัย 100% ไม่มีผลข้างเคียง');
      console.log('Validator test:', test.summary, '— issues:', test.issues.length);
    }
    console.groupEnd();
  }

  return {
    preparePost,
    saveToWarehouse,
    publishToFacebook,
    publishToTikTok,
    publishFlow,
    publishSeriesAsCampaign,
    quickTest,
    guessExt
  };
})();

window.RHToolbox = RHToolbox;
console.log('[RHToolbox] loaded — ใช้งานผ่าน RHToolbox.* หรือเรียก quickTest()');

// auto self-test เมื่อ side panel เปิด
setTimeout(() => {
  if (window.RHToolbox) {
    Promise.resolve(window.RHToolbox.quickTest()).catch(e => console.warn('[RHToolbox] quickTest:', e));
  }
}, 1000);
