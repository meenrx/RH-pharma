// =====================================================
// RH Pharma — Schedule Queue (v0.10.0)
// =====================================================
// คิวตารางโพสต์สื่อสุขภาพล่วงหน้า
// ใช้ chrome.alarms ตั้งเวลาให้ service-worker ปลุก
// เหมาะกับ:
//   - โพสต์รายวัน 9:00 น. ของสื่อชุด (series)
//   - แคมเปญรณรงค์ที่ปล่อยตามตาราง
//   - เนื้อหา reminder ตามฤดูกาล (ไข้หวัดใหญ่ ฤดูฝน)
// =====================================================

const ScheduleQueue = (() => {
  const ALARM_PREFIX = 'rh-pharma-post-';
  const STORAGE_KEY = 'rhPharmaScheduledPosts';

  // ===== สร้างรายการคิว =====
  async function schedule(item) {
    const {
      clipId,            // id ของ Clip Warehouse
      target,            // 'facebook' | 'tiktok' | 'manual'
      scheduledAt,       // ISO string
      caption,
      seriesId,          // ถ้าเป็นซีรีส์
      episodeIndex,      // ตอนที่
      hospitalContext
    } = item;

    if (!clipId) throw new Error('ต้องระบุ clipId');
    if (!scheduledAt) throw new Error('ต้องระบุเวลา scheduledAt');
    const fireAt = new Date(scheduledAt).getTime();
    if (fireAt < Date.now() + 60_000) {
      throw new Error('เวลาต้องอย่างน้อย 1 นาทีจากตอนนี้');
    }

    const queueId = `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry = {
      queueId,
      clipId,
      target: target || 'facebook',
      scheduledAt,
      caption: caption || '',
      seriesId: seriesId || null,
      episodeIndex: episodeIndex ?? null,
      hospitalContext: hospitalContext || '',
      status: 'scheduled',  // scheduled | fired | posted | failed | canceled
      attempts: 0,
      lastError: null,
      createdAt: new Date().toISOString()
    };

    // บันทึก
    const all = await loadAll();
    all.push(entry);
    await chrome.storage.local.set({ [STORAGE_KEY]: all });

    // ตั้ง alarm
    await chrome.alarms.create(ALARM_PREFIX + queueId, { when: fireAt });

    // อัปเดต status ของ clip
    if (window.ClipWarehouse) {
      try {
        await window.ClipWarehouse.setStatus(clipId, 'scheduled', { scheduledAt });
      } catch (e) {
        console.warn('[ScheduleQueue] update clip status fail', e);
      }
    }

    console.log('[ScheduleQueue] schedule', queueId, 'at', scheduledAt);
    return entry;
  }

  // ===== ยกเลิกตาราง =====
  async function cancel(queueId) {
    const all = await loadAll();
    const idx = all.findIndex(e => e.queueId === queueId);
    if (idx < 0) return false;
    const entry = all[idx];

    await chrome.alarms.clear(ALARM_PREFIX + queueId);

    entry.status = 'canceled';
    await chrome.storage.local.set({ [STORAGE_KEY]: all });

    if (window.ClipWarehouse && entry.clipId) {
      try {
        await window.ClipWarehouse.setStatus(entry.clipId, 'approved', { scheduledAt: null });
      } catch (e) { /* ignore */ }
    }
    return true;
  }

  async function reschedule(queueId, newScheduledAt) {
    await cancel(queueId);
    const all = await loadAll();
    const old = all.find(e => e.queueId === queueId);
    if (!old) throw new Error('ไม่พบ queueId');
    return schedule({
      clipId: old.clipId,
      target: old.target,
      scheduledAt: newScheduledAt,
      caption: old.caption,
      seriesId: old.seriesId,
      episodeIndex: old.episodeIndex,
      hospitalContext: old.hospitalContext
    });
  }

  // ===== สร้างตารางแบบ "ทุกวันเวลา X เป็นเวลา N วัน" =====
  // เหมาะกับ series 7-30 ตอน
  async function scheduleSeriesRecurring({
    clipIds,         // array ของ clipId เรียงตาม episode
    target,
    startAt,         // ISO string ของตอนแรก
    intervalHours = 24,
    seriesId,
    captionsPerEpisode = []
  }) {
    if (!Array.isArray(clipIds) || clipIds.length === 0) {
      throw new Error('ต้องระบุ clipIds');
    }
    const results = [];
    let t = new Date(startAt).getTime();
    for (let i = 0; i < clipIds.length; i++) {
      const entry = await schedule({
        clipId: clipIds[i],
        target,
        scheduledAt: new Date(t).toISOString(),
        caption: captionsPerEpisode[i] || '',
        seriesId,
        episodeIndex: i + 1
      });
      results.push(entry);
      t += intervalHours * 3600 * 1000;
    }
    return results;
  }

  async function loadAll() {
    const data = await chrome.storage.local.get([STORAGE_KEY]);
    return data[STORAGE_KEY] || [];
  }

  async function getById(queueId) {
    const all = await loadAll();
    return all.find(e => e.queueId === queueId) || null;
  }

  async function listUpcoming() {
    const all = await loadAll();
    const now = Date.now();
    return all
      .filter(e => e.status === 'scheduled' && new Date(e.scheduledAt).getTime() > now)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  }

  async function listHistory() {
    const all = await loadAll();
    return all
      .filter(e => ['posted', 'failed', 'canceled'].includes(e.status))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // ===== อัปเดตสถานะ (เรียกจาก service-worker เมื่อ alarm fire) =====
  async function markFired(queueId) {
    return _updateStatus(queueId, 'fired');
  }
  async function markPosted(queueId) {
    return _updateStatus(queueId, 'posted', { postedAt: new Date().toISOString() });
  }
  async function markFailed(queueId, errorMessage) {
    return _updateStatus(queueId, 'failed', {
      lastError: errorMessage,
      attempts: (await getById(queueId))?.attempts + 1 || 1
    });
  }

  async function _updateStatus(queueId, status, extra = {}) {
    const all = await loadAll();
    const idx = all.findIndex(e => e.queueId === queueId);
    if (idx < 0) return false;
    all[idx] = { ...all[idx], status, ...extra };
    await chrome.storage.local.set({ [STORAGE_KEY]: all });
    return all[idx];
  }

  // ===== ลบรายการที่เสร็จแล้ว (cleanup) =====
  async function cleanup(olderThanDays = 30) {
    const all = await loadAll();
    const cutoff = Date.now() - olderThanDays * 86400 * 1000;
    const keep = all.filter(e => {
      const t = new Date(e.createdAt).getTime();
      return e.status === 'scheduled' || t > cutoff;
    });
    await chrome.storage.local.set({ [STORAGE_KEY]: keep });
    return all.length - keep.length;
  }

  return {
    schedule,
    cancel,
    reschedule,
    scheduleSeriesRecurring,
    loadAll,
    getById,
    listUpcoming,
    listHistory,
    markFired,
    markPosted,
    markFailed,
    cleanup,
    ALARM_PREFIX
  };
})();

window.ScheduleQueue = ScheduleQueue;
console.log('[ScheduleQueue] loaded');
