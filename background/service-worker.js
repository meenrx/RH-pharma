// =====================================================
// RH Pharma - Service Worker (v0.10.0)
// =====================================================
// 1. เปิด Side Panel ตอนคลิกไอคอน
// 2. รับ message จาก side panel + content scripts
// 3. จัดการ chrome.alarms — Schedule Queue
// 4. จัดการ chrome.downloads — save infographic/video/audio
// 5. เปิด tab ปลายทาง (FB composer / TikTok Studio / Flow)
// =====================================================

console.log('[RH Pharma] Service worker started v0.10.0');

const ALARM_PREFIX = 'rh-pharma-post-';
const STORAGE_QUEUE_KEY = 'rhPharmaScheduledPosts';
const STORAGE_SETTINGS_KEY = 'rhPharmaSettings';

// =====================================================
// SIDE PANEL: เปิดเมื่อคลิกไอคอน
// =====================================================
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err) => console.error('Side panel error:', err));

// =====================================================
// FIRST INSTALL / UPGRADE
// =====================================================
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[RH Pharma] ติดตั้งครั้งแรก กำลังตั้งค่าเริ่มต้น...');
    await chrome.storage.local.set({
      [STORAGE_SETTINGS_KEY]: {
        // AI Provider
        aiProvider: 'openai',
        openaiApiKey: '',
        openaiModel: 'gpt-4o-mini',
        geminiApiKey: '',
        geminiModel: 'gemini-2.5-flash',
        claudeApiKey: '',
        claudeModel: 'claude-haiku-4-5',

        // ผู้ใช้
        defaultAudience: 'public',
        defaultLanguage: 'th',

        // ความปลอดภัย
        approvalMode: true,           // บังคับ approve ก่อนโพสต์ (ON เสมอ)
        contentValidator: true,       // เช็คคำต้องห้าม
        autoDisclaimer: true,         // ใส่ disclaimer อัตโนมัติ
        autoBranding: true,           // ใส่ branding รพ. อัตโนมัติ

        // Branding (รพ. ใดก็ปรับได้)
        hospitalName: 'โรงพยาบาลรือเสาะ',
        department: 'กลุ่มงานเภสัชกรรม',
        phoneNumber: '073-571-444',
        hashtag: '#รพรือเสาะ #เภสัชกรรม #ความรู้สุขภาพ',
        defaultDisclaimer: 'ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำเฉพาะบุคคล โปรดปรึกษาเภสัชกร/แพทย์',

        // ความเป็นส่วนตัว
        blurOnRecord: true,
        antiDetect: true,
        delayMin: 600,
        delayMax: 1500,

        // Theme
        theme: 'dark'
      },
      rhPharmaTopics: [],
      rhPharmaPosts: [],
      rhPharmaSeries: [],
      [STORAGE_QUEUE_KEY]: [],
      rhPharmaInstalledAt: new Date().toISOString(),
      rhPharmaVersion: '0.10.0'
    });
    console.log('[RH Pharma] ตั้งค่าเริ่มต้นสำเร็จ! 🎉');
  } else if (details.reason === 'update') {
    const ver = chrome.runtime.getManifest().version;
    console.log('[RH Pharma] อัปเดตเป็น v', ver);
    // upgrade settings ที่ขาด (ไม่ทับของเดิม)
    const data = await chrome.storage.local.get([STORAGE_SETTINGS_KEY]);
    const s = data[STORAGE_SETTINGS_KEY] || {};
    const patch = {};
    if (s.phoneNumber === undefined) patch.phoneNumber = '073-571-444';
    if (s.autoBranding === undefined) patch.autoBranding = true;
    if (s.autoDisclaimer === undefined) patch.autoDisclaimer = true;
    if (s.approvalMode === undefined) patch.approvalMode = true;
    if (s.contentValidator === undefined) patch.contentValidator = true;
    if (Object.keys(patch).length) {
      await chrome.storage.local.set({ [STORAGE_SETTINGS_KEY]: { ...s, ...patch } });
      console.log('[RH Pharma] upgrade settings:', Object.keys(patch).join(', '));
    }
    await chrome.storage.local.set({ rhPharmaVersion: ver });
  }
});

// =====================================================
// MESSAGE HANDLER
// =====================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[RH Pharma BG] รับ message:', message.action);

  switch (message.action) {
    case 'openFacebookComposer':
      chrome.tabs.create({ url: 'https://business.facebook.com/latest/composer' })
        .then(tab => sendResponse({ success: true, tabId: tab.id }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'openTikTokUpload':
      chrome.tabs.create({ url: 'https://www.tiktok.com/tiktokstudio/upload' })
        .then(tab => sendResponse({ success: true, tabId: tab.id }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'openFlowTab': {
      const flowUrl = message.url || 'https://labs.google/fx/tools/flow';
      chrome.tabs.create({ url: flowUrl, active: true })
        .then(tab => sendResponse({ success: true, tabId: tab.id }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;
    }

    case 'downloadImage':
      if (message.dataUrl && message.filename) {
        chrome.downloads.download({
          url: message.dataUrl,
          filename: message.filename,
          saveAs: false
        });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'missing dataUrl/filename' });
      }
      break;

    // ===== Post to FB ผ่าน side panel → background → content =====
    case 'postToFacebookViaTab': {
      (async () => {
        try {
          // เปิด composer ก่อน
          const tab = await chrome.tabs.create({
            url: 'https://business.facebook.com/latest/composer',
            active: true
          });
          // รอให้ content script load
          await waitForTabComplete(tab.id, 30000);
          await sleep(2500);
          // ส่ง message ไปให้ content script
          const result = await chrome.tabs.sendMessage(tab.id, {
            action: 'postToFacebook',
            blob: message.blob,
            mimeType: message.mimeType,
            filename: message.filename,
            caption: message.caption,
            requireApproval: message.requireApproval
          });
          sendResponse(result);
        } catch (err) {
          console.error('[BG] postToFacebookViaTab error', err);
          sendResponse({ success: false, error: err.message });
        }
      })();
      return true;
    }

    case 'postToTikTokViaTab': {
      (async () => {
        try {
          const tab = await chrome.tabs.create({
            url: 'https://www.tiktok.com/tiktokstudio/upload',
            active: true
          });
          await waitForTabComplete(tab.id, 30000);
          await sleep(3000);
          const result = await chrome.tabs.sendMessage(tab.id, {
            action: 'postToTikTok',
            blob: message.blob,
            mimeType: message.mimeType,
            filename: message.filename,
            caption: message.caption,
            requireApproval: message.requireApproval
          });
          sendResponse(result);
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
      })();
      return true;
    }

    // ===== Notification (ตอน alarm fire) =====
    case 'showNotification': {
      try {
        chrome.notifications.create('', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('assets/icon128.png'),
          title: message.title || 'RH Pharma',
          message: message.body || '',
          priority: 2
        });
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      break;
    }

    default:
      sendResponse({ error: 'Unknown action: ' + message.action });
  }

  return true;
});

// =====================================================
// CHROME.ALARMS — Schedule Queue
// =====================================================
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith(ALARM_PREFIX)) return;
  const queueId = alarm.name.slice(ALARM_PREFIX.length);
  console.log('[RH Pharma] alarm fired:', queueId);

  try {
    // โหลด queue entry
    const data = await chrome.storage.local.get([STORAGE_QUEUE_KEY]);
    const queue = data[STORAGE_QUEUE_KEY] || [];
    const entry = queue.find(e => e.queueId === queueId);
    if (!entry || entry.status !== 'scheduled') {
      console.warn('[RH Pharma] queue entry หาย/ถูกยกเลิก:', queueId);
      return;
    }

    // mark fired
    entry.status = 'fired';
    await chrome.storage.local.set({ [STORAGE_QUEUE_KEY]: queue });

    // Notification เตือนให้กลับมาเปิด side panel เพื่อทำ approval flow
    chrome.notifications.create('', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icon128.png'),
      title: '⏰ RH Pharma — ถึงเวลาโพสต์',
      message: `เนื้อหา queue ${queueId.slice(0, 12)} ถึงเวลาแล้ว เปิด side panel เพื่อตรวจสอบ + ยืนยันโพสต์`,
      priority: 2,
      requireInteraction: true
    });
  } catch (err) {
    console.error('[RH Pharma] alarm handle error', err);
  }
});

// =====================================================
// Helpers
// =====================================================
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function waitForTabComplete(tabId, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (Date.now() - start > timeout) return reject(new Error('tab load timeout'));
      chrome.tabs.get(tabId).then(t => {
        if (t.status === 'complete') return resolve();
        setTimeout(check, 500);
      }).catch(reject);
    };
    check();
  });
}
