// =====================================================
// RH Pharma — Clip Warehouse (v0.10.0)
// =====================================================
// คลังสื่อสุขภาพรอโพสต์ — เก็บใน IndexedDB ได้สูงสุด 200 ชิ้น
// รองรับทั้งรูป (PNG/JPG) และวิดีโอ (MP4/WebM)
// ใช้สำหรับ:
//   1. เก็บผลลัพธ์จาก Flow / Nano Banana / สร้างเอง
//   2. รอ approve ก่อนโพสต์ลง FB/TikTok
//   3. Schedule Queue หยิบไปโพสต์ตามตาราง
// แรงบันดาลใจ: KruBank ClipWarehouse — เขียนใหม่ทั้งหมดให้เหมาะกับงานเภสัช
// =====================================================

const ClipWarehouse = (() => {
  const DB_NAME = 'RHPharmaWarehouse';
  const STORE_MEDIA = 'media';
  const DB_VERSION = 1;
  const MAX_ITEMS = 200;

  let _db = null;

  function open() {
    return new Promise((resolve, reject) => {
      if (_db) return resolve(_db);
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_MEDIA)) {
          const store = db.createObjectStore(STORE_MEDIA, {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('addedAt', 'addedAt', { unique: false });
          store.createIndex('topicId', 'topicId', { unique: false });
          store.createIndex('mediaType', 'mediaType', { unique: false });
          store.createIndex('audience', 'audience', { unique: false });
        }
      };

      req.onsuccess = (e) => {
        _db = e.target.result;
        console.log('[ClipWarehouse] DB opened');
        resolve(_db);
      };

      req.onerror = (e) => {
        console.error('[ClipWarehouse] DB error', e.target.error);
        reject(e.target.error);
      };
    });
  }

  function tx(mode = 'readonly') {
    return _db.transaction(STORE_MEDIA, mode).objectStore(STORE_MEDIA);
  }

  async function getCount() {
    await open();
    return new Promise((resolve, reject) => {
      const req = tx('readonly').count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function addItem(item) {
    await open();
    if (await getCount() >= MAX_ITEMS) {
      throw new Error(`คลังเต็มแล้ว (สูงสุด ${MAX_ITEMS} ชิ้น) — ลบของที่โพสต์แล้วก่อน`);
    }
    return new Promise((resolve, reject) => {
      const store = tx('readwrite');
      const record = {
        topicId: item.topicId || '',
        topicTitle: item.topicTitle || '',
        audience: item.audience || 'public',
        language: item.language || 'th',
        mediaType: item.mediaType,         // 'image' | 'video' | 'audio'
        mimeType: item.blob.type,
        size: item.blob.size,
        blob: item.blob,
        thumbnailDataUrl: item.thumbnailDataUrl || null,
        caption: item.caption || '',
        hashtags: item.hashtags || '',
        disclaimer: item.disclaimer || '',
        target: item.target || 'facebook', // 'facebook' | 'tiktok' | 'line' | 'manual'
        status: item.status || 'waiting',  // waiting | approved | scheduled | posted | failed
        scheduledAt: item.scheduledAt || null,
        postedAt: null,
        errorMessage: null,
        addedAt: new Date().toISOString(),
        source: item.source || 'manual',   // manual | flow | nano-banana | template
        meta: item.meta || {}
      };
      const req = store.add(record);
      req.onsuccess = () => {
        record.id = req.result;
        console.log('[ClipWarehouse] เพิ่ม:', record.topicTitle, record.mediaType);
        resolve(record);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function getAll(filter = {}) {
    await open();
    return new Promise((resolve, reject) => {
      const req = tx('readonly').getAll();
      req.onsuccess = () => {
        let items = req.result.map(stripBlob);
        if (filter.status) items = items.filter(x => x.status === filter.status);
        if (filter.mediaType) items = items.filter(x => x.mediaType === filter.mediaType);
        if (filter.target) items = items.filter(x => x.target === filter.target);
        items.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function getItem(id) {
    await open();
    return new Promise((resolve, reject) => {
      const req = tx('readonly').get(Number(id));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function getBlob(id) {
    const item = await getItem(id);
    if (!item) throw new Error('ไม่พบสื่อ id=' + id);
    return item.blob;
  }

  async function updateItem(id, patch) {
    await open();
    return new Promise((resolve, reject) => {
      const store = tx('readwrite');
      const getReq = store.get(Number(id));
      getReq.onsuccess = () => {
        const rec = getReq.result;
        if (!rec) return reject(new Error('ไม่พบ id=' + id));
        Object.assign(rec, patch);
        const putReq = store.put(rec);
        putReq.onsuccess = () => resolve(stripBlob(rec));
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function setStatus(id, status, extra = {}) {
    const patch = { status, ...extra };
    if (status === 'posted') patch.postedAt = new Date().toISOString();
    return updateItem(id, patch);
  }

  async function removeItem(id) {
    await open();
    return new Promise((resolve, reject) => {
      const req = tx('readwrite').delete(Number(id));
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function removePosted() {
    const posted = await getAll({ status: 'posted' });
    for (const item of posted) await removeItem(item.id);
    return posted.length;
  }

  async function clearAll() {
    await open();
    return new Promise((resolve, reject) => {
      const req = tx('readwrite').clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function getStats() {
    const all = await getAll();
    const stats = { total: all.length, waiting: 0, approved: 0, scheduled: 0, posted: 0, failed: 0 };
    for (const item of all) stats[item.status] = (stats[item.status] || 0) + 1;
    return stats;
  }

  function stripBlob(rec) {
    if (!rec) return null;
    const { blob, ...rest } = rec;
    return { ...rest, hasBlob: !!blob };
  }

  return {
    open,
    addItem,
    getAll,
    getItem,
    getBlob,
    updateItem,
    setStatus,
    removeItem,
    removePosted,
    clearAll,
    getCount,
    getStats,
    MAX_ITEMS
  };
})();

window.ClipWarehouse = ClipWarehouse;
console.log('[ClipWarehouse] loaded');
